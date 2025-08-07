import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.post('/api/code', (req: Request, res: Response) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required.' });
  }

  const uniqueId = uuidv4();
  const cppFilePath = path.join(tempDir, `${uniqueId}.cpp`);
  const exePath = path.join(tempDir, `${uniqueId}.exe`);

  fs.writeFile(cppFilePath, code, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ error: 'Failed to write code to file.' });
    }

    const compileCommand = `g++ "${cppFilePath}" -o "${exePath}" -std=c++17`;
    exec(compileCommand, (compileError, stdout, stderr) => {
      if (compileError) {
        console.error('Compilation Error:', stderr);
        fs.unlink(cppFilePath, () => {}); // Clean up .cpp file on compile error
        return res.status(200).json({ output: stderr, error: true });
      }

      const child = exec(`"${exePath}"`, (runError, runStdout, runStderr) => {
        // Always clean up both files after execution
        fs.unlink(cppFilePath, () => {});
        fs.unlink(exePath, () => {});

        if (runError) {
          console.error('Runtime Error:', runStderr);
          return res.status(200).json({ output: runStderr, error: true });
        }
        
        res.json({ output: runStdout });
      });

      // Pass input to the process, and critically, close the stdin stream
      // to signal that no more input is coming. This prevents the child
      // process from hanging indefinitely if it expects input but none is given.
      if (input) {
        child.stdin?.write(input);
      }
      child.stdin?.end();
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
