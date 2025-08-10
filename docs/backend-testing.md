# Backend Testing Documentation

This document details the testing setup and strategy for the Node.js/Express backend server.

---

## 1. Frameworks and Libraries

As outlined in the initial testing plan, we chose the following tools:

-   **[Jest](https://jestjs.io/):** A popular and comprehensive testing framework for JavaScript. It provides the test runner, assertion library, and mocking capabilities all in one package. We use `ts-jest` to allow Jest to run tests written in TypeScript directly.
-   **[Supertest](https://github.com/ladjs/supertest):** A library designed specifically for testing Node.js HTTP servers. It allows us to make requests to our Express application without needing to run it on a live network port, making tests faster and more reliable.

---

## 2. Setup and Configuration

### a. Dependencies

The following development dependencies were installed in the `server/` directory:

```bash
pnpm add -D jest supertest ts-jest @types/jest @types/supertest
```

-   `jest` & `supertest`: The core libraries.
-   `ts-jest`: The TypeScript preprocessor for Jest.
-   `@types/*`: TypeScript type definitions for better autocompletion and type safety in tests.

### b. Jest Configuration

A `jest.config.js` file was created in `server/` to tell Jest how to handle our project:

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

-   `preset: 'ts-jest'`: This is the key setting that enables Jest to understand and run our TypeScript test files.
-   `testEnvironment: 'node'`: This tells Jest that the tests will be running in a Node.js environment.

### c. Package Script

To make running tests easy, a `test` script was added to `server/package.json`:

```json
"scripts": {
  "test": "jest"
}
```

Now, we can run all backend tests with the command `pnpm test`.

---

## 3. Test Implementation

### a. Making the App Testable

To test our Express application, we needed to import it into our test files. However, the original `index.ts` file immediately started the server by calling `app.listen()`. This would cause issues in a test environment.

To fix this, `server/index.ts` was modified to only start the server when it's *not* in a test environment. The `app` object was then exported.

**Original Code:**
```typescript
// ... app setup ...

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

**Modified Code:**
```typescript
// ... app setup ...

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app; // Export for testing
```
This change allows us to import `app` in our tests without it trying to start a live server.

### b. The Test File: `__tests__/api.test.ts`

All tests for our API are located in `server/__tests__/api.test.ts`. Here’s a breakdown of what we test:

1.  **Bad Request (400):**
    -   **What:** We send a request to `/api/code` *without* the required `code` field.
    -   **How:** `request(app).post('/api/code').send({ input: '5' })`
    -   **Expected:** The server should respond with a `400 Bad Request` status and a specific error message.

2.  **Successful Code Execution (Happy Path):**
    -   **What:** We send valid C++ code that reads from standard input and prints to standard output.
    -   **How:** `request(app).post('/api/code').send({ code: '...', input: '5' })`
    -   **Expected:** The server should respond with a `200 OK` status, and the `output` field in the JSON response should match the program's expected output (`"Hello, World! 5"`).

3.  **Compilation Error:**
    -   **What:** We send C++ code with a syntax error (e.g., a missing semicolon).
    -   **How:** `request(app).post('/api/code').send({ code: '...' })`
    -   **Expected:** The server should respond with a `200 OK` status, but the response body should contain an `error: true` flag and the compilation error message from `g++`.

4.  **Runtime Error:**
    -   **What:** We send code that compiles successfully but will crash when run (e.g., dereferencing a null pointer).
    -   **How:** `request(app).post('/api/code').send({ code: '...' })`
    -   **Expected:** The server should catch the error and respond with a `200 OK` status and an `error: true` flag.

### c. Ensuring Cleanliness: File System Integrity

A critical part of the tests is to ensure the server cleans up after itself. The server creates temporary `.cpp` and `.exe` files for each request, and these must be deleted.

-   **`afterEach` Hook:** Jest's `afterEach` function runs after every single test in the file. We use it to manually clear the `temp/` directory, ensuring that tests are isolated from each other.
-   **`checkLeftoverFiles` Helper:** This custom function is called at the end of each test case. It reads the `temp/` directory and fails the test if any temporary files from the request are still present. This verifies that our server's cleanup logic is working correctly for every scenario.
