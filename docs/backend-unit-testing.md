# Backend Unit & Integration Testing

This document outlines the unit and integration testing strategy for the Express.js backend server, using [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest).

## Overview

The backend tests are crucial for verifying the correctness of the API endpoints in isolation, without needing to run the entire frontend application. These tests ensure that the server's logic for code compilation, execution, timeout, and file cleanup is robust and reliable.

The tests are located in the `server/__tests__/` directory.

## Running the Tests

To run the backend test suite, navigate to the `server` directory and execute the following command:

```bash
cd server
npm test
```

Jest will discover and run all test files, providing a summary of the results.

## Test Scenarios

The primary test file, `server/__tests__/api.test.ts`, focuses on the `/api/code` endpoint and covers these critical cases:

-   **Invalid Requests**: Ensures the API returns a `400` status code if the request body is missing the required `code` field.
-   **Successful Code Execution**: Verifies that valid C++ code is compiled and executed correctly, returning the expected output.
-   **Compilation Errors**: Checks that the API correctly captures and returns compilation errors for invalid C++ code.
-   **Runtime Errors**: Confirms that the server gracefully handles code that crashes during execution (e.g., due to a segmentation fault) and reports it as an error.
-   **Execution Timeout**: Tests the 5-second execution timeout by sending code with an infinite loop, verifying that the API responds with a timeout error.
-   **File Cleanup**: Each test case verifies that the temporary `.cpp` and `.exe` files created during the process are successfully deleted after execution, even if the execution fails or times out.

## Key Implementation Details

-   **`async/await`**: The tests were refactored to use `async/await` syntax. This was a critical fix to prevent race conditions where the test would check for file cleanup before the server's asynchronous cleanup operation had completed.
-   **Forceful Process Termination**: The server logic was updated to use `taskkill` (on Windows) to ensure that timed-out processes are forcefully terminated, preventing locked files and allowing for reliable cleanup.
-   **Error Detection**: The logic for detecting runtime errors was improved to check for non-zero exit codes from the child process, which is a more reliable method than checking `stderr`.
