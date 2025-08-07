# CSES IDE - Testing Plan

This document outlines the strategy for implementing a robust testing suite for the CSES IDE project. The goal is to ensure code quality, prevent regressions, and build confidence in the application's correctness.

---

## 1. Guiding Principles

- **Confidence, Not Coverage:** The primary goal is to write tests that give us confidence that the application works as expected. We will focus on critical user paths and business logic rather than aiming for 100% code coverage.
- **Right Tool for the Job:** We will use different testing levels (unit, integration, E2E) and select the best libraries for each part of the stack.
- **Automation:** All tests should be automated and easy to run, both locally during development and potentially in a future CI/CD pipeline.

---

## 2. Frontend (Client) Testing

The client is a Vite + React + TypeScript application. The ideal testing stack is **Vitest** combined with **React Testing Library**.

- **Vitest:** A modern, fast test runner that integrates seamlessly with Vite.
- **React Testing Library:** A library for testing React components by simulating user behavior, ensuring they are accessible and functional from a user's perspective.

### What to Test:

-   **Component Tests:**
    -   Does the `Editor` component load correctly?
    -   Do the `Run` and `Submit` buttons render and are they clickable?
    -   Do the Input/Output text areas display the correct placeholder and state?
-   **User Interaction Tests:**
    -   When a user types in the editor, does the component's state update?
    -   When a user clicks "Run", is the `handleRun` function called?
-   **API Integration Tests:**
    -   Mock the `fetch` call to the backend.
    -   Verify that when "Run" is clicked, the application correctly displays the "Running..." message.
    -   Verify that upon receiving a successful response, the Output area is updated with the program's output.
    -   Verify that upon receiving an error response, the Output area displays the error message.

---

## 3. Backend (Server) Testing

The server is a Node.js + Express + TypeScript application. The recommended stack is **Jest** for the test framework and **Supertest** for testing HTTP endpoints.

- **Jest:** A popular, all-in-one testing framework with built-in assertion and mocking capabilities.
- **Supertest:** A library specifically designed to make testing Node.js HTTP servers easy and declarative.

### What to Test:

The most critical part of the backend is the `/api/code` endpoint. Tests should cover:

-   **Success Scenarios:**
    -   A request with valid C++ code and input returns a `200 OK` status and the correct `stdout` in the response body.
-   **Failure Scenarios:**
    -   A request with code that fails to compile returns a `200 OK` status but with the `stderr` from `g++` in the body and an `error: true` flag.
    -   A request with code that compiles but has a runtime error returns the runtime `stderr`.
    -   A request with a missing `code` field in the body returns a `400 Bad Request` status.
-   **File System Integrity:**
    -   After any request (successful or failed), verify that the temporary `.cpp` and `.exe` files in the `temp/` directory have been deleted.

---

## 4. End-to-End (E2E) Testing

E2E tests simulate a full user journey through the application. The recommended tool is **Playwright**.

- **Playwright:** A modern E2E testing framework that allows us to control a real browser and automate user actions. It's fast, reliable, and has excellent cross-browser support.

### What to Test:

-   **The "Happy Path":**
    1.  Load the application page.
    2.  Verify the default "Hello, World!" C++ code is in the editor.
    3.  Enter a number (e.g., `5`) into the "Input" text area.
    4.  Click the "Run" button.
    5.  Wait for and verify that the "Output" text area displays the expected result.
-   **The Compilation Error Path:**
    1.  Load the page.
    2.  Enter syntactically incorrect C++ code into the editor.
    3.  Click "Run".
    4.  Verify that the "Output" text area displays a compilation error message.

---

## 5. Implementation Plan (For Next Session)

1.  **Setup Backend Testing:**
    -   Install `jest`, `supertest`, and their `@types/*` dev dependencies.
    -   Configure Jest for TypeScript.
    -   Write the first integration test for the `/api/code` endpoint.
2.  **Setup Frontend Testing:**
    -   Install `vitest`, `jsdom`, and `@testing-library/react`.
    -   Configure Vitest in `vite.config.ts`.
    -   Write the first component test for `App.tsx`.
3.  **Implement E2E Tests:**
    -   Install and configure Playwright.
    -   Write the E2E tests for the user flows described above.
