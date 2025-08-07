# CSES IDE - Server

This directory contains the backend server for the CSES IDE project. It's responsible for receiving code from the frontend, compiling it, running it against test cases, and returning the output.

---

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Development:** [Nodemon](https://nodemon.io/) for live-reloading
- **Middleware:** [CORS](https://expressjs.com/en/resources/middleware/cors.html) for handling cross-origin requests

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/download/) and [pnpm](https://pnpm.io/installation) installed on your machine.

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

## 🔌 API Endpoints

- `POST /api/code`
  - **Description:** Receives C++ code from the client for processing.
  - **Body:** `{ "code": "your_cpp_code_here" }`
  - **Response:** `{ "message": "Code received successfully!" }`