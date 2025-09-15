# Full Stack Monorepo with Turbopack, Eslint, Next.js, Express.js, Tailwind CSS, and shadcn

This repository is a full-stack monorepo starter template that integrates several modern web development tools and libraries, including **Turbopack**, **Eslint**, **Next.js**, **Express.js**, **Tailwind CSS**, and **shadcn**.

## Features

- **Monorepo Architecture**: Organizes both frontend (Next.js) and backend (Express.js) in a single repository using Turbopack to manage and optimize builds.
- **Next.js**: A powerful React framework for building server-rendered web applications with API routes.
- **Express.js**: A minimalist Node.js framework for building backend services and REST APIs.
- **Turbopack**: A fast incremental bundler and build system, ideal for monorepo setups.
- **Tailwind CSS**: A utility-first CSS framework for building responsive, modern UI components.
- **shadcn**: A component library that integrates seamlessly with Tailwind CSS, providing elegant UI components.
- **ESLint**: A fast and versatile tool for linting, formatting, and ensuring code quality across the entire monorepo.

## Project Structure

The monorepo is organized as follows:

```
/apps
  /web (Next.js)
  /server (Express.js)

/packages
  /ui (shadcn component library with Tailwind CSS)
  /tsconfig (Shared configuration files such as Eslint, Tailwind, and Turbopack)
  /types (Shared types)
  /ui (Shared UI components and styles)
  /utils (Shared util methods)
```

- **/apps/web**: Contains the Next.js application responsible for the frontend.
- **/apps/server**: Contains the Express.js application responsible for the backend.
- **/packages/tsconfig**: Contains shared configurations (e.g., Eslint, Tailwind, Turbopack) to enforce consistency across the monorepo.
- **/packages/eslint-config**: Contains shared Eslint configurations for the monorepo.
- **/packages/types**: Contains shared types (e.g. responses, api clients, etc).
- **/packages/ui**: Houses the shared UI components built with shadcn and Tailwind CSS.
- **/packages/utils**: Contains shared utils methods that will be used in multiple apps or packages.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm installed globally (`npm i -g pnpm`)
- Git

1. **Clone the repository**

   ```bash
   git clone https://github.com/ivesfurtado/next-express-turborepo.git
   cd next-express-turborepo
   ```

2. **Install Dependencies**

   Use `pnpm` package manager:

   ```bash
   pnpm install
   ```

3. **Run the Development Server**

   You can start both the web and server services with Turbopack's parallelism:

   ```bash
   pnpm dev
   ```

   - Frontend is served at `http://localhost:3000` (Next.js)
   - Backend is served at `http://localhost:3001` (Express.js)

4. **Build for Production**

   To build the frontend and backend for production, run:

   ```bash
   pnpm build
   ```

   This will create optimized builds for both the frontend and backend services.

## Tools and Technologies

- **Next.js**: Provides the frontend framework with server-side rendering, API routes, and static generation.
- **Express.js**: Handles the backend, including API endpoints and server logic.
- **Turbopack**: Ensures fast builds and optimal performance for monorepos.
- **Tailwind CSS**: Simplifies styling with a utility-first approach.
- **shadcn**: Offers pre-designed components for building clean and modern UIs.
- **ESLint**: Enforces code standards by handling linting and formatting across the project.

## Deployment

You can deploy your full-stack monorepo using platforms like Vercel for the frontend and any Node.js hosting service for the backend (e.g., Heroku, AWS, DigitalOcean).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have suggestions or improvements.

## License

This project is licensed under the MIT License. Feel free to use and modify it according to your needs.

---

## Example Applications

This monorepo structure has been successfully used to build:

