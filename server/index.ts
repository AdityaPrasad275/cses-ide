import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Read problems into memory once at startup
const problemsPath = path.join(__dirname, 'problems.json');
const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));

app.get('/api/problems', (req: Request, res: Response) => {
  // Send a simplified list of problems
  const problemList = problems.map((p: any) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
  }));
  res.json(problemList);
});

app.get('/api/problems/:problemId', (req: Request, res: Response) => {
  const problemId = req.params.problemId;
  const problem = problems.find((p: any) => p.id === problemId);
  if (problem) {
    res.json(problem);
  } else {
    res.status(404).json({ error: 'Problem not found.' });
  }
});

app.post('/api/submit/:problemId', async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const { code } = req.body;

  const problem = problems.find((p: any) => p.id === problemId);

  if (!code) {
    return res.status(400).json({ error: 'Code is required.' });
  }
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found.' });
  }

  const uniqueId = uuidv4();
  const cppFilePath = path.join(tempDir, `${uniqueId}.cpp`);
  const exePath = path.join(tempDir, `${uniqueId}.exe`);

  try {
    await fs.promises.writeFile(cppFilePath, code);

    // Compilation
    try {
      await new Promise<void>((resolve, reject) => {
        const compileCommand = `g++ "${cppFilePath}" -o "${exePath}" -std=c++17`;
        exec(compileCommand, (error, stdout, stderr) => {
          if (error) {
            (error as any).stderr = stderr;
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error: any) {
      console.error('Compilation Error:', error.stderr);
      await cleanup([cppFilePath]);
      return res.json({ verdict: 'Compilation Error', error: error.stderr });
    }

    // Test case execution
    const testCaseDir = path.join(__dirname, '..', 'testcases', problemId);
    const testCaseFiles = fs.readdirSync(testCaseDir).filter(file => file.endsWith('.in'));
    
    // Sort test cases numerically
    testCaseFiles.sort((a, b) => parseInt(a) - parseInt(b));

    for (let i = 0; i < testCaseFiles.length; i++) {
      const testCaseFile = testCaseFiles[i];
      const testCaseNum = i + 1;
      
      const inFilePath = path.join(testCaseDir, testCaseFile);
      const ansFilePath = path.join(testCaseDir, testCaseFile.replace('.in', '.ans'));

      const input = await fs.promises.readFile(inFilePath, 'utf-8');
      const expectedOutput = await fs.promises.readFile(ansFilePath, 'utf-8');

      const executionResult = await new Promise<{verdict: string, output?: string, error?: string}>(resolve => {
        const child: ChildProcess = exec(`"${exePath}"`);
        let timedOut = false;
        let stdout = '';
        let stderr = '';

        const timeout = setTimeout(() => {
          timedOut = true;
          if (child.pid) {
            if (process.platform === 'win32') {
              exec(`taskkill /pid ${child.pid} /f /t`);
            } else {
              child.kill('SIGKILL');
            }
          }
        }, (problem.timeLimit || 1) * 1000);

        child.stdout?.on('data', (data) => { stdout += data.toString(); });
        child.stderr?.on('data', (data) => { stderr += data.toString(); });

        child.on('close', (code) => {
          clearTimeout(timeout);
          if (timedOut) {
            resolve({ verdict: 'Time Limit Exceeded' });
          } else if (code !== 0) {
            resolve({ verdict: 'Runtime Error', error: stderr });
          } else {
            resolve({ verdict: 'Passed', output: stdout });
          }
        });

        child.stdin?.write(input);
        child.stdin?.end();
      });

      if (executionResult.verdict !== 'Passed') {
        await cleanup([cppFilePath, exePath]);
        return res.json({ verdict: executionResult.verdict, testCase: testCaseNum });
      }
      
      const actualOutput = executionResult.output?.trim().replace(/\r\n/g, '\n');
      const normalizedExpectedOutput = expectedOutput.trim().replace(/\r\n/g, '\n');

      if (actualOutput !== normalizedExpectedOutput) {
        await cleanup([cppFilePath, exePath]);
        return res.json({ verdict: 'Wrong Answer', testCase: testCaseNum });
      }
    }

    await cleanup([cppFilePath, exePath]);
    res.json({ verdict: 'Accepted' });

  } catch (error: any) {
    await cleanup([cppFilePath, exePath]);
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const cleanup = async (files: string[]) => {
  for (const file of files) {
    try {
      await fs.promises.unlink(file);
    } catch (e) {
      // Ignore errors
    }
  }
};

app.post('/api/run', async (req: Request, res: Response) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required.' });
  }

  const uniqueId = uuidv4();
  const cppFilePath = path.join(tempDir, `${uniqueId}.cpp`);
  const exePath = path.join(tempDir, `${uniqueId}.exe`);

  try {
    await fs.promises.writeFile(cppFilePath, code);

    await new Promise<void>((resolve, reject) => {
      const compileCommand = `g++ "${cppFilePath}" -o "${exePath}" -std=c++17`;
      exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Compilation Error:', stderr);
          (error as any).stderr = stderr;
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const child: ChildProcess = exec(`"${exePath}"`);
    let timedOut = false;
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      timedOut = true;
      // Forcefully kill the process
      if (child.pid) {
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${child.pid} /f /t`);
        } else {
          child.kill('SIGKILL');
        }
      }
    }, 5000);

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', async (code) => {
      clearTimeout(timeout);
      await cleanup([cppFilePath, exePath]);

      if (timedOut) {
        res.status(200).json({ output: 'Execution timed out after 5 seconds.', error: true });
      } else if (code !== 0) { // Check for non-zero exit code for runtime errors
        res.status(200).json({ output: stderr || 'Runtime error', error: true });
      } else {
        res.status(200).json({ output: stdout });
      }
    });

    if (input) {
      child.stdin?.write(input);
    }
    child.stdin?.end();

  } catch (error: any) {
    await cleanup([cppFilePath, exePath]);
    if (error.stderr) {
      res.status(200).json({ output: error.stderr, error: true });
    } else {
      console.error('Internal Server Error:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;


