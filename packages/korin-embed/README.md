# @korinai/embed

Embeddable script to render Korin chat widgets (`FloatingChat` or `PageChat`) on any plain HTML page.

## Build

- Dev: `pnpm --filter @korinai/embed dev`
- Build (IIFE): `pnpm --filter @korinai/embed build:embed`

Outputs: `packages/korin-embed/dist/embed.js`

## Usage (Plain HTML)

1. Include the script

```html
<script src="/path/to/dist/embed.js"></script>
```

2. Create a container element

```html
<div id="korin-floating-chat"></div>
```

3. Initialize the widget

```html
<script>
  // window.KorinAI is exposed by the IIFE build
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
      // Optional styling hooks for host page
      // buttonClassName: 'bg-emerald-600',
      // chatWindowClassName: 'sm:w-[520px] sm:h-[680px]',

      // PageChat props can be forwarded via chatProps
      // chatProps: { variant: 'flat', ui: { showAttach: true } },
    },
  });

  // Later, you can unmount if needed:
  // window.KorinAI.unmount('#korin-floating-chat')
</script>
```

## API

• __KorinAI.init(options)__
  - __target__: CSS selector or `Element`.
  - __variant__: `'floating' | 'page'` (default `'floating'`).
  - __Provider options__: `baseUrl`, `chatApi`, `minimumCreditsWarning`, `language`, `authToken`, `getAuthToken`.
  - __Other__: `ensureStyles?` (default true), `debugOverlay?`, `verbose?`, `stylesheetHref?`.
  - __props?__: forwarded to the rendered component.
  - Returns `{ unmount(): void, el: Element }`.

• __KorinAI.unmount(target)__
  - Unmount from the given target (selector or `Element`).

• __Variant-scoped globals__ (no root access):
  - `window.KorinAI.floating` and `window.KorinAI.page` each hold variant state:
    - `__verbose?: boolean`
    - `__version?: string`
    - `__open: { get(): boolean; set(open: boolean) }`
    - `reload?: (newOptions?: InitOptions) => void` — re-init the variant mounted at the same target with merged options.

• __Helper__: `window.KorinAI.toggleFloatingChat(open: boolean)` — programmatically open/close the floating chat.

## Customization Reference (concise)

Below is a practical reference of props you can pass via `init({ props: ... })`. For full type details, see source:
- `packages/korin-ui/src/floating-chat.tsx`
- `packages/korin-ui/src/page-chat.tsx`

### FloatingChat (when `variant: 'floating'`)
• __title?: string__ — Chat title.
• __triggerIcon?: ReactNode__ — Custom trigger content.
• __triggerIconSize?: number__ — Trigger icon size in px (default 28).
• __branding?: { logoLightUrl?, logoDarkUrl?, logoSize?: { width:number; height:number }, headerLogoSize?: { width:number; height:number }, showHeaderLogo? }__ — Branding for the embedded UI.
• __buttonClassName?: string__ — Extra classes for the floating button wrapper.
• __chatWindowClassName?: string__ — Extra classes for the floating chat window container.
• __open?: boolean__ — Controlled open state; pair with `onOpenChange`.
• __defaultOpen?: boolean__ — Uncontrolled initial open.
• __onOpenChange?: (open: boolean) => void__ — State change callback.
• __chatProps?: PageChatProps__ — Props forwarded to inner `PageChat` component.
• __showFloatingButton?: boolean__ — Whether to show the floating trigger (default true).

### PageChat (when `variant: 'page'` or via `chatProps`)
• __title?: string__
• __showCloseButton?: boolean__, __onClose?: () => void__
• __hideHistory?: boolean__, __pageSize?: number__
• __defaultRoomId?: string__, __showRoomName?: boolean__
• __onRoomChange?: (roomId: string) => void__, __onSend?: ({ text, roomId }) => void__
• __headerRightSlot?: ReactNode__, __variant?: 'card' | 'flat'__
• __throttleMs?: number__, __requestHeaders?: Record<string,string>__, __requestBody?: {...}__
• __ui?: { showStop?, showAttach?, showActions?, showAgentSelector?, defaultAgentUsername? }__
• __branding?: { logoLightUrl?, logoDarkUrl?, logoSize?: { width:number; height:number }, showHeaderLogo?, headerLogoSize?: { width:number; height:number } }__

## Runtime controls and examples

### Reload with new options (per variant)
```html
<!-- Toggle floating trigger button at runtime -->
<input type="checkbox" checked onchange="window.KorinAI.floating.reload({ props: { showFloatingButton: this.checked } })" />
```

### Programmatic open/close (floating)
```js
window.KorinAI.toggleFloatingChat(true);  // open
window.KorinAI.toggleFloatingChat(false); // close
```

### Two mounts on the same page
```js
// Floating widget
window.KorinAI.init({ target: '#korin-floating-chat', variant: 'floating', baseUrl, chatApi, language: 'en', props: { title: 'Chat' } });

// Full page widget
window.KorinAI.init({ target: '#korin-page-chat', variant: 'page', ensureStyles: false, baseUrl, chatApi, language: 'en', props: { variant: 'flat', ui: { showAttach: true } } });
```

## Security notes
• __authToken vs getAuthToken__: prefer `getAuthToken` for short-lived tokens. Avoid hardcoding secrets in client HTML.
• Host pages should serve `dist/embed.js` from a trusted origin and over HTTPS.

## Notes

- The bundle includes all required JS and CSS (Tailwind is bundled and scoped to `.korinai__root`).
- TypeScript and ESLint extend shared monorepo configs located in `packages/tsconfig/` and `packages/eslint-config/`.