- **[SnipLLM](https://www.snipllm.com/)** - An AI-powered writing tool that transforms your writing with advanced AI. No expertise needed: just paste any text, choose your goal, and get perfect results instantly.

## Further Reading

For further details on building and setting up this monorepo, check out the original tutorial on [The Halftime Code](https://www.thehalftimecode.com/building-a-full-stack-monorepo-with-turbopack-biome-next-js-express-js-tailwind-css-and-shadcn/).

# Korin UI Monorepo Guide

This section documents the actual packages and apps in this repository and how to develop, build, and release them.

## Overview

- Package manager: `pnpm` (see `packageManager` in `package.json`)
- Task runner: `turbo` (see `turbo.json`)
- Workspace layout: `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- Linting/formatting: shared config via `@monorepo/eslint-config` and Prettier
- Versioning/publishing: Changesets

### Quick Links

- Playground (live demo): https://sijawara.github.io/korin-ui/packages/korin-embed/examples/playground.html
- UI Showcase & shadcn registry: https://ui.korinai.com
- Sub‑package READMEs:
  - `packages/korin-ui/README.md` – UI components and Tailwind config (@monorepo/ui)
  - `packages/korin-libs/README.md` – Hooks, contexts, and utilities (@korinai/libs)
  - `packages/korin-embed/README.md` – Embeddable widget docs (@korinai/embed)

## Directory Structure

```
apps/
  web/                # Next.js 15 app
packages/
  eslint-config/      # Shared ESLint config (published as @monorepo/eslint-config)
  korin-embed/        # Embeddable widget package (@korinai/embed) built with Vite
  korin-libs/         # Reusable hooks, contexts, libs (@korinai/libs)
  korin-ui/           # UI components & Tailwind config (@monorepo/ui)
tools/                # (if present) repo tooling
```

Key workspace files:

- `pnpm-workspace.yaml` – declares `apps/*` and `packages/*`
- `turbo.json` – task graph, caching, and outputs
- Root `package.json` – top-level scripts (dev/build/lint/format, changesets)

## Apps

### `apps/web` (Next.js)

- Scripts: `dev`, `build`, `start`, `lint`
- Depends on workspace packages: `@korinai/libs`, `@monorepo/ui`, `@monorepo/shadcn-ui`
- Start development server:

```bash
pnpm dev -F web
# or run all dev tasks in parallel (see "Root scripts")
```

## Packages

### `packages/korin-ui` → `@monorepo/ui`

- Purpose: Shared UI components, Tailwind config, and utilities
- Exports:
  - `./globals.css` – base styles
  - `./postcss.config` – PostCSS config
  - `./tailwind.config` – Tailwind config
  - `./*` – component entrypoints in `src/*.tsx`
- Notable deps: Radix UI, shadcn, Tailwind CSS 4, `clsx`, `tailwind-merge`, `tw-animate-css`
- Scripts: `check-types`, `add-shadcn-component`, `lint`

Usage in other workspaces:

```ts
// Example import
import { Button } from "@monorepo/ui/button";
import "@monorepo/ui/globals.css";
```

Add a new shadcn component into this package:

```bash
pnpm add-shadcn-component -F @monorepo/ui
# The root script proxies to package script via turbo
```

### `packages/korin-libs` → `@korinai/libs`

- Purpose: Shared hooks, contexts, lightweight libs
- Exports (from `package.json`):
  - `./hooks/*` → `hooks/*.ts`
  - `./ui/*` → `ui/*.tsx`
  - `./contexts/*` → `contexts/*.tsx`
  - `./types` → `types.d.ts`
  - `./*` → `libs/*.ts`
- Scripts: `check-types`, `lint`

Usage in apps/packages:

```ts
import { useSomething } from "@korinai/libs/hooks/use-something";
```

### `packages/korin-embed` → `@korinai/embed`

- Purpose: Embeddable widget bundle built with Vite
- Entry: `dist/embed.js` (both `main` and `module`)
- Scripts: `dev`, `build`, `lint`, `preview`
- Build specifics: `pnpm build -F @korinai/embed` runs two Vite builds (codemod + main) via `vite.config.codemod.ts` and `vite.config.ts`

Usage (in a host site):

```html
<!-- Use the published CDN build (no local bundling required) -->
<script src="https://cdn.jsdelivr.net/npm/@korinai/embed@latest/dist/embed.js"></script>
```

Tip: See `packages/korin-embed/README.md` for full options, including translations and runtime controls.

## Root Scripts

Defined in root `package.json`:

- `pnpm dev` – `turbo dev` (parallel dev for affected packages/apps)
- `pnpm build` – `turbo build`
- `pnpm lint` / `pnpm lint:fix` – repo-wide lint
- `pnpm format` / `pnpm format:fix` – repo-wide formatting
- `pnpm add-shadcn-component` – run `add-shadcn-component` in all packages that implement it
- `pnpm clean` – `turbo clean`

Common examples:

```bash
# Run dev for everything (apps and packages that implement dev)
pnpm dev

# Run dev only for Next.js app
pnpm dev -F web

# Build everything with caching
pnpm build

# Lint repo
pnpm lint

# Format (check) or write changes
pnpm format
pnpm format:fix
```

## Development Setup

1. Install dependencies

```bash
pnpm install
```

2. Start development

```bash
pnpm dev
# or focus on a specific workspace
pnpm dev -F web
pnpm dev -F @korinai/embed
```

3. Build locally

```bash
pnpm build
# or focus
pnpm build -F @monorepo/ui
```

## Linting & Formatting

- ESLint config shared via `@monorepo/eslint-config`
- Run across the repo from root:

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:fix
```

## Release & Versioning (Changesets)

We use Changesets to manage versions and publishing of packages.

Typical flow:

```bash
# After making changes to one or more packages
pnpm changeset

# Commit the generated changeset file
git add . && git commit -m "chore: changeset for <packages>"

# When ready to bump versions
pnpm version:packages

# Publish to the registry
pnpm publish:packages
```

Notes:

- `version:packages` runs `turbo build` first to ensure build artifacts are fresh.
- Ensure you are logged in to your npm registry with correct scope access.
- Private packages remain private; publish only the intended public packages.

## Coding Conventions

- React 19 and Next.js 15 in apps where applicable
- Tailwind CSS 4 with utility-first patterns; use exported Tailwind config from `@monorepo/ui` when relevant
- Prefer shared components from `@monorepo/ui` and shared logic from `@korinai/libs`
- Keep packages focused and reusable; avoid app-specific code in library packages

## Troubleshooting

- If types or exports aren’t found, run a clean build:

```bash
pnpm clean && pnpm build
```

- Turbo caching: Some tasks are cached by default per `turbo.json`. For dev tasks, caching is disabled (`cache: false`).

## License

This repository is licensed under MIT unless stated otherwise within individual packages.
