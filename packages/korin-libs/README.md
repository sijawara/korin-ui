# @korinai/libs

Shared hooks, contexts, utils, types, and small UI helpers used across KorinAI apps.

This package provides a thin client layer (SWR-based hooks and utility helpers) to interact with a KorinAI backend and wire up common app state via React contexts.

## Installation

Peer dependencies (not installed automatically):

- react >= 18
- react-dom >= 18
- swr >= 2
- ai >= 5 (only for types used in `ChatMessage`)

Install in your app:

```bash
pnpm add @korinai/libs
# or
npm i @korinai/libs
# or
yarn add @korinai/libs
```

Prerequisites:
- Node.js 18+ (LTS recommended)
- A React 18+ app (Next.js is fine)
- Basic familiarity with SWR (we use it behind the scenes)

## Quick start

Wrap your app with `KorinAIProvider` and then use the hooks you need.

```tsx
import { KorinAIProvider, useKorinAI, useGallery, useMessages } from "@korinai/libs";

export default function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <KorinAIProvider
      config={{ baseUrl: "https://api.example.com" }}
      authToken={"<JWT or session token>"}
      language="en"
      // Optionally provide async token retriever
      // getAuthToken={async () => myTokenGetter()}
    >
      {children}
    </KorinAIProvider>
  );
}

function GalleryExample() {
  const { config, authToken } = useKorinAI();
  const { items, isLoading, isError } = useGallery({ page: 1, limit: 10 });
  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Error loading gallery</div>;
  return (
    <ul>
      {items.map((it) => (
        <li key={it.id}>{it.caption}</li>
      ))}
    </ul>
  );
}
```

Checklist (common gotchas):
- Provide a valid `config.baseUrl` (and `chatApi` if different).
- Pass `authToken` or `getAuthToken` to authenticate requests.
- Ensure your backend exposes the endpoints used by the hooks (see hook names for intent).

---

## Exports overview

All exports are available from the package root `@korinai/libs`.

### Contexts
- `KorinAIProvider(props)` – React provider for global config/auth/language.
- `useKorinAI()` – Access KorinAI context values.
- `KORIN_TRANSLATIONS` – Base translations map.
- Types: `KorinAIConfig`, `AuthToken`, `KorinAIContextType`, `ChatTranslations`.

- `AgentProvider(props)` – Provides current agent state + list from API.
- `useAgent()` – Access selected agent and agent list.
- Type: `Agent`.

### Hooks
- `useAgents(page?: number, limit?: number, search?: string)`
- `useDebouncedValue<T>(value: T, delay: number): T`
- `useGallery(options?: { page?: number; limit?: number; sortBy?: "created_at"|"updated_at"|"file_url"|"caption"; sortOrder?: "asc"|"desc"; showAll?: boolean })`
- `useGalleryDetail(fileId: string | null)`
- `useGalleryUpload()`
- `useIsMobile(): boolean`
- `useMessages(roomId?: string, agentId?: string, agentName?: string)`
- `useRooms(page?: number, limit?: number, participantId?: string)`
- `useSingleRoom(roomId: string, enableSWR?: boolean)`
- `useUser()`

### Utils
- `buildUrl(baseUrl: string, path: string): string`
- `getFileName(path: string): string`
- `getFileCategory(url: string): "image" | "video" | "audio" | "document"`
- `getMimeType(fileUrl: string): string`
- `mimeTypes` – record of file extensions to mime type
- `getLanguageFromFilename(filename: string): string | undefined` (also the file's default export, re-exposed by name)

### UI helpers
- `getFileIcon(fileName: string): ReactElement` – returns an inline SVG element based on file extension

### Types
- `PromptTemplate`
- `FileAttachment`
- `MessageMetadata`
- `ChatMessage` – `UIMessage<MessageMetadata>` from `ai`
- `MimeTypes` – type of `mimeTypes` record
- `FileCategory`
- `Room` (from `useRooms`)

---

## API reference (concise)

### Contexts
#### `KorinAIProvider`
Props:
- `config: KorinAIConfig` – `{ baseUrl?: string; chatApi?: string; minimumCreditsWarning?: string; language?: string }`
- `authToken: string | undefined | null`
- `language?: string`
- `getAuthToken?: () => Promise<string | undefined | null>`
- `translations?: ChatTranslations`

#### `useKorinAI()`
Returns `{ config, setConfig, authToken, setAuthToken, getAuthToken, language, setLanguage, translations }`.

#### `AgentProvider`
Props:
- `initialAgentId?: string` (default: `"fin-advisor"`)
- `onAgentSwitch?: (agent: Agent) => void`

#### `useAgent()`
Returns `{ currentAgent, agents, switchAgent, isLoading, isError }`.

### Hooks
#### `useAgents(page?: number, limit?: number, search?: string)`
Returns `{ agents, currentPage, totalPages, totalItems, isLoading, isError, mutate }`.

Example:
```tsx
import { useAgents } from "@korinai/libs";

export function AgentsList() {
  const { agents, isLoading, isError } = useAgents(1, 20, "designer");
  if (isLoading) return <p>Loading agents…</p>;
  if (isError) return <p>Failed to load agents</p>;
  return (
    <ul>
      {agents.map((a) => (
        <li key={a.id}>{a.name}</li>
      ))}
    </ul>
  );
}
```

Loading and error states:
- `isLoading`: boolean, true while request in-flight or initial SWR state.
- `isError`: `Error | any` from SWR; treat as truthy if present.

#### `useDebouncedValue<T>(value: T, delay: number): T`
Returns a debounced value after `delay` ms.

#### `useGallery(options?)`
Options: `{ page?, limit?, sortBy?, sortOrder?, showAll? }`.
Returns `{ items, total, page, totalPages, isLoading, isError, mutate }`.

#### `useGalleryDetail(fileId)`
Returns `{ detail, isLoading, isError, mutate }` for a single gallery item.

#### `useGalleryUpload()`
Returns `{ uploadFile(file: File, isPublic: boolean, accessEmails: string[], isKnowledge?: boolean): Promise<{ success: boolean; fileUrl?: string; galleryId?: string; caption?: string; error?: string }>, isUploading, uploadProgress }`.

#### `useIsMobile()`
Heuristic combining viewport width and UA data; returns `boolean`.

#### `useMessages(roomId?, agentId?, agentName?)`
Returns `{ messages, isLoading, isError, mutate }` from the messages endpoint.

Example:
```tsx
import { useMessages } from "@korinai/libs";

export function MessagesView({ roomId }: { roomId: string }) {
  const { messages, isLoading, isError } = useMessages(roomId);
  if (isLoading) return <p>Loading messages…</p>;
  if (isError) return <p>Failed to load messages</p>;
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
    </div>
  );
}
```

Loading and error states:
- `isLoading`: boolean, true while fetching.
- `isError`: `Error | any`.

#### `useRooms(page?, limit?, participantId?)`
Exports type `Room`. Returns `{ rooms, currentPage, totalPages, totalItems, isLoading, isError, mutate }`.

Example:
```tsx
import { useRooms } from "@korinai/libs";

export function RoomsGrid() {
  const { rooms, isLoading, isError } = useRooms(1, 12);
  if (isLoading) return <p>Loading rooms…</p>;
  if (isError) return <p>Failed to load rooms</p>;
  return (
    <ul>
      {rooms.map((r) => (
        <li key={r.id}>{r.name}</li>
      ))}
    </ul>
  );
}
```

Loading and error states:
- `isLoading`: boolean, true until initial list is loaded.
- `isError`: `Error | any`.

#### `useSingleRoom(roomId, enableSWR = true)`
Fetch one room by id. Returns `{ room, isLoading, isError, mutate }`.

#### `useUser()`
Returns `{ user, isLoading, isError, mutate }`.

### Utils
See the list in Exports; each function is a thin, tree-shakeable helper without side effects.

### UI helpers
`getFileIcon(fileName)` returns a sized inline SVG for common file types.

---

## Module format and bundling

This package ships ESM and CJS builds with type declarations:

- ESM: `dist/index.mjs`
- CJS: `dist/index.cjs`
- Types: `dist/index.d.ts`

It also supports subpath imports for deeper paths, e.g. `@korinai/libs/hooks/useGallery`.

Tree-shaking is supported; all modules are side-effect free (`"sideEffects": false`).

---

## Subpath imports

You can import specific modules directly for optimal tree-shaking:

```ts
// Hooks
import { useGallery } from "@korinai/libs/hooks/useGallery";
import { useAgents } from "@korinai/libs/hooks/useAgents";
import { useRooms } from "@korinai/libs/hooks/useRooms";

// Contexts
import { KorinAIProvider } from "@korinai/libs/contexts/korinai-context";

// Utils and UI
import { buildUrl } from "@korinai/libs/libs/build-url";
import { getFileIcon } from "@korinai/libs/ui/getFileIcon";
```

---

## Type definitions location

To keep this README concise (no duplicated schemas), refer to the source files for exact field shapes:

- `PromptTemplate`, `FileAttachment`, `MessageMetadata`, `ChatMessage` – `packages/korin-libs/types/index.ts`
- `Room` – exported from `packages/korin-libs/hooks/useRooms.ts`
- `MimeTypes` – in `packages/korin-libs/libs/mimeTypes.ts`
- File category types – `packages/korin-libs/libs/fileCategories.ts`

## Contributing

- Keep APIs small and composable.
- Prefer named exports.
- Add minimal JSDoc/TSdoc above public functions.
- Update this README when adding or changing exports.

## License

ISC © KorinAI
