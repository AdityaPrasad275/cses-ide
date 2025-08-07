# CSES IDE - Client

This is the frontend for the CSES IDE, built with React, TypeScript, and Vite. It provides the user interface for writing code, submitting it, and viewing the results.

---

## 🚀 Tech Stack

- **Framework:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Styling:** CSS

---

## ⚙️ Getting Started

### Installation

1.  Navigate to the client directory:
```bash
cd client
```

2.  Install the required dependencies:
  ```bash
  pnpm install
  ```

### Running the Development Server

To start the local development server with live reloading:

```bash
pnpm dev
```

Vite will start the server, typically at `http://localhost:5173`.

---

## 📁 Project Structure Explained

```bash
pnpm dev
```

Vite will start the server, typically at `http://localhost:5173`.

---

## 📁 Project Structure Explained

Here is a breakdown of the important files and directories in this project:

- **`package.json`**: Defines the project's scripts and dependencies.
- **`vite.config.ts`**: Configuration file for Vite, our build tool and development server.
- **`tsconfig.json`**: Configures the TypeScript compiler.
- **`index.html`**: The main HTML page that hosts the React application.
- **`public/`**: Contains static assets that are not processed by the build system.
- **`src/`**: Contains all the application's source code.
  - **`main.tsx`**: The entry point of the React application. It renders the `<App />` component into the `index.html` file.
  - **`App.tsx`**: The main, top-level React component that acts as the container for the entire UI.
  - **`*.css`**: CSS files for styling the application.
  - **`assets/`**: A folder for storing images, fonts, and other assets that are imported into components.

---
