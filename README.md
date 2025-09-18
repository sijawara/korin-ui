# Korin UI Monorepo

Korin UI is a collection of reusable UI components and libraries built with modern web technologies. This monorepo contains all the packages and applications that make up the Korin UI ecosystem.

## Features

- **Monorepo Architecture**: Organized using pnpm workspaces and Turborepo for efficient code sharing and dependency management.
- **Component Library**: A comprehensive collection of reusable UI components built with React and styled with Tailwind CSS.
- **TypeScript First**: Fully typed components and utilities for better developer experience.
- **Modern Tooling**: Built with the latest web technologies including Next.js, Vite, and more.
- **Developer Experience**: Pre-configured with ESLint, Prettier, and other tools for consistent code quality.

## Monorepo Structure

```
apps/
  web/                # Next.js 15 app (documentation and demo)
packages/
  eslint-config/      # Shared ESLint config (@monorepo/eslint-config)
  korin-embed/        # Embeddable widget package (@korinai/embed) built with Vite
  korin-libs/         # Reusable hooks, contexts, and utilities (@korinai/libs)
  korin-ui/           # UI components & Tailwind config (@monorepo/ui)
```

### Key Workspace Files

- `pnpm-workspace.yaml` – Defines workspace packages in `apps/*` and `packages/*`
- `turbo.json` – Task graph, caching, and outputs configuration
- Root `package.json` – Top-level scripts (dev/build/lint/format, changesets)

## Packages

### `@monorepo/ui` (`packages/korin-ui`)

Core UI components and Tailwind configuration.

- **Exports**:
  - `./globals.css` – Base styles
  - `./tailwind.config` – Tailwind configuration
  - Component entrypoints in `src/*.tsx`
- **Dependencies**: shadcn, Radix UI, Tailwind CSS, clsx, tailwind-merge

### `@korinai/libs` (`packages/korin-libs`)

Shared hooks, contexts, and utilities.

### `@korinai/embed` (`packages/korin-embed`)

Embeddable chat widget for easy integration into any website.

## Apps

### `apps/web`

Documentation and demo site built with Next.js 15.

- **Scripts**:
  - `pnpm dev` – Start development server
  - `pnpm build` – Create production build
  - `pnpm start` – Start production server
  - `pnpm lint` – Run ESLint

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (`npm install -g pnpm`)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sijawara/korin-ui.git
   cd korin-ui
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   # Start the documentation site
   pnpm dev
   ```

   The documentation will be available at `http://localhost:3000`

### Using Korin UI in your project

To use the Korin UI components in your project:

1. Install the required packages:

   ```bash
   pnpm add @monorepo/ui @korinai/libs
   ```

2. Set up your Tailwind config to include Korin UI:

   ```js
   // tailwind.config.js
   const { createGlobPatternsForDependencies } = require("@monorepo/ui/tailwind");

   module.exports = {
     content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", ...createGlobPatternsForDependencies(__dirname)],
     presets: [require("@monorepo/ui/tailwind.config")],
   };
   ```

3. Import and use components:

   ```tsx
   import { Button } from "@monorepo/ui/button";

   function MyComponent() {
     return <Button>Click me</Button>;
   }
   ```

## Development

### Available Scripts

- `pnpm dev` - Start development server for the web app
- `pnpm build` - Build all packages and apps for production
- `pnpm lint` - Lint all files
- `pnpm format` - Format all files with Prettier
- `pnpm changeset` - Create a new changeset
- `pnpm version-packages` - Version packages and update changelogs

### Adding a New Component

1. Use the shadcn CLI to add a new component:

   ```bash
   cd packages/korin-ui
   pnpm shadcn add button
   ```

2. The component will be added to `packages/korin-ui/src/components/ui/`

### Publishing

This monorepo uses Changesets for versioning and publishing. To publish a new version:

1. Create a changeset:

   ```bash
   pnpm changeset
   ```

2. Bump versions and update changelogs:

   ```bash
   pnpm changeset version
   ```

3. Publish packages:
   ```bash
   pnpm -r publish --access public
   ```

## Deployment

You can deploy your full-stack monorepo using platforms like Vercel for the frontend and any Node.js hosting service for the backend (e.g., Heroku, AWS, DigitalOcean).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have suggestions or improvements.

## License

This project is licensed under the MIT License. Feel free to use and modify it according to your needs.

---

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

{% raw %}

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

{% endraw %}

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

{% raw %}

```ts
// Example import
import { Button } from "@monorepo/ui/button";
import "@monorepo/ui/globals.css";
```

{% endraw %}

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
