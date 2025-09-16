# Korin UI

Korin UI is a collection of AI-first UI components built on top of shadcn/ui and Tailwind CSS. It ships a remote shadcn registry so you can pull components directly into your app using the shadcn CLI. Components cover a full chat experience (providers, page chat, floating chat button, input with attachments, rich message bubbles, reasoning, file selector, upload flow, and more).

## Quick Install (via shadcn registry)

Use the shadcn CLI to add all Korin UI components at once, pulled from our remote registry:

```bash
npx shadcn@latest add https://ui.korinai.com/all.json
```

You can also install individual components by replacing `all.json` with a specific component name. For example:

```bash
# Single component examples
npx shadcn@latest add https://ui.korinai.com/page-chat.json
npx shadcn@latest add https://ui.korinai.com/chat-input.json
npx shadcn@latest add https://ui.korinai.com/floating-chat.json
```

Where files go:

- Components will be placed under `@/components/korin-ui/*`.
- Dependencies on shadcn primitives will use your local `@/components/ui/*` setup (installed by shadcn).

Prerequisites:

- Next.js 14+ (App Router) or React 18+ environment.
- Tailwind CSS and shadcn/ui configured.
- Icons: `lucide-react`.
- If you use chat-related components, install `ai` (Vercel AI SDK) and the Korin libs package for contexts and hooks.

```bash
pnpm add ai lucide-react @korinai/libs
# or: npm i ai lucide-react @korinai/libs
```

## Getting Started

Most higher-level components rely on app-wide providers for configuration, authentication and agent context. Wrap your app with `KorinProvider`.

```tsx
// app/providers.tsx (Next.js) or your root layout
"use client";

import { KorinProvider } from "@/components/korin-ui/korin-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KorinProvider
      config={{
        baseUrl: "https://your.cdn.or.assets.base/url", // used for logos/images
        chatApi: "/api/chat", // your chat endpoint compatible with Vercel AI SDK
      }}
      // Option A: static token (for testing only)
      // authToken="<JWT or API token>"

      // Option B: async token resolver (recommended)
      getAuthToken={async () => {
        // fetch or compute an access token for your chat API
        return "<JWT or API token>";
      }}
      language="en"
      // translations={customTranslations}
    >
      {children}
    </KorinProvider>
  );
}
```

Use the provider in your root layout:

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Usage Examples

### PageChat (full-page experience)

`PageChat` renders a complete chat surface with header, history, message list, input, file attachments, and agent selection.

```tsx
"use client";
import { PageChat } from "@/components/korin-ui/page-chat";

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <PageChat
        title="Chat with KorinAI"
        // optional UI tuning
        ui={{ showStop: true, showAttach: true, showActions: true }}
        // optional branding
        branding={{
          logoLightUrl: "/logo/KorinAILogo-Black.svg",
          logoDarkUrl: "/logo/KorinAILogo-White.svg",
          headerLogoSize: { width: 28, height: 28 },
        }}
      />
    </div>
  );
}
```

### FloatingChat (button + overlay window)

`FloatingChat` places a floating button at the bottom-right and opens a chat window overlay.

```tsx
"use client";
import { FloatingChat } from "@/components/korin-ui/floating-chat";

export default function FloatingExample() {
  return (
    <>
      {/* Your page content... */}
      <FloatingChat
        title="Chat with KorinAI"
        ui={{ showStop: true, showAttach: true }}
        branding={{
          logoLightUrl: "/logo/KorinAILogo-Black.svg",
          logoDarkUrl: "/logo/KorinAILogo-White.svg",
        }}
      />
    </>
  );
}
```

### ChatInput (compose your own UI)

Use `ChatInput` if you want to build a custom chat surface. It manages textarea sizing, file attachments, agent selection, and submit/stop buttons.

```tsx
"use client";
import { useState } from "react";
import { ChatInput } from "@/components/korin-ui/chat-input";

export default function CustomInput() {
  const [status, setStatus] = useState<"submitted" | "streaming" | "ready" | "error">("ready");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(text: string) {
    try {
      setStatus("submitted");
      // Call your chat API here, stream response, etc.
      await new Promise((r) => setTimeout(r, 800));
      setStatus("ready");
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <ChatInput
        isLoading={status === "submitted"}
        status={status}
        error={error}
        showTemplate={false}
        handleSubmit={handleSubmit}
        onStop={() => setStatus("ready")}
      />
    </div>
  );
}
```

### ChatBubble (render messages)

`ChatBubble` renders rich message parts (text, reasoning, tools, attachments). You can wire it with your own message objects or reuse what `PageChat` composes for you.

```tsx
import { ChatBubble } from "@/components/korin-ui/chat-bubble";

// ... inside a component
<ChatBubble message={{ id: "1", role: "assistant", parts: [{ type: "text", text: "Hello!" }] }} isStreaming={false} />;
```

## Component Inventory

All components currently available in this package (as found under `packages/korin-ui/src/`):

| Component                                                                        | Command                                                                  | Description                                                                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `AvatarKorin`                                                                    | `npx shadcn@latest add https://ui.korinai.com/avatar-korin.json`         | Avatar component with Korin-specific fallback and styling.                                            |
| `ChatBubble`                                                                     | `npx shadcn@latest add https://ui.korinai.com/chat-bubble.json`          | Renders message parts (text, reasoning, tools, file attachments) with confirmations and status pills. |
| `ChatInput`                                                                      | `npx shadcn@latest add https://ui.korinai.com/chat-input.json`           | Multiline input with auto-resize, file attach, agent selector, send/stop controls.                    |
| `ChatLimited`                                                                    | `npx shadcn@latest add https://ui.korinai.com/chat-limited.json`         | Credit limit warning/notice component.                                                                |
| `CodeBlock` / `CodeBlockCopyButton`                                              | `npx shadcn@latest add https://ui.korinai.com/code-block-with-copy.json` | Pretty code block with copy-to-clipboard action.                                                      |
| `CodeBlock` (base)                                                               | `npx shadcn@latest add https://ui.korinai.com/code-block.json`           | Base code block renderer used by `Response` and others.                                               |
| `FilePreviewDialog`                                                              | `npx shadcn@latest add https://ui.korinai.com/file-preview-dialog.json`  | Dialog/overlay for previewing images, video, audio, and documents; supports select mode.              |
| `FileSelector`                                                                   | `npx shadcn@latest add https://ui.korinai.com/file-selector.json`        | Gallery selector with tabs (images, videos, audio, documents) + search + upload integration.          |
| `FloatingChat`                                                                   | `npx shadcn@latest add https://ui.korinai.com/floating-chat.json`        | Floating button + overlay chat window (wraps `PageChat`).                                             |
| `KorinProvider`                                                                  | `npx shadcn@latest add https://ui.korinai.com/korin-provider.json`       | App-level provider that wires `KorinAIProvider` and `AgentProvider`.                                  |
| `SimpleMemoizedMarkdown`                                                         | `npx shadcn@latest add https://ui.korinai.com/memoized-markdown.json`    | Memoized markdown rendering for simple content.                                                       |
| `PageChat`                                                                       | `npx shadcn@latest add https://ui.korinai.com/page-chat.json`            | Full chat surface with header, history list, message list, and input area.                            |
| `Reasoning`, `ReasoningContent`, `ReasoningTrigger`                              | `npx shadcn@latest add https://ui.korinai.com/reasoning.json`            | Collapsible “reasoning” disclosure UI.                                                                |
| `Response`                                                                       | `npx shadcn@latest add https://ui.korinai.com/response.json`             | Hardened Markdown renderer with KaTeX, GFM, streaming-friendly parsing.                               |
| `ScrollAreaExtended`                                                             | `npx shadcn@latest add https://ui.korinai.com/scroll-area-extended.json` | Convenience wrapper around shadcn `ScrollArea` with tweaks.                                           |
| `ToolResults` (`WebSearchResults`, `KnowledgeResults`, `ImageGenerationResults`) | `npx shadcn@latest add https://ui.korinai.com/tool-results.json`         | Renderers for tool outputs.                                                                           |
| `TypingLoader`                                                                   | `npx shadcn@latest add https://ui.korinai.com/typing-loader.json`        | Typing/streaming loader indicator.                                                                    |
| `UploadButton`                                                                   | `npx shadcn@latest add https://ui.korinai.com/upload-button.json`        | Drawer-based upload flow with preview and progress.                                                   |
| `UserConfirmation`                                                               | `npx shadcn@latest add https://ui.korinai.com/user-confirmation.json`    | Generic confirmation UI for tool actions (e.g., git commit/push).                                     |

Notes:

- The remote registry exposes JSON entries that mirror these component names. Replace `all.json` with `<component-name>.json` to install only that component, e.g. `chat-input.json`, `page-chat.json`, `floating-chat.json`, etc.
- Registry output paths are set to `@/components/korin-ui/*` so your imports look like `@/components/korin-ui/page-chat`.

## Minimal chatApi endpoint (Next.js, Vercel AI SDK)

Below is a minimal streaming chat endpoint compatible with `PageChat` and the Vercel AI SDK.

Install deps:

```bash
pnpm add ai @ai-sdk/openai
# or: npm i ai @ai-sdk/openai
```

Create `app/api/chat/route.ts`:

```ts
import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge"; // recommended for streaming

export async function POST(req: NextRequest) {
  // Optional: read auth header
  const authHeader = req.headers.get("authorization");
  // Validate if needed

  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  return result.toAIStreamResponse();
}
```

Environment variable required:

```bash
OPENAI_API_KEY=sk-...
```

Then set `config.chatApi` in `KorinProvider` to `/api/chat`. The `DefaultChatTransport` used by `PageChat` will POST messages to this endpoint and render the streamed response.

## Recipes

### Branding

Most chat surfaces accept a `branding` prop to override logos and sizes:

```tsx
branding={{
  logoLightUrl: "/logo/KorinAILogo-Black.svg",
  logoDarkUrl: "/logo/KorinAILogo-White.svg",
  logoSize: { width: 50, height: 50 },
  headerLogoSize: { width: 28, height: 28 },
  showHeaderLogo: true,
}}
```

### Requests and Auth

`KorinProvider` passes `authToken` (string) or `getAuthToken` (async) down to chat transports (e.g., `PageChat` uses Vercel AI SDK with `Authorization: Bearer <token>` headers). Implement either method to secure your API.

### File uploads and gallery

`ChatInput`, `FileSelector`, and `UploadButton` integrate with hooks from `@korinai/libs` (e.g., `useGallery`, `useGalleryUpload`, `useUser`). Ensure your project provides compatible endpoints and auth.

## Troubleshooting

- If the shadcn CLI asks to overwrite files, review diffs and proceed.
- If imports like `@korinai/libs/...` cannot be resolved, install `@korinai/libs` or set an alias to your implementation.
- Ensure Tailwind CSS and shadcn/ui are configured. Components use shadcn primitives (Button, Card, Dialog, Tabs, etc.).
- Next.js: some components are marked `"use client"` and rely on client-side hooks.

## License

This package is licensed under the MIT License.
