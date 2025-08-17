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

app.post('/api/code', async (req: Request, res: Response) => {
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


