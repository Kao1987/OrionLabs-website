# Orion Labs Website

This is the official repository for the Orion Labs personal brand website, a modern, responsive web application built with Vue 3 and Vite.

## Tech Stack

### Frontend

- **Framework**: Vue 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Framework**: Bootstrap 5
- **Routing**: Vue Router
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Markdown Rendering**: Marked, DOMPurify, highlight.js

### Backend (API Example)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: Helmet, CORS, Express Rate Limit

### Testing

- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Mocking**: Mock Service Worker (MSW)

### Linting & Formatting

- **Linting**: ESLint
- **Type Checking**: vue-tsc

### DevOps & Deployment

- **Containerization**: Docker
- **Web Server/Proxy**: Nginx
- **CI/CD**: GitHub Actions

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x or later)
- [Yarn](https://yarnpkg.com/) (v1.22.x or later)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/orionlabs-website.git
    cd orionlabs-website
    ```

2.  Install dependencies using Yarn:
    ```sh
    yarn install
    ```

## Available Scripts

### Development

-   **`yarn dev`**: Starts the development server with hot-reload.
-   **`yarn dev:full-stack`**: Starts both the frontend and backend services concurrently.
-   **`yarn preview`**: Builds the project and serves it locally for previewing the production build.

### Building

-   **`yarn build`**: Type-checks and builds the application for production.

### Testing

-   **`yarn test`**: Runs all unit and integration tests using Vitest.
-   **`yarn test:coverage`**: Runs tests and generates a coverage report.
-   **`yarn test:e2e`**: Runs all end-to-end tests using Playwright.
-   **`yarn test:e2e:ui`**: Runs end-to-end tests with the Playwright UI.

### Linting

-   **`yarn lint`**: Lints and automatically fixes code style issues.
-   **`yarn lint:bem`**: Validates BEM naming conventions in the CSS.

## Project Structure

```
/
├─── .github/         # GitHub Actions workflows
├─── api-example/     # Example backend API
├─── scripts/         # Various build and utility scripts
├─── src/             # Main application source code
│   ├─── assets/      # Static assets (images, styles)
│   ├─── components/   # Reusable Vue components
│   ├─── composables/  # Vue 3 composables
│   ├─── router/       # Vue Router configuration
│   ├─── stores/       # Pinia state management stores
│   ├─── views/        # Page components
│   └─── main.ts       # Application entry point
├─── tests/           # Test files
│   ├─── e2e/          # Playwright E2E tests
│   └─── unit/         # Vitest unit tests
├─── Dockerfile       # Container definition for the application
├─── vite.config.ts   # Vite configuration
└─── package.json     # Project dependencies and scripts
```

## IDE Setup

-   [VSCode](https://code.visualstudio.com/)
-   [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (formerly Volar)
-   Disable the built-in TypeScript extension in favor of the Vue plugin for better performance with `.vue` files.
