# Phase 3: Backend - Code Compilation and Execution

This document outlines the implementation of the backend service responsible for compiling and running user-submitted C++ code.

---

## Summary of Changes

The core of this phase was to build a backend endpoint that could safely receive, compile, and execute C++ code.

### 1. Initial Implementation

- **New Dependencies:** The `fs` (File System) and `child_process` modules were imported in `server/index.ts` to manage files and execute shell commands.
- **`/api/code` Endpoint:** The existing endpoint was enhanced to:
  - Accept both `code` and `input` from the request body.
  - Save the C++ code to a temporary file (`temp/main.cpp`).
  - Use `g++` via the `exec` function to compile the code into an executable (`temp/main.exe`).
  - Run the compiled executable, piping the `input` string to its standard input.
  - Capture the `stdout` and `stderr` and return them to the frontend as the program's output or error.

### 2. Bug Fix: "Permission Denied" Error

- **Problem:** A critical bug was identified where rapid, subsequent requests would fail with a "Permission Denied" error. This was caused by the server trying to overwrite the `main.exe` file while it was still being executed by the previous request.
- **Solution:** To ensure each execution is isolated and cannot interfere with others, the process was updated to use unique filenames for every request.
  - **`uuid` Package:** The `uuid` library was added to the server to generate unique identifiers.
  - **Unique File Naming:** For each request, a unique ID is generated (e.g., `a1b2c3d4`). The temporary files are now named using this ID (e.g., `a1b2c3d4.cpp` and `a1b2c3d4.exe`).
  - **Robust Cleanup:** The file cleanup logic was also confirmed to run after every execution, regardless of whether it succeeded or failed, preventing the buildup of temporary files.

### 3. Frontend Integration

- **`handleRun` Update:** The `handleRun` function in `client/src/App.tsx` was updated to send both the code and the user's input to the `/api/code` endpoint.
- **Real-time Output:** The frontend now displays the actual output or error received from the backend in the "Output" text area, replacing the previous mock data.

---

The backend is now capable of securely handling individual code execution requests, completing the objectives for Phase 3.