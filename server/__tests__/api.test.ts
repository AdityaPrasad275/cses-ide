import request from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../temp');

// Helper function to check for leftover files
const checkLeftoverFiles = (done: jest.DoneCallback) => {
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      // If tempDir doesn't exist, that's good.
      if (err.code === 'ENOENT') {
        return done();
      }
      return done(err);
    }
    // Filter out .gitkeep or other placeholder files
    const leftoverFiles = files.filter(f => f !== '.gitkeep');
    if (leftoverFiles.length > 0) {
      return done(new Error(`Test failed: Leftover files in temp directory: ${leftoverFiles.join(', ')}`));
    }
    done();
  });
};


describe('POST /api/code', () => {

  afterEach((done: jest.DoneCallback) => {
    // Clean up temp directory after each test
    fs.readdir(tempDir, (err, files) => {
      if (err) return done(); // Directory likely doesn't exist, which is fine
      for (const file of files) {
        // Keep .gitkeep file if it exists
        if (file !== '.gitkeep') {
          fs.unlink(path.join(tempDir, file), () => {});
        }
      }
      done();
    });
  });

  it('should return 400 if code is not provided', async () => {
    const res = await request(app)
      .post('/api/code')
      .send({ input: '5' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Code is required.');
  });

  it('should execute valid C++ code and return the correct output', (done: jest.DoneCallback) => {
    const code = `
      #include <iostream>
      int main() {
        int a;
        std::cin >> a;
        std::cout << "Hello, World! " << a;
        return 0;
      }
    `;
    const input = '5';

    request(app)
      .post('/api/code')
      .send({ code, input })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.output).toBe('Hello, World! 5');
        expect(res.body.error).toBeUndefined();
        checkLeftoverFiles(done);
      });
  });

  it('should return a compilation error for invalid C++ code', (done: jest.DoneCallback) => {
    const code = `
      #include <iostream>
      int main() {
        std::cout << "Hello, World!" // Missing semicolon
        return 0;
      }
    `;

    request(app)
      .post('/api/code')
      .send({ code })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe(true);
        expect(res.body.output).toContain('error:');
        checkLeftoverFiles(done);
      });
  });

  it('should handle runtime errors gracefully', (done: jest.DoneCallback) => {
    const code = `
      #include <iostream>
      int main() {
        int* p = nullptr;
        *p = 10; // This will cause a runtime error (segmentation fault)
        std::cout << "This will not be printed";
        return 0;
      }
    `;

    request(app)
      .post('/api/code')
      .send({ code })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.error).toBe(true);
        checkLeftoverFiles(done);
      });
  });
});