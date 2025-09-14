## KorinAI Web (Next.js)

Beginner-friendly guide to develop and run the KorinAI web app.

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm installed globally (`npm i -g pnpm`)

### Scripts (package.json)

- `pnpm dev` – start Next.js in development
- `pnpm build` – build for production
- `pnpm start` – run the production build
- `pnpm lint` – lint the project

### Run locally

From the monorepo root (recommended):

```bash
# install deps once at the repo root
pnpm install

# run only the web app
pnpm dev -F web
```

Then open http://localhost:3000

### How this app uses workspace packages

- `@korinai/libs` – shared hooks and contexts (API access, chat state)
- `@monorepo/ui` – shared UI components and Tailwind config
- `@monorepo/shadcn-ui` – UI primitives

See `packages/korin-libs/README.md` for provider setup and available hooks.

Example Provider usage:

```tsx
// apps/web/src/app/providers.tsx (example)
import { KorinAIProvider } from "@korinai/libs/contexts/korinai-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KorinAIProvider
      config={{ baseUrl: "https://api.example.com", chatApi: "https://api.example.com/chat" }}
      authToken={undefined}
      language="en"
    >
      {children}
    </KorinAIProvider>
  );
}
```

### Useful links

- Next.js docs: https://nextjs.org/docs
- UI components and styles: `packages/korin-ui` (`@monorepo/ui`)
- Shared hooks/contexts: `packages/korin-libs` (`@korinai/libs`)
- Embed script (CDN): `packages/korin-embed` (`@korinai/embed`)

### Deploy

The app can be deployed to Vercel or any platform that supports Next.js 15.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
