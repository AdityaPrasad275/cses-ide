# CSES IDE – Development Plan

> A weekend-to-long-term project to build a LeetCode-style online judge for CSES problems — entirely from scratch.

---

## 📦 Goal

- Let users view a CSES problem, write C++ code in-browser, run it, and get outputs.
- Auto-test their code against official sample/test cases.

---

## 🗓️ Project Plan

### ✅ PHASE 1: Project Skeleton (Day 1 - Fri Eve)
- [x] Create repo structure:
  - `client/` for frontend
  - `server/` for backend
- [x] Set up `create-react-app` in `client`
  - *Note: Used **Vite + React + TypeScript** for a more modern setup.*
- [x] Set up `express` in `server`
  - *Note: Also added **TypeScript, CORS, and Nodemon** for a robust development environment.*
- [x] Connect frontend and backend with a simple `POST` route

---

### ✅ PHASE 2: Frontend Editor UI (Day 2 - Sat AM)
- [x] Install Monaco Editor (`@monaco-editor/react`)
- [x] Build split layout: Left (Problem), Right (Editor)
- [x] Add "Run" and "Submit" buttons
- [x] Add textareas for input/output display

---

### ✅ PHASE 3: Backend - Code Compile & Run (Sat PM)
- [x] Receive C++ code + input from frontend
- [x] Save code as `code.cpp`
  - *Note: Upgraded to use unique filenames (`uuid`) to prevent race conditions.*
- [x] Use `g++` to compile and execute it
- [x] Return stdout/stderr to frontend
- [x] **Bug Fix:** Solved "Permission Denied" error on Windows.

---

### 🧪 PHASE 3.5: Quality Assurance (Next Session)
- [x] Implement a comprehensive testing suite.
- *Note: A detailed strategy has been created. See [**docs/testing-plan.md**](./testing-plan.md) for the full approach.*


-- feedback - unit tests done, e2e testing giving lot of problems so currently they are left behind. moving on to next steps
---

### 📥 PHASE 4: CSES Testcase Integration (Sun AM)
- [ ] Choose a few problems (like "Missing Number")
- [ ] Download and unzip testcases from CSES
- [ ] Store sample inputs/outputs in `/testcases/problemID/`
- [ ] Auto-run user code against these testcases

---

### 🔒 PHASE 5: Docker Sandboxing (Sun PM)
- [ ] Learn basics of Docker
- [ ] Write a Dockerfile that installs `g++` and runs code
- [ ] Backend spawns Docker containers per submission
- [ ] Limit memory/time and ensure cleanup

---

### 🎨 PHASE 6: UI Polish & Features (Next Week)
- [ ] Improve code formatting, diff output
- [ ] Add dark mode, themes
- [ ] Add problem selector (dropdown or sidebar)
- [ ] Save code to localStorage or server

---

## 🧠 Tips / Help Prompts

If stuck, prompt ChatGPT:
- “How to compile and run C++ code in Node.js?”
- “How to use Docker to safely run code?”
- “Compare two output strings line by line in Node?”

---

## 🔮 Future Ideas

- Login system & user submissions
- Leaderboard & timing stats
- Add support for Python or Java
- Live collaboration mode

---

## 📌 Notes

- Start insecure (run code directly) → then add Docker once working
- Don’t over-optimize early — make it work, then clean it up

---

> Made with 💻, ☕, and vibes.
