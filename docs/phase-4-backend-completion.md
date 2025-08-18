# Backend Implementation & Testing

This document summarizes the completed backend work, including the final API endpoints and the corresponding test suite that validates their functionality.

---

## 1. Implemented API Endpoints

The following API endpoints have been implemented and are fully functional.

### `GET /api/problems`

- **Description:** Retrieves a simplified list of all available problems, suitable for display in a sidebar or list view.
- **Response Body:** An array of problem objects, each containing `id`, `title`, and `difficulty`.
- **Example:** `[{ "id": "weird-algorithm", "title": "Weird Algorithm", "difficulty": "Easy" }]`

### `GET /api/problems/:problemId`

- **Description:** Fetches the full details for a single problem, specified by its `problemId`.
- **Response Body:** A single problem object containing `id`, `title`, `description`, `difficulty`, and `timeLimit`.
- **Error Handling:** Returns a `404 Not Found` if the `problemId` does not exist.

### `POST /api/run`

- **Description:** Compiles and executes a piece of C++ code with user-provided input. This is used for the "Run" functionality in the IDE, allowing for quick tests with custom data.
- **Request Body:** `{ "code": "...", "input": "..." }`
- **Response Body:**
    - On success: `{ "output": "..." }`
    - On compilation or runtime error: `{ "output": "...", "error": true }`

### `POST /api/submit/:problemId`

- **Description:** Submits code for a specific problem to be judged against a set of predefined, official test cases.
- **Request Body:** `{ "code": "..." }`
- **Response Body:** A JSON object indicating the verdict.
    - `{ "verdict": "Accepted" }`
    - `{ "verdict": "Wrong Answer", "testCase": 1 }`
    - `{ "verdict": "Time Limit Exceeded", "testCase": 1 }`
    - `{ "verdict": "Compilation Error", "error": "..." }`
    - `{ "verdict": "Runtime Error", "error": "..." }`
- **Error Handling:** Returns a `404 Not Found` if the `problemId` does not exist.

---

## 2. Backend Testing

A comprehensive test suite has been developed using Jest and Supertest to ensure the reliability and correctness of the backend API. The test file is located at `server/__tests__/api.test.ts`.

### Test Coverage:

-   **`GET /api/problems`**:
    -   Ensures a successful response (200 OK).
    -   Verifies that the response is an array of problems with the correct simplified structure.

-   **`GET /api/problems/:problemId`**:
    -   Tests retrieving a valid, existing problem.
    -   Tests requesting a non-existent problem, ensuring a `404 Not Found` response.

-   **`POST /api/run`**:
    -   Tests running valid code with input, checking for the correct output.
    -   Tests submitting intentionally incorrect code to verify that a compilation error is correctly reported.

-   **`POST /api/submit/:problemId`**:
    -   **Accepted:** Submits a correct solution and asserts the verdict is "Accepted".
    -   **Wrong Answer:** Submits an incorrect solution and asserts the verdict is "Wrong Answer" on the first test case.
    -   **Compilation Error:** Submits code with syntax errors and asserts the verdict is "Compilation Error".
    -   **Time Limit Exceeded:** Submits an infinite loop and asserts the verdict is "Time Limit Exceeded".
    -   **Not Found:** Tests submitting to a non-existent problem ID, ensuring a `404 Not Found` response.

### Test Execution

The tests can be run from the project root using the command:

```bash
pnpm --filter server test
```
