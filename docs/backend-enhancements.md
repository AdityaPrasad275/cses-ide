# Phase 3 Enhancements: Timeouts and Robust Execution

This document details significant improvements made to the backend execution engine after the initial implementation described in `step3.md`.

---

## Summary of Changes

To build a more robust and secure execution environment, the `/api/code` endpoint was refactored to include timeouts, better error handling, and more modern asynchronous code patterns.

Note: /api/code renamed to /api/run

### 1. Asynchronous Refactoring

- **Problem:** The original code used nested callbacks for file I/O and process execution, which could lead to "callback hell" and was harder to manage.
- **Solution:** The entire endpoint was converted to use `async/await`.
  - `fs.promises` is now used for all file system operations (writing the `.cpp` file, cleaning up).
  - The `g++` compilation step is wrapped in a `new Promise` to allow for clean `try/catch` error handling.

### 2. Execution Timeout

- **Problem:** A user could submit code with an infinite loop (e.g., `while(true){}`), which would hang the server process indefinitely, consuming CPU and preventing other requests from being handled.
- **Solution:** A 5-second timeout was implemented.
  - When the execution process starts, a `setTimeout` is created.
  - If the process does not exit within 5 seconds, the timeout callback is triggered.
  - The callback forcefully kills the running process using platform-specific commands (`taskkill` for Windows, `kill` for others).
  - A "Execution timed out" error is sent back to the user.
  - The `clearTimeout` function is called upon normal process completion to prevent the timeout from firing unnecessarily.

### 3. Improved Error Handling

- **Problem:** The initial implementation had basic error handling. It didn't distinguish between compilation errors and runtime errors.
- **Solution:** The logic was enhanced to provide more specific feedback.
  - **Compilation Errors:** These are caught when the `g++` promise rejects. The `stderr` from the compiler is sent to the user.
  - **Runtime Errors:** After compilation succeeds, the executable is run. The `child.on('close')` event listener checks the process `code`. A non-zero exit code signifies a runtime error (like a segmentation fault), and the `stderr` from the execution is returned.
  - **Timeouts:** Handled as a separate error case.

### 4. Standard Input (stdin) Handling

- **Refinement:** The method for providing input to the user's program was made more robust. The `input` string from the request body is now correctly piped to the standard input stream of the child process (`child.stdin?.write(input)`), and the stream is properly closed (`child.stdin?.end()`).

---

These enhancements make the backend significantly more stable and secure, preventing malicious or poorly written code from crashing the server. This lays the groundwork for the automated testing in Phase 4.
