# CSES IDE

A web-based LeetCode-style platform to solve [CSES Problem Set](https://cses.fi/problemset/) problems entirely in the browser.

✨ Built from scratch to learn full-stack development, code compilation, and sandboxing.

---

## 🚀 Features (Planned)

- 📘 View CSES problem statements in-browser
- 🧑‍💻 Write and run C++ code using Monaco Editor
- 🧪 Automatically test code against official CSES testcases
- 🧱 Secure code execution using Docker sandbox
- 🌗 Dark mode, live output, and clean UI

---

## 🛠 Tech Stack

| Layer       | Technology          |
|------------|---------------------|
| Frontend    | React + Monaco Editor |
| Backend     | Node.js + Express |
| Compilation | g++ (GCC for C++) |
| Sandbox     | Docker |
| Styling     | Tailwind CSS (optional) |

---

## 📂 Project Structure

```bash
cses-ide/
├── client/         # React frontend
├── server/         # Node.js backend
├── docs/
│   └── plan.md     # Development roadmap
└── README.md
