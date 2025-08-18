import request from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path';

// Correctly point to the server/temp directory from inside __tests__
const tempDir = path.join(__dirname, '..', 'temp');

// Helper to check for leftover files
afterEach(async () => {
  try {
    const files = await fs.promises.readdir(tempDir);
    const leftoverFiles = files.filter(f => f !== '.gitkeep');
    if (leftoverFiles.length > 0) {
      // Cleanup the files before failing the test
      for (const file of leftoverFiles) {
        await fs.promises.unlink(path.join(tempDir, file));
      }
      throw new Error(`Test failed: Leftover files in temp directory: ${leftoverFiles.join(', ')}`);
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return; // Good, directory doesn't exist or is empty.
    }
    throw err;
  }
});

describe('CSES IDE API Endpoints', () => {

  describe('GET /api/problems', () => {
    it('should return a list of problems', async () => {
      const res = await request(app).get('/api/problems');
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      // Check for the simplified problem structure
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('difficulty');
      expect(res.body[0]).not.toHaveProperty('description');
    });
  });

  describe('GET /api/problems/:problemId', () => {
    it('should return full details for a specific problem', async () => {
      const res = await request(app).get('/api/problems/weird-algorithm');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('weird-algorithm');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('timeLimit');
    });

    it('should return 404 for a non-existent problem', async () => {
      const res = await request(app).get('/api/problems/non-existent-problem');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/run', () => {
    it('should execute code with input and return output', async () => {
      const code = `#include <iostream>\nint main() { int n; std::cin >> n; std::cout << n * 2; return 0; }`;
      const res = await request(app)
        .post('/api/run')
        .send({ code, input: '123' });
      expect(res.status).toBe(200);
      expect(res.body.output).toBe('246');
    });

    it('should return a compilation error for invalid code', async () => {
        const code = `#include <iostream>\nint main() { std::cout << "hello" return 0; }`;
        const res = await request(app)
          .post('/api/run')
          .send({ code, input: '' });
        expect(res.status).toBe(200);
        expect(res.body.error).toBe(true);
        expect(res.body.output).toContain('error:');
      });
  });

  describe('POST /api/submit/:problemId', () => {
    const problemId = 'weird-algorithm';

    const acceptedCode = `
      #include <iostream>
      int main() {
        long long n;
        std::cin >> n;
        while (n != 1) {
          std::cout << n << " ";
          if (n % 2 == 0) n /= 2;
          else n = n * 3 + 1;
        }
        std::cout << 1;
        return 0;
      }
    `;

    const wrongAnswerCode = `
      #include <iostream>
      int main() { std::cout << "wrong output"; return 0; }
    `;

    const compileErrorCode = `
      #include <iostream>
      int main() { std::cout << "hello" return 0; }
    `;

    const timeLimitExceededCode = `
      #include <iostream>
      int main() { while(1); return 0; }
    `;

    it('should return { verdict: \'Accepted\' } for a correct solution', async () => {
      const res = await request(app)
        .post(`/api/submit/${problemId}`)
        .send({ code: acceptedCode });
      expect(res.status).toBe(200);
      expect(res.body.verdict).toBe('Accepted');
    }, 15000); // Generous timeout for Jest

    it('should return { verdict: \'Wrong Answer\' } for an incorrect solution', async () => {
      const res = await request(app)
        .post(`/api/submit/${problemId}`)
        .send({ code: wrongAnswerCode });
      expect(res.status).toBe(200);
      expect(res.body.verdict).toBe('Wrong Answer');
      expect(res.body.testCase).toBe(1);
    }, 15000);

    it('should return { verdict: \'Compilation Error\' } for invalid code', async () => {
        const res = await request(app)
          .post(`/api/submit/${problemId}`)
          .send({ code: compileErrorCode });
        expect(res.status).toBe(200);
        expect(res.body.verdict).toBe('Compilation Error');
        expect(res.body.error).toBeDefined();
      }, 15000);

    it('should return { verdict: \'Time Limit Exceeded\' } for a slow solution', async () => {
        const res = await request(app)
          .post(`/api/submit/${problemId}`)
          .send({ code: timeLimitExceededCode });
        expect(res.status).toBe(200);
        expect(res.body.verdict).toBe('Time Limit Exceeded');
        expect(res.body.testCase).toBe(1);
      }, 15000);

      it('should return 404 for a non-existent problem', async () => {
        const res = await request(app)
          .post('/api/submit/non-existent-problem')
          .send({ code: acceptedCode });
        expect(res.status).toBe(404);
      });
  });
});
