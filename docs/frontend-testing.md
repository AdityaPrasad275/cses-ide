# Frontend Testing Documentation

This document details the testing setup and strategy for the Vite/React client application.

---

## 1. Frameworks and Libraries

As per the testing plan, we selected a modern, integrated testing stack that works seamlessly with our Vite-based frontend:

-   **[Vitest](https://vitest.dev/):** A blazing-fast test runner developed by the Vite team. It offers a Jest-compatible API, making it easy to adopt, and leverages Vite's architecture for near-instant test runs during development.
-   **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/):** A library focused on testing React components from a user's perspective. Instead of testing implementation details, it encourages writing tests that interact with the component just like a real user would (e.g., finding elements by their text, clicking buttons). This leads to more resilient and meaningful tests.
-   **[JSDOM](https://github.com/jsdom/jsdom):** A pure-JavaScript implementation of many web standards. Vitest uses JSDOM to simulate a browser environment so we can run our tests in a Node.js process without needing to open a real browser.
-   **`@testing-library/jest-dom`:** Provides a set of custom Jest matchers that make assertions more declarative and readable (e.g., `toBeInTheDocument()`).

---

## 2. Setup and Configuration

### a. Dependencies

The following development dependencies were installed in the `client/` directory:

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

-   `vitest`, `jsdom`, `@testing-library/react`: The core testing libraries.
-   `@testing-library/jest-dom`: For the custom matchers.
-   `@testing-library/user-event`: For simulating user interactions like typing and clicking.

### b. Vite Configuration

To integrate Vitest, the `client/vite.config.ts` file was updated:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

-   `/// <reference types="vitest" />`: A triple-slash directive to provide TypeScript with Vitest's type definitions.
-   `test: { ... }`: This object contains the Vitest configuration.
    -   `globals: true`: Allows us to use Vitest APIs (`describe`, `it`, `expect`) without importing them in every test file.
    -   `environment: 'jsdom'`: Specifies that tests should run in a simulated browser environment.
    -   `setupFiles: './src/setupTests.ts'`: Points to a setup file that runs before any tests.

### c. Global Setup File

We created `client/src/setupTests.ts` to import the Jest-DOM matchers, making them available globally in all our test files.

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
```

### d. Package Script

A `test` script was added to `client/package.json` to easily run the tests:

```json
"scripts": {
  "test": "vitest"
}
```

---

## 3. Test Implementation

### a. Mocking API Calls

Our `App` component makes a `fetch` request to the backend. To test the component in isolation, we must "mock" this `fetch` call. This prevents the test from making a real network request, which would be slow, unreliable, and dependent on the backend server running.

In `src/App.test.tsx`, we use Vitest's built-in mocking capabilities:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the global fetch function
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks and provide a default successful response
    vi.clearAllMocks();
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ output: 'Default output' }),
    });
  });

  // ... tests ...
});
```

-   `global.fetch = vi.fn()`: Replaces the browser's `fetch` function with a mock function that we can control.
-   `beforeEach`: This hook runs before each test, clearing any previous mock data and setting up a default successful response. This ensures tests are independent. For specific tests (like testing an error), we can override this default mock.

### b. The Test File: `src/App.test.tsx`

The test file covers the core user stories of the `App` component:

1.  **Initial Render:**
    -   **What:** Checks if all the essential UI elements are present when the app first loads.
    -   **How:** Uses `screen.getByText()` and `screen.getByRole()` to find elements like the problem title and buttons.
    -   **Expected:** All key elements are found in the document.

2.  **User Input:**
    -   **What:** Ensures that when a user types into the "Input" text area, its value is correctly updated.
    -   **How:** Uses `userEvent.type()` to simulate typing and then checks the `.value` property of the textarea element.
    -   **Expected:** The textarea's value matches what the user typed.

3.  **API Call on "Run":**
    -   **What:** Verifies that clicking the "Run" button triggers a `fetch` call with the correct code and input.
    -   **How:** Simulates a click with `userEvent.click()` and then uses `expect(fetch).toHaveBeenCalledWith(...)` to check the arguments passed to our mock `fetch`.
    -   **Expected:** `fetch` is called with the correct URL, method, headers, and a JSON body containing the editor's code and the user's input.

4.  **Successful Response:**
    -   **What:** Checks that when `fetch` returns a successful response, the "Output" area is updated with the result.
    -   **How:** We mock a successful response, simulate a click, and then use `screen.findByDisplayValue()` to wait for the UI to update with the output text.
    -   **Expected:** The output from the mock response appears in the output textarea.

5.  **Failed Response:**
    -   **What:** Ensures that if the `fetch` call fails (e.g., a network error), a user-friendly error message is displayed.
    -   **How:** We mock a rejected promise with `(fetch as vi.Mock).mockRejectedValue(...)`, simulate a click, and wait for the error message to appear.
    -   **Expected:** The specific error message is displayed in the output textarea.
