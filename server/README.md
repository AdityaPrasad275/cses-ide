# CSES IDE - Server

This directory contains the backend server for the CSES IDE project. It's responsible for receiving code from the frontend, compiling it, running it against test cases, and returning the output.

---

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Core Logic:**
  - **`child_process`**: To execute `g++` for compiling and running C++ code.
  - **`uuid`**: To generate unique filenames for each execution, preventing race conditions.
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Development:** [Nodemon](https://nodemon.io/) for live-reloading
- **Middleware:** [CORS](https://expressjs.com/en/resources/middleware/cors.html) for handling cross-origin requests

---

## ⚙️ Getting Started

### Prerequisites

- Make sure you have [Node.js](https://nodejs.org/en/download/) and [pnpm](https://pnpm.io/installation) installed.
- **A C++ compiler must be installed and accessible in your system's PATH.** This server uses `g++` by default.

### Installation

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install the required dependencies:
    ```bash
    pnpm install
    ```

---

## ▶️ Running the Server

To start the development server, run the following command. It will watch for file changes and automatically restart the server.

```bash
pnpm start
```

The server will be available at `http://localhost:3001`.

---

## ⚙️ How It Works

When a request is sent to the `/api/code` endpoint:
1.  A unique ID is generated for the request to ensure every run is isolated and prevent file conflicts.
2.  The C++ code is saved to a temporary file (e.g., `temp/<uuid>.cpp`).
3.  The server calls `g++` to compile the code into an executable (`temp/<uuid>.exe`).
4.  The executable is run. The user's input is piped to it, and the input stream is immediately closed to prevent the process from hanging if it's waiting for input.
5.  The program's output (or any error) is captured.
6.  Both temporary files (`.cpp` and `.exe`) are deleted after the run is complete, regardless of success or failure.
7.  The captured output is sent back to the client.

---

## 🔌 API Endpoints

- `POST /api/code`
  - **Description:** Receives C++ code and optional input from the client, compiles and executes it, and returns the result.
  - **Body:**
    ```json
    {
      "code": "your_cpp_code_here",
      "input": "your_optional_input_here"
    }
    ```
  - **Success Response:**
    ```json
    {
      "output": "The program's standard output."
    }
    ```
  - **Error Response:**
    ```json
    {
      "output": "The compilation or runtime error message.",
      "error": true
    }
    ```
