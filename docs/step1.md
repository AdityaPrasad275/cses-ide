# Phase 1: Project Skeleton Documentation

This document outlines the initial state of the CSES IDE project after completing Phase 1, as requested. It summarizes the structure and technology stack of the frontend and backend.

---

## Client (Frontend)

The client is a modern React application responsible for the user interface.

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Styling:** CSS

### Key Files & Structure:

- **`package.json`**: Defines project scripts (`dev`, `build`) and dependencies.
- **`vite.config.ts`**: Configuration for the Vite development server and build process.
- **`tsconfig.json`**: Configures TypeScript for the project.
- **`index.html`**: The main HTML page that hosts the React application.
- **`src/main.tsx`**: The entry point of the React application, rendering the `<App />` component.
- **`src/App.tsx`**: The main, top-level React component.

---

## Server (Backend)

The server is a Node.js application built with Express, designed to handle code compilation and execution.

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Development:** Uses Nodemon for automatic live-reloading.
- **Middleware:** Includes `cors` to handle cross-origin requests from the frontend.

### API Endpoints:

- **`POST /api/code`**
  - **Description:** A simple endpoint to receive C++ code from the client.
  - **Body:** `{ "code": "your_cpp_code_here" }`
  - **Response:** `{ "message": "Code received successfully!" }`
