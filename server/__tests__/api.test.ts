import request from 'supertest';
import app from '../index';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../temp');

// Helper function to check for leftover files, now async
const checkLeftoverFiles = async () => {
  try {
    const files = await fs.promises.readdir(tempDir);
    const leftoverFiles = files.filter(f => f !== '.gitkeep');
    if (leftoverFiles.length > 0) {
      throw new Error(`Test failed: Leftover files in temp directory: ${leftoverFiles.join(', ')}`);
    }
  } catch (err: any) {
    // If tempDir doesn't exist, that's good.
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
};

describe('POST /api/code', () => {

  // afterEach is now async
  afterEach(async () => {
    try {
      const files = await fs.promises.readdir(tempDir);
      for (const file of files) {
        if (file !== '.gitkeep') {
          await fs.promises.unlink(path.join(tempDir, file));
        }
      }
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  });

  it('should return 400 if code is not provided', async () => {
    const res = await request(app)
      .post('/api/code')
      .send({ input: '5' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Code is required.');
  });

  it('should execute valid C++ code and return the correct output', async () => {
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

    const res = await request(app)
      .post('/api/code')
      .send({ code, input });
      
    expect(res.status).toBe(200);
    expect(res.body.output).toBe('Hello, World! 5');
    expect(res.body.error).toBeUndefined();
    await checkLeftoverFiles();
  });

  it('should return a compilation error for invalid C++ code', async () => {
    const code = `
      #include <iostream>
      int main() {
        std::cout << "Hello, World!" // Missing semicolon
        return 0;
      }
    `;

    const res = await request(app)
      .post('/api/code')
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(true);
    expect(res.body.output).toContain('error:');
    await checkLeftoverFiles();
  });

  it('should handle runtime errors gracefully', async () => {
    const code = `
      #include <iostream>
      int main() {
        int* p = nullptr;
        *p = 10; // This will cause a runtime error (segmentation fault)
        std::cout << "This will not be printed";
        return 0;
      }
    `;

    const res = await request(app)
      .post('/api/code')
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(true);
    await checkLeftoverFiles();
  });

  it('should time out if the code runs for too long', async () => {
    const code = `
      #include <iostream>
      int main() {
        while(true) {}
        return 0;
      }
    `;

    const res = await request(app)
      .post('/api/code')
      .send({ code });

    expect(res.status).toBe(200);
    expect(res.body.error).toBe(true);
    await checkLeftoverFiles();
  }, 10000); // Increase Jest's timeout

  it('should handle code that expects input when none is given', async () => {
    const code = `
      #include <iostream>
      #include <string>
      int main() {
        std::string name;
        std::cin >> name;
        std::cout << "Hello, " << name << "!";
        return 0;
      }
    `;

    const res = await request(app)
      .post('/api/code')
      .send({ code, input: '' });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe('Hello, !');
    expect(res.body.error).toBeUndefined();
    await checkLeftoverFiles();
  });
});