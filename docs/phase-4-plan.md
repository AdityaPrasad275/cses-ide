# Phase 4 Detailed Plan: Dynamic Problem Integration

This document outlines the specific changes required to transition the application from a single hardcoded problem to a dynamic, multi-problem platform.

---

## 1. Overview & Strategy

The goal is to refactor the frontend and backend to support multiple problems, driven by data files rather than hardcoded content. We will use client-side routing to display different problems and create new API endpoints to serve problem data and handle submissions against official test cases.

The core strategy is:
1.  **Data-Driven Problems:** Store problem descriptions and test case locations in structured data (`problems.json`).
2.  **API for Problems:** Create backend endpoints to serve this problem data.
3.  **API for Submissions:** Create a new backend endpoint to run code against multiple, predefined test cases.
4.  **Dynamic Frontend:** Refactor the React app to use a router, fetch problem data from the API, and display it dynamically.

---

## 2. File Structure Changes

The following new files and directories will be created:

```
.
├── client/
│   └── src/
│       ├── components/
│       │   └── Sidebar.tsx         # New: Component to list problems
│       ├── pages/
│       │   ├── ProblemView.tsx     # New: Page to display a single problem
│       │   └── ProblemList.tsx     # New: Landing page content
│       └── App.css
│       └── App.tsx                 # Refactored for routing
│       └── ...
├── server/
│   ├── problems.json             # New: Data file for all problems
│   └── index.ts                  # Refactored with new endpoints
├── testcases/                      # New: Root folder for all test cases
│   └── missing-number/
│       ├── 1.in
│       └── 1.ans
│   └── weird-algorithm/
│       ├── 1.in
│       └── 1.ans
└── ...
```

---

## 3. Backend Refactoring (`server/index.ts`)

The server will be updated to manage and serve problem data and add a new, more robust submission-judging process.

### 3.1. Create `server/problems.json`

A new file will be created to act as our "database" of problems.

```json
[
  {
    "id": "missing-number",
    "title": "Missing Number",
    "description": "You are given all numbers between 1, 2, ..., n except one. Your task is to find the missing number.",
    "difficulty": "Easy"
  },
  {
    "id": "weird-algorithm",
    "title": "Weird Algorithm",
    "description": "Consider an algorithm that takes as input a positive integer n. If n is even, the algorithm divides it by two, and if n is odd, the algorithm multiplies it by three and adds one. The algorithm repeats this, until n is one. For example, the sequence for n=3 is 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1. Your task is to simulate the execution of the algorithm for a given value of n.",
    "difficulty": "Easy"
  }
]
```

### 3.2. `index.ts` Modifications

**Dependencies:** No new npm packages are needed for the backend.

**New Endpoints:**

1.  **`GET /api/problems`**
    *   **Purpose:** Provide a list of all available problems for the frontend sidebar.
    *   **Logic:** Read `server/problems.json`, parse it, and send the resulting array to the client.

2.  **`GET /api/problems/:problemId`**
    *   **Purpose:** Get the detailed information for a single problem.
    *   **Logic:**
        *   Read `server/problems.json`.
        *   Find the problem in the array where `id` matches `:problemId` from the URL parameters.
        *   Return the full JSON object for that problem.

3.  **`POST /api/submit/:problemId`**
    *   **Purpose:** The new "Submit" button functionality. Runs user code against all official test cases for a given problem.
    *   **Request Body:** `{ "code": "..." }`
    *   **Logic:**
        1.  Compile the user's code once (similar to the existing `/api/code` endpoint). If compilation fails, return a `Compilation Error` status.
        2.  Locate the test case directory (e.g., `testcases/missing-number/`).
        3.  Read all `.in` files from the directory.
        4.  **Loop for each test case:**
            *   Execute the compiled code.
            *   Pipe the content of the current `.in` file to the process `stdin`.
            *   Capture the `stdout`.
            *   Read the content of the corresponding `.ans` file.
            *   Compare the process `stdout` with the `.ans` content.
            *   If there's a mismatch, timeout, or runtime error, stop immediately and return the appropriate status (`Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`).
        5.  If all test cases pass, return an `Accepted` status.
    *   **Response Body:** `{ "status": "Accepted" | "Wrong Answer" | "...", "details": "..." }`

**Endpoint Renaming:**

*   The existing `POST /api/code` endpoint will be renamed to **`POST /api/run`**. Its functionality remains the same: execute code with custom, user-provided input. This will power the "Run" button.

---

## 4. Frontend Refactoring (`client/src/`)

The frontend will be converted into a Single Page Application (SPA) with client-side routing.

**Dependency:**
*   First, we must add the routing library: `pnpm add react-router-dom` in the `client` directory.

### 4.1. `main.tsx`
*   The `<App />` component will be wrapped with `<BrowserRouter>` to enable routing.

### 4.2. `App.tsx` (Refactored)
*   This will become the main layout component.
*   It will render a new `<Sidebar />` component.
*   It will use `<Routes>` and `<Route>` to define the application's pages.
    *   `<Route path="/" element={<ProblemList />} />`
    *   `<Route path="/problems/:problemId" element={<ProblemView />} />`

### 4.3. New Component: `components/Sidebar.tsx`
*   **Purpose:** Display a clickable list of problems.
*   **Logic:**
    *   On component mount, it will `fetch` from the `GET /api/problems` endpoint.
    *   It will render the list of problems using `<Link>` from `react-router-dom` to navigate to the correct problem page (e.g., `<Link to="/problems/missing-number">`).

### 4.4. New Page: `pages/ProblemView.tsx`
*   **Purpose:** This will contain the main IDE view (problem description, editor, console) and will be a refactor of the current `App.tsx`.
*   **Logic:**
    *   It will use the `useParams` hook to get the `:problemId` from the URL.
    *   It will use a `useEffect` hook that re-runs whenever `problemId` changes. Inside, it will `fetch` from `GET /api/problems/:problemId` to get the problem details.
    *   The component's state will hold the fetched problem data, code, input, and output.
    *   The JSX will be almost identical to the current `App.tsx`, but the problem `<h2>` and `<p>` tags will be populated from the fetched data instead of being hardcoded.
    *   The **"Run"** button will call the (renamed) `POST /api/run` endpoint.
    *   The **"Submit"** button will call the new `POST /api/submit/:problemId` endpoint and display the final judgment (`Accepted`, `Wrong Answer`, etc.) in the output area.
