# End-to-End Testing with Playwright

This document provides an overview of the end-to-end (E2E) testing setup for the application using [Playwright](https://playwright.dev/).

## Overview

E2E tests are designed to simulate real user interactions in a browser. They verify that the application's critical features work as expected from the user's perspective, covering the entire application flow from UI interaction to backend communication and back.

The tests are located in the `tests/` directory at the project root.

## Running the Tests

To run the entire E2E test suite, execute the following command from the project's root directory:

```bash
pnpm test:e2e
```

Playwright will launch a browser, run through the defined test cases, and provide a detailed report of the results.

## Test Scenarios

The main test file, `tests/example.spec.ts`, covers the following key scenarios:

-   **Happy Path**: Verifies that a user can enter valid C++ code and input, run it, and see the correct output displayed.
-   **Compilation Errors**: Ensures that if a user submits syntactically incorrect C++ code, a descriptive compilation error is shown.
-   **User Input Handling**: Confirms that the application correctly passes user-provided input to the running code.
-   **Timeout on Infinite Loops**: Verifies that if user code enters an infinite loop, the backend correctly times out the execution after 5 seconds and reports the timeout to the user.
-   **Handling Code Waiting for Input**: Ensures that code expecting standard input terminates gracefully if no input is provided, preventing the process from hanging.

## Best Practices Followed

-   **User-Facing Locators**: Tests use `getByRole`, `getByPlaceholder`, etc., to interact with the page in a way that is resilient to DOM structure changes.
-   **Waiting for Elements**: The tests include explicit waits (e.g., `await expect(...).toBeHidden()`) to ensure the application is in the correct state before proceeding, preventing flaky tests.
-   **Reliable Editor Interaction**: Code is injected into the Monaco editor using `page.evaluate()`, which is the most reliable method for replacing its content, avoiding issues with focus and timing.
