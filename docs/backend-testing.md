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

All API tests are located in `server/__tests__/api.test.ts`. The suite uses `supertest` to make requests to the Express app and Jest to structure the tests and make assertions.

Here’s a breakdown of the test coverage for each endpoint:

#### 1. `GET /api/problems`
-   **What:** Tests the endpoint that retrieves the list of all problems.
-   **How:** Makes a `GET` request to `/api/problems`.
-   **Expected:**
    -   A `200 OK` status.
    -   The response body is an array.
    -   Each object in the array has a simplified structure containing `id`, `title`, and `difficulty`, but not the full `description`.

#### 2. `GET /api/problems/:problemId`
-   **What:** Tests fetching the full details for a single, specific problem.
-   **How:**
    -   Makes a `GET` request to a valid problem URL (e.g., `/api/problems/weird-algorithm`).
    -   Makes a `GET` request to a non-existent problem URL.
-   **Expected:**
    -   For a valid ID, a `200 OK` status and the full problem object, including `description` and `timeLimit`.
    -   For an invalid ID, a `404 Not Found` status.

#### 3. `POST /api/run`
-   **What:** Tests the "Run" functionality, which executes code with custom input. This endpoint replaced the legacy `/api/code` endpoint.
-   **How:**
    -   Sends valid C++ code and an `input` string.
    -   Sends C++ code with a syntax error.
-   **Expected:**
    -   For valid code, a `200 OK` status and a body containing the correct `output`.
    -   For invalid code, a `200 OK` status, but with the `error` flag set to `true` and a compilation error message in the `output`.

#### 4. `POST /api/submit/:problemId`
-   **What:** Tests the "Submit" functionality, which judges code against official test cases. This is the most comprehensive set of tests.
-   **How:** Submits different types of code solutions to a valid problem ID (`weird-algorithm`).
-   **Expected Verdicts:**
    -   **`Accepted`**: For a correct solution that passes all test cases.
    -   **`Wrong Answer`**: For a solution that produces incorrect output on a test case. The response includes which test case failed.
    -   **`Compilation Error`**: For code that fails to compile. The response includes the compiler's error message.
    -   **`Time Limit Exceeded`**: For a solution that runs too long (e.g., an infinite loop). The test has a generous timeout (15000ms) to allow the server's timeout logic to trigger first.
    -   **`404 Not Found`**: When submitting to a problem ID that does not exist.

### c. Ensuring Cleanliness: File System Integrity

A critical part of the tests is to ensure the server cleans up after itself. The server creates temporary `.cpp` and `.exe` files in the `server/temp/` directory for each request, and these must be deleted to prevent side effects between tests.

-   **`afterEach` Hook:** Jest's `afterEach` hook runs after every single test in the file.
-   **Logic:** The hook reads the contents of the `server/temp/` directory. It ignores the `.gitkeep` file, which is used to ensure the directory is tracked by Git. If any other files are found, the test suite fails, indicating that the server's cleanup logic for that specific test case did not work correctly. This ensures that every code path (success, compilation error, runtime error, etc.) properly cleans up temporary files. Before failing, the hook attempts to delete the leftover files to ensure subsequent tests can run in a clean environment.