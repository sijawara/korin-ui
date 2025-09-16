# @korinai/embed

Embeddable script to render Korin chat widgets (`FloatingChat` or `PageChat`) on any plain HTML page.

Prefer using a public CDN that serves the published `@korinai/embed` package. No local build or `dist/` path needed.

## Usage (Plain HTML via CDN)

1. Include the script from a CDN

```html
<!-- jsDelivr (recommended) -->
<script src="https://cdn.jsdelivr.net/npm/@korinai/embed@latest/dist/embed.js"></script>
<!-- or unpkg -->
<!-- <script src="https://unpkg.com/@korinai/embed@latest/dist/embed.js"></script> -->
```

2. Create a container element

```html
<div id="korin-floating-chat"></div>
```

3. Initialize the widget

```html
<script>
  // window.KorinAI is exposed by the IIFE build from the CDN
  window.KorinAI.init({
    target: "#korin-floating-chat",
    variant: "floating", // 'floating' | 'page' (default 'floating')

    // Provider options (flattened)
    baseUrl: "https://api.korinai.com",
    chatApi: "https://api.korinai.com/chat",
    minimumCreditsWarning: "10",
    language: "en",
    // authToken: 'YOUR_STATIC_TOKEN',
    // getAuthToken: async () => 'YOUR_DYNAMIC_TOKEN',

    // Optional helpers
    ensureStyles: true, // injects minimal positioning for #korin-floating-chat
    // debugOverlay: true,
    // verbose: true,

    // Component props (forwarded)
    props: {
      // FloatingChat props (when variant: 'floating')
      title: "Chat with KorinAI",
      showFloatingButton: true,
      triggerIconSize: 28,
      branding: { logoSize: { width: 50, height: 50 } },

      // PageChat props can be forwarded directly
      variant: "flat",
      ui: { showAttach: true },
    },
  });

  // Later, you can unmount if needed:
  // window.KorinAI.unmount('#korin-floating-chat')
  // or programmatically toggle floating chat:
  // window.KorinAI.toggleFloatingChat(true)
</script>
```

---

## Public API

- `KorinAI.init(options)` → `{ unmount(): void; el: Element }`
- `KorinAI.unmount(target)`
- `KorinAI.toggleFloatingChat(open?: boolean)`
- Variant-scoped globals: `window.KorinAI.floating`, `window.KorinAI.page` contain `__verbose?`, `__version?`, `__open`, `reload(newOptions?)`.

### InitOptions (passed to `KorinAI.init`)

| Prop                    | Type                      | Default   | Description                                                         |
| ----------------------- | ------------------------- | --------- | ------------------------------------------------------------------- | -------------------------------------- |
| `target`                | `Element                  | string`   | —                                                                   | Element or CSS selector to mount into. |
| `variant`               | `'floating'               | 'page'`   | `'floating'`                                                        | Which UI to render.                    |
| `props`                 | `Record<string, unknown>` | `{}`      | Props forwarded to the rendered component. See tables below.        |
| `ensureStyles`          | `boolean`                 | `true`    | Add minimal positioning/styling to the mount for visibility.        |
| `debugOverlay`          | `boolean`                 | `false`   | Shows a small “mounted” badge for debugging.                        |
| `stylesheetHref`        | `string                   | string[]` | —                                                                   | Load external stylesheet(s) if needed. |
| `verbose`               | `boolean`                 | `false`   | Verbose logs to console.                                            |
| `baseUrl`               | `string`                  | —         | API base URL for the provider.                                      |
| `chatApi`               | `string`                  | —         | Chat API endpoint.                                                  |
| `configLanguage`        | `string`                  | —         | Provider config language field (advanced).                          |
| `minimumCreditsWarning` | `string`                  | —         | Threshold for low-credits notice.                                   |
| `authToken`             | `string`                  | —         | Static token value. Prefer `getAuthToken`.                          |
| `language`              | `string`                  | —         | Provider language prop.                                             |
| `getAuthToken`          | `() => Promise<string>`   | —         | Async token retriever.                                              |
| `translations`          | `ChatTranslations`        | —         | Optional i18n map to override built-in texts (merged per language). |

---

## Component props (forwarded via `init({ props: ... })`)

Below are the most commonly used props. For full type details, see `packages/korin-ui/src/floating-chat.tsx` and `packages/korin-ui/src/page-chat.tsx`.

### FloatingChat props (when `variant: 'floating'`)

| Prop                  | Type                                                                                                                                         | Default  | Description                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `title`               | `string`                                                                                                                                     | —        | Chat title displayed in header.                       |
| `triggerIcon`         | `ReactNode`                                                                                                                                  | —        | Custom trigger content (replaces default icon).       |
| `triggerIconSize`     | `number`                                                                                                                                     | `28`     | Size of the trigger icon in px.                       |
| `buttonClassName`     | `string`                                                                                                                                     | —        | Extra classes for the floating button wrapper.        |
| `chatWindowClassName` | `string`                                                                                                                                     | —        | Extra classes for the floating chat window container. |
| `open`                | `boolean`                                                                                                                                    | —        | Controlled open state. Pair with `onOpenChange`.      |
| `defaultOpen`         | `boolean`                                                                                                                                    | `false`  | Uncontrolled initial open state.                      |
| `onOpenChange`        | `(open: boolean) => void`                                                                                                                    | —        | Called when open state changes.                       |
| `chatProps`           | `PageChatProps`                                                                                                                              | —        | Props forwarded to the inner `PageChat` component.    |
| `showFloatingButton`  | `boolean`                                                                                                                                    | `true`   | Whether to show the floating trigger button.          |
| `title`               | `string`                                                                                                                                     | —        | Header title text.                                    |
| `showCloseButton`     | `boolean`                                                                                                                                    | `false`  | Shows a close button.                                 |
| `onClose`             | `() => void`                                                                                                                                 | —        | Called when close is clicked.                         |
| `hideHistory`         | `boolean`                                                                                                                                    | `false`  | Hides history list.                                   |
| `pageSize`            | `number`                                                                                                                                     | `10`     | History page size.                                    |
| `defaultRoomId`       | `string`                                                                                                                                     | —        | Initial room id.                                      |
| `showRoomName`        | `boolean`                                                                                                                                    | `true`   | Show current room name.                               |
| `onRoomChange`        | `(roomId: string) => void`                                                                                                                   | —        | Notifies room change.                                 |
| `onSend`              | `({ text: string, roomId?: string }) => void`                                                                                                | —        | Called when sending a message.                        |
| `headerRightSlot`     | `ReactNode`                                                                                                                                  | —        | Custom content on header right.                       |
| `variant`             | `'card' \| 'flat'`                                                                                                                           | `'card'` | Visual style.                                         |
| `throttleMs`          | `number`                                                                                                                                     | `0`      | Throttle user typing/sending.                         |
| `requestHeaders`      | `Record<string,string>`                                                                                                                      | `{}`     | Extra headers for API calls.                          |
| `requestBody`         | `Record<string,unknown>`                                                                                                                     | `{}`     | Extra body fields for API calls.                      |
| `ui`                  | `{ showStop?, showAttach?, showActions?, showAgentSelector?, defaultAgentUsername? }`                                                        | —        | UI feature toggles.                                   |
| `branding`            | `{ logoLightUrl?, logoDarkUrl?, logoSize?: {width:number; height:number}, showHeaderLogo?, headerLogoSize?: {width:number; height:number} }` | —        | Branding for the header and content.                  |

### PageChat props (when `variant: 'page'`)

| Prop              | Type                                                                                                                                         | Default  | Description                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| `title`           | `string`                                                                                                                                     | —        | Header title text.                   |
| `showCloseButton` | `boolean`                                                                                                                                    | `false`  | Shows a close button.                |
| `onClose`         | `() => void`                                                                                                                                 | —        | Called when close is clicked.        |
| `hideHistory`     | `boolean`                                                                                                                                    | `false`  | Hides history list.                  |
| `pageSize`        | `number`                                                                                                                                     | `10`     | History page size.                   |
| `defaultRoomId`   | `string`                                                                                                                                     | —        | Initial room id.                     |
| `showRoomName`    | `boolean`                                                                                                                                    | `true`   | Show current room name.              |
| `onRoomChange`    | `(roomId: string) => void`                                                                                                                   | —        | Notifies room change.                |
| `onSend`          | `({ text: string, roomId?: string }) => void`                                                                                                | —        | Called when sending a message.       |
| `headerRightSlot` | `ReactNode`                                                                                                                                  | —        | Custom content on header right.      |
| `variant`         | `'card' \| 'flat'`                                                                                                                           | `'card'` | Visual style.                        |
| `throttleMs`      | `number`                                                                                                                                     | `0`      | Throttle user typing/sending.        |
| `requestHeaders`  | `Record<string,string>`                                                                                                                      | `{}`     | Extra headers for API calls.         |
| `requestBody`     | `Record<string,unknown>`                                                                                                                     | `{}`     | Extra body fields for API calls.     |
| `ui`              | `{ showStop?, showAttach?, showActions?, showAgentSelector?, defaultAgentUsername? }`                                                        | —        | UI feature toggles.                  |
| `branding`        | `{ logoLightUrl?, logoDarkUrl?, logoSize?: {width:number; height:number}, showHeaderLogo?, headerLogoSize?: {width:number; height:number} }` | —        | Branding for the header and content. |

---

## Translations (optional)

You can customize UI texts by passing a `translations` object to `KorinAI.init`. Only provide the keys you want to override; missing keys fall back to the built-in defaults.

Common keys include: `startChat`, `closeChat`, `newChat`, `chatHistory`, `loadingConversation`, `noChatHistory`, `startConversation`, `previous`, `next`, `page`, `of`, `thinking`, `usingTool`, `attachedFile`, `sharedLink`, `failedToLoadHistory`, `tryAgainLater`, `ai`, `helloImYourAIAssistant`, `preparingExperience`.

Example:

```html
<script>
  window.KorinAI.init({
    target: "#korin-floating-chat",
    baseUrl: "https://api.korinai.com",
    variant: "floating",
    language: "en",
    translations: {
      en: {
        startChat: "Start chat",
        thinking: "Thinking…",
        preparingExperience: "Setting things up for you…",
      },
      id: {
        startChat: "Mulai Obrolan",
        thinking: "Memproses…",
      },
    },
    props: { title: "Chat with KorinAI" },
  });
</script>
```

Tip: For the full list of translation keys, see `@korinai/libs` in `contexts/korinai-context.tsx` (type `ChatTranslations`).

## Runtime controls and examples

### Reload with new options (per variant)

```html
<!-- Toggle floating trigger button at runtime -->
<input
  type="checkbox"
  checked
  onchange="window.KorinAI.floating.reload({ props: { showFloatingButton: this.checked } })"
/>
```

### Programmatic open/close (floating)

```js
window.KorinAI.toggleFloatingChat(true); // open
window.KorinAI.toggleFloatingChat(false); // close
```

### Two mounts on the same page

```js
// Floating widget
window.KorinAI.init({
  target: "#korin-floating-chat",
  variant: "floating",
  baseUrl,
  chatApi,
  language: "en",
  props: { title: "Chat" },
});

// Full page widget
window.KorinAI.init({
  target: "#korin-page-chat",
  variant: "page",
  ensureStyles: false,
  baseUrl,
  chatApi,
  language: "en",
  props: { variant: "flat", ui: { showAttach: true } },
});
```

---

## Security notes

- authToken vs getAuthToken: prefer `getAuthToken` for short-lived tokens. Avoid hardcoding secrets in client HTML.
- Serve the CDN script over HTTPS and from a trusted CDN origin (e.g., jsDelivr, unpkg).

## Notes

- The bundle includes all required JS and CSS (Tailwind styles are bundled and scoped to the widget root).
- This package is framework-agnostic for host pages; it only requires a DOM and the CDN script tag.
