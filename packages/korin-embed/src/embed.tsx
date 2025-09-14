import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
// Import Tailwind-built CSS and inject it at runtime to avoid requiring a separate <link>
// Vite will process this via postcss/tailwind and give us a CSS string in IIFE build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - inline is a Vite loader query
import "./embed.css";
import { version } from "../package.json";
import type { Root } from "react-dom/client";
import { FloatingChat } from "@monorepo/ui/floating-chat";
import { PageChat } from "@monorepo/ui/page-chat";
import { KorinProvider } from "@monorepo/ui/korin-provider";

// Minimal shims for plain browser environments (no bundler globals)
declare global {
  // eslint-disable-next-line no-var
  var process: { env: Record<string, string | undefined> } | undefined;
  // eslint-disable-next-line no-var
  var global: any;
  interface Window {
    process?: { env: Record<string, string | undefined> };
  }
}

if (typeof window !== "undefined") {
  // Provide a minimal process shim if missing
  if (typeof window.process === "undefined") {
    window.process = { env: {} };
  }
  // Some libs check `global`
  if (typeof (window as any).global === "undefined") {
    (window as any).global = window;
  }
  // Expose React and ReactDOM on window for libraries that try to access globals
  (window as any).React = (window as any).React || React;
  (window as any).ReactDOM = (window as any).ReactDOM || ReactDOMClient;
  // Ensure a structured KorinAI namespace with variant buckets
  if (!(window as any).KorinAI) {
    (window as any).KorinAI = { floating: {}, page: {} };
  } else {
    (window as any).KorinAI.floating = (window as any).KorinAI.floating || {};
    (window as any).KorinAI.page = (window as any).KorinAI.page || {};
  }

  // Inject styles once
  // if (!document.getElementById("korinai-embed-styles")) {
  //   try {
  //     const style = document.createElement("style");
  //     style.id = "korinai-embed-styles";
  //     style.textContent = embedStyles as unknown as string;
  //     document.head.appendChild(style);
  //   } catch {}
  // }
}

export type InitOptions = {
  target: Element | string;
  props?: Record<string, unknown>;
  ensureStyles?: boolean; // apply minimal container styles for visibility/positioning
  debugOverlay?: boolean; // show a small visual marker to confirm mount
  stylesheetHref?: string | string[]; // optional external stylesheet(s) to load for UI styles
  verbose?: boolean; // enable verbose console logs
  // Flattened KorinProvider-related options (previously under `context`)
  baseUrl?: string;
  chatApi?: string;
  configLanguage?: string; // language field used inside config
  minimumCreditsWarning?: string;
  authToken?: string;
  language?: string; // provider prop
  getAuthToken?: () => Promise<string>;
  variant?: "floating" | "page"; // which UI to render
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; variant: "floating" | "page" },
  { hasError: boolean; error?: any }
> {
  constructor(props: { children: React.ReactNode; variant: "floating" | "page" }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = (typeof window !== "undefined" ? window : undefined) as any;
    const variant = this.props.variant || "floating";
    const verbose = !!w?.KorinAI?.[variant]?.__verbose;
    if (verbose) {
      // eslint-disable-next-line no-console
      console.error("[KorinAI] ErrorBoundary caught error:", error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      const w: any = (typeof window !== "undefined" ? window : undefined) as any;
      const variant = this.props.variant || "floating";
      const verbose = !!w?.KorinAI?.[variant]?.__verbose;
      if (verbose) {
        // eslint-disable-next-line no-console
        console.error("[KorinAI] Rendering fallback due to error:", this.state.error);
      }
      return React.createElement(
        "div",
        {
          style: {
            color: "#b91c1c",
            background: "#fee2e2",
            padding: 8,
            border: "1px solid #fecaca",
            borderRadius: 6,
          },
        },
        "KorinAI: Failed to render FloatingChat.\n" + JSON.stringify(this.state.error, null, 2),
      );
    }
    return this.props.children as any;
  }
}

function DebugRoot(props: Record<string, unknown>) {
  // Read flattened provider options passed from init
  const { __flat, ...restProps } = props;
  const flat = __flat as InitOptions | undefined;
  // Infer controlled and default open from forwarded props (FloatingChat only)
  const controlledOpen = (restProps as any)?.open as boolean | undefined;
  const initialDefaultOpen = Boolean((restProps as any)?.defaultOpen ?? (flat as any)?.props?.defaultOpen ?? false);
  const [open, setOpen] = React.useState(initialDefaultOpen);

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const custom = e as CustomEvent;
      setOpen(custom.detail);
    };

    window.addEventListener("korinai_onOpenChange", onChange);
    return () => window.removeEventListener("korinai_onOpenChange", onChange);
  }, []);

  React.useEffect(() => {
    const w: any = (typeof window !== "undefined" ? window : undefined) as any;
    const variant = (flat?.variant as "floating" | "page") || "floating";
    const verbose = !!w?.KorinAI?.[variant]?.__verbose;
    if (verbose) {
      // eslint-disable-next-line no-console
      console.debug("[KorinAI] DebugRoot mounted with props:", props);
    }
    return () => {
      const vw: any = (typeof window !== "undefined" ? window : undefined) as any;
      const v = !!vw?.KorinAI?.[variant]?.__verbose;
      if (v) {
        // eslint-disable-next-line no-console
        console.debug("[KorinAI] DebugRoot unmounted");
      }
    };
  }, []);

  return (
    <KorinProvider
      config={{
        baseUrl: flat?.baseUrl,
        chatApi: flat?.chatApi,
        language: flat?.language,
        minimumCreditsWarning: flat?.minimumCreditsWarning,
      }}
      authToken={flat?.authToken}
      language={flat?.language}
      getAuthToken={flat?.getAuthToken}
    >
      {flat?.variant === "page"
        ? // Render PageChat full widget
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.createElement(PageChat as unknown as React.ComponentType<any>, restProps)
        : // Default to FloatingChat
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.createElement(FloatingChat as unknown as React.ComponentType<any>, {
            ...restProps,
            // Respect controlled open when provided; otherwise use internal state
            open: typeof controlledOpen === "boolean" ? controlledOpen : open,
            onOpenChange: (next: boolean) => {
              setOpen(next);
              const fn = (restProps as any)?.onOpenChange;
              if (typeof fn === "function") {
                try {
                  fn(next);
                } catch {}
              }
            },
          })}
    </KorinProvider>
  );
}

// Keep a weak map of roots to allow unmounting later
const roots = new WeakMap<Element, Root>();
// Track the variant for each mounted root for proper variant-scoped logging
const rootVariants = new WeakMap<Element, "floating" | "page">();

function resolveTarget(target: Element | string): Element | null {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) {
      // eslint-disable-next-line no-console
      console.error("[KorinAI] Target selector did not match any element:", target);
    }
    return el;
  }
  return target;
}

// Simple deep merge for plain objects; arrays and primitives are overwritten by the update value
function isPlainObject(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function deepMerge<T extends Record<string, any>>(base: T, update: Partial<T> | undefined): T {
  if (!update) return base;
  const out: any = { ...base };
  for (const key of Object.keys(update)) {
    const b = (base as any)[key];
    const u = (update as any)[key];
    if (isPlainObject(b) && isPlainObject(u)) {
      out[key] = deepMerge(b, u as any);
    } else {
      out[key] = u;
    }
  }
  return out;
}

export function init(options: InitOptions): {
  unmount: () => void;
  el: Element;
} {
  const requestedVariant = options.variant ?? "floating";
  // Merge with global KorinAI.{floating|page} defaults (explicit options take precedence)
  const w: any = (typeof window !== "undefined" ? window : undefined) as any;
  // Ensure root namespace and the specific variant bucket exist
  w.KorinAI = w.KorinAI || { floating: {}, page: {} };
  w.KorinAI.floating = w.KorinAI.floating || {};
  w.KorinAI.page = w.KorinAI.page || {};
  w.KorinAI[requestedVariant] = w.KorinAI[requestedVariant] || {};
  const globalVariantDefaults = (w.KorinAI[requestedVariant] ?? {}) as Partial<InitOptions> & {
    props?: Record<string, unknown>;
    reload?: (newOptions?: InitOptions) => void;
    __verbose?: boolean;
    __version?: string;
    __open?: {
      get(): boolean;
      set(newVal: boolean): void;
    };
  };
  const mergedOptions: InitOptions = {
    ...globalVariantDefaults,
    ...options,
    // Merge props deeply with precedence to options.props
    props: { ...(globalVariantDefaults.props || {}), ...(options.props || {}) },
    // Ensure variant is the requested one
    variant: requestedVariant,
  };

  const verbose = mergedOptions.verbose === true;
  // store a flag for internal helpers to check
  globalVariantDefaults.__verbose = verbose;
  globalVariantDefaults.reload = (newOptions?: InitOptions) => {
    unmount(el);
    const next = deepMerge(mergedOptions as any, (newOptions || {}) as any);
    init(next);
  };
  globalVariantDefaults.__version = version;
  let _val = false;
  const openController = {
    get() {
      return _val;
    },
    set(newVal: any) {
      _val = Boolean(newVal);
      window.dispatchEvent(new CustomEvent("korinai_onOpenChange", { detail: _val }));
    },
  };
  globalVariantDefaults.__open = openController;

  if (verbose) {
    // eslint-disable-next-line no-console
    console.groupCollapsed("%c[KorinAI] init", "color:#2563eb");
    // eslint-disable-next-line no-console
    console.debug("options:", options);
  }
  const el = resolveTarget(mergedOptions.target);
  if (!el) {
    if (verbose) console.groupEnd();
    throw new Error("KorinAI: target element not found");
  }
  // remember which variant this element hosts
  rootVariants.set(el, requestedVariant);

  // Ensure minimal container styles for visibility if requested (default true)
  const ensureStyles = mergedOptions.ensureStyles !== false;
  if (ensureStyles) {
    const style = (el as HTMLElement).style;
    if (!style.position) style.position = "fixed";
    if (!style.bottom && !style.top) style.bottom = "24px";
    if (!style.right && !style.left) style.right = "24px";
    if (!style.zIndex) style.zIndex = "2147483647"; // bring to front
  }
  // Ensure Tailwind scoping root class exists
  (el as HTMLElement).classList.add("korinai__");

  // If already mounted on this element, unmount first
  const existing = roots.get(el);
  if (existing) {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.debug("[KorinAI] Existing root found. Unmounting before remount.");
    }
    existing.unmount();
    roots.delete(el);
  }

  const root = ReactDOMClient.createRoot(el);
  roots.set(el, root);

  // Spread provided props to FloatingChat in case future customization is needed
  const baseProps = (mergedOptions.props ?? {}) as Record<string, unknown>;

  try {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.debug("[KorinAI] Rendering Korin widget into:", el);
    }
    // Surface visibility/geometry
    try {
      if (verbose) {
        const rect = (el as HTMLElement).getBoundingClientRect?.();
        // eslint-disable-next-line no-console
        console.debug("[KorinAI] target rect:", rect);
        // eslint-disable-next-line no-console
        console.debug("[KorinAI] computed styles:", window.getComputedStyle(el as Element));
      }
    } catch {}

    root.render(
      <React.StrictMode>
        <ErrorBoundary variant={requestedVariant}>
          {/** Casting to any to allow future extensibility of FloatingChat props without TS friction */}
          {React.createElement(DebugRoot as unknown as React.ComponentType<any>, {
            ...baseProps,
            __flat: mergedOptions,
          })}
        </ErrorBoundary>
      </React.StrictMode>,
    );
    if (mergedOptions.debugOverlay) {
      try {
        const badge = document.createElement("div");
        badge.textContent = "KorinAI mounted";
        Object.assign(badge.style, {
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          fontSize: "12px",
          color: "#111827",
          background: "#D1FAE5",
          border: "1px solid #10B981",
          padding: "2px 6px",
          borderRadius: "6px",
          position: "absolute",
          top: "-24px",
          right: "0",
        } as CSSStyleDeclaration);
        (el as HTMLElement).appendChild(badge);
        // Remove after a few seconds
        setTimeout(() => badge.remove(), 3000);
      } catch {}
    }
    if (verbose) {
      // eslint-disable-next-line no-console
      console.debug("[KorinAI] Render call dispatched");
    }
  } catch (e) {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.error("[KorinAI] Render failed:", e);
    }
    throw e;
  } finally {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  return {
    unmount: () => {
      const w: any = (typeof window !== "undefined" ? window : undefined) as any;
      const variant = rootVariants.get(el) || "floating";
      if (w?.KorinAI?.[variant]?.__verbose) {
        // eslint-disable-next-line no-console
        console.debug("[KorinAI] Unmount requested for:", el);
      }
      const r = roots.get(el);
      if (r) {
        r.unmount();
        roots.delete(el);
        rootVariants.delete(el);
      }
    },
    el,
  };
}

export function toggleFloatingChat(open?: boolean) {
  const w: any = (typeof window !== "undefined" ? window : undefined) as any;
  if (w?.KorinAI?.floating?.__verbose) {
    // eslint-disable-next-line no-console
    console.debug("[KorinAI] Toggle requested for:", open);
  }
  w.KorinAI.floating.__open.set(open !== undefined ? Boolean(open) : !w.KorinAI.floating.__open.get());
}

export function unmount(target: Element | string): void {
  const el = resolveTarget(target);
  if (!el) return;
  const r = roots.get(el);
  if (r) {
    const w: any = (typeof window !== "undefined" ? window : undefined) as any;
    const variant = rootVariants.get(el) || "floating";
    if (w?.KorinAI?.[variant]?.__verbose) {
      // eslint-disable-next-line no-console
      console.debug("[KorinAI] Unmount requested for:", el);
    }
    r.unmount();
    roots.delete(el);
    rootVariants.delete(el);
  }
}

// For IIFE build, Vite will attach named exports to the global `KorinAI` object
// using the `name` option in vite.config.ts. No explicit window assignment needed.
