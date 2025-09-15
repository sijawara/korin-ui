"use client";

import { CheckIcon, CopyIcon, Loader2, Square } from "lucide-react";
import type {
  ComponentProps,
  HTMLAttributes,
  ReactNode,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@monorepo/shadcn-ui/button";
import { cn } from "@monorepo/shadcn-ui/libs/utils";
import {
  CodeBlock as UiCodeBlock,
  CodeBlockCode,
} from "@monorepo/ui/code-block";

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
  // Visual variant: default code highlighting vs terminal view
  variant?: "code" | "terminal";
  // Compact paddings and smaller font size
  compact?: boolean;
  // Optional title shown in unified header
  title?: string;
  // Back-compat alias for title (will be used if title not provided)
  terminalTitle?: string;
  // Collapsible content handling
  collapsible?: boolean; // enable collapsing when content overflows (default: true)
  expanded?: boolean; // controlled expanded state (optional)
  onExpandChange?: (expanded: boolean) => void;
  collapsedMaxHeight?: number; // in px (default 160)
  collapseByDefault?: boolean; // start collapsed initially (default: false)
  // Virtualization for large outputs (plain text rendering)
  virtualize?: boolean;
  estimatedLineHeight?: number; // px, default 16
  maxHeight?: number; // px max height when virtualized, default 400
  // Auto-scroll to bottom while content is streaming
  isStreaming?: boolean;
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers: _showLineNumbers = false,
  className,
  children,
  variant = "code",
  compact = true,
  title,
  terminalTitle,
  collapsible = true,
  expanded,
  onExpandChange,
  collapsedMaxHeight = 160,
  collapseByDefault = false,
  virtualize = false,
  estimatedLineHeight = 16,
  maxHeight = 400,
  isStreaming = false,
  ...props
}: CodeBlockProps) => {
  const paddingClass = compact
    ? "[&>pre]:px-2.5 [&>pre]:py-2.5"
    : "[&>pre]:px-4 [&>pre]:py-4";
  const textSizeClass = compact ? "text-[12px]" : "text-[13px]";
  const [isExpanded, setIsExpanded] = useState<boolean>(
    expanded ?? !collapseByDefault
  );
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const displayTitle = title ?? terminalTitle ?? "";
  const lines = useMemo(
    () => (virtualize ? code.split("\n") : []),
    [virtualize, code]
  );
  const rowVirtualizer = useVirtualizer({
    count: virtualize ? lines.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimatedLineHeight,
    overscan: 16,
  });

  useEffect(() => {
    if (expanded === undefined) return;
    setIsExpanded(expanded);
  }, [expanded]);

  useEffect(() => {
    if (!collapsible) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight } = el;
    setIsOverflowing(scrollHeight > clientHeight + 1);
  }, [collapsible, code, language, compact, collapsedMaxHeight, virtualize]);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (!isStreaming) return;
    if (!isExpanded) return;
    if (virtualize) {
      // Scroll last line into view
      try {
        const lastIndex = Math.max(0, (lines?.length ?? 1) - 1);
        rowVirtualizer.scrollToIndex(lastIndex, { align: "end" });
      } catch {
        // no-op
      }
      return;
    }
    const el = scrollContainerRef.current;
    if (!el) return;
    // Schedule after layout so scrollHeight is updated with new content
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [code, isStreaming, isExpanded, virtualize, rowVirtualizer, lines.length]);

  // Sticky header removed

  const handleToggle = (e?: ReactMouseEvent) => {
    // If user is selecting text, don't toggle
    if (e) {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, textarea, select, [contenteditable="true"], [role="button"], [data-no-toggle="true"]'
        );
        if (interactive) return;
      }
      const sel =
        typeof window !== "undefined" ? window.getSelection?.() : null;
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    }

    if (!collapsible) return;
    const next = !isExpanded;
    setIsExpanded(next);
    onExpandChange?.(next);
  };

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div className="relative">
        <UiCodeBlock
          className={cn(
            "relative w-full rounded-xl border-border bg-muted/20",
            "overflow-hidden",
            className
          )}
          {...props}
        >
          <div
            ref={scrollContainerRef}
            className={cn("relative overflow-hidden overflow-x-auto", {
              "overflow-y-auto": collapsible && isExpanded,
            })}
            style={{
              maxHeight:
                collapsible && !isExpanded
                  ? collapsedMaxHeight
                  : virtualize
                    ? maxHeight
                    : undefined,
            }}
            onClick={collapsible ? handleToggle : undefined}
          >
            <div
              className={cn(
                "flex items-center justify-between border-b px-2 py-1.5",
                "border-border/40 bg-muted/30"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="ml-2 truncate text-xs font-mono text-muted-foreground"
                  title={language}
                >
                  {language}
                </span>
                {displayTitle && (
                  <span
                    className="ml-2 truncate text-xs text-muted-foreground"
                    title={displayTitle}
                  >
                    {displayTitle}
                  </span>
                )}
              </div>
              {children && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </div>
              )}
            </div>

            {/* Content */}
            {!virtualize ? (
              <div className={cn("relative")}>
                <CodeBlockCode
                  code={code}
                  language={language}
                  className={cn(textSizeClass, paddingClass, "bg-background")}
                />
              </div>
            ) : (
              <div
                className={cn("relative")}
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((vi) => (
                  <div
                    key={vi.key}
                    data-index={vi.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vi.start}px)`,
                      paddingLeft: compact ? 8 : 12,
                      paddingRight: compact ? 8 : 12,
                      paddingTop: compact ? 4 : 6,
                      paddingBottom: 0,
                      whiteSpace: "pre",
                    }}
                    className={cn("font-mono", textSizeClass)}
                  >
                    {lines[vi.index]}
                  </div>
                ))}
              </div>
            )}

            {collapsible && !isExpanded && isOverflowing && (
              <div
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/90 to-transparent cursor-pointer"
                onClick={handleToggle}
              />
            )}
          </div>
        </UiCodeBlock>
      </div>
    </CodeBlockContext.Provider>
  );
};

// Convenience component for terminal blocks
export type TerminalBlockProps = Omit<
  CodeBlockProps,
  "variant" | "language"
> & { language?: string };
export const TerminalBlock = ({
  language = "bash",
  ...props
}: TerminalBlockProps) => (
  <CodeBlock variant="terminal" language={language} {...props} />
);

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn(
        "h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={12} />}
    </Button>
  );
};

export type CodeBlockStopButtonProps = ComponentProps<typeof Button> & {};
export const CodeBlockStopButton = ({
  className,
  ...props
}: CodeBlockStopButtonProps) => (
  <Button
    size="icon"
    variant="ghost"
    className={cn(
      "h-6 w-6 p-0 shrink-0 text-destructive hover:bg-destructive/10",
      className
    )}
    data-no-toggle="true"
    {...props}
  >
    <Square className="h-3.5 w-3.5" />
  </Button>
);

export const CodeBlockSpinner = ({ className }: { className?: string }) => (
  <Loader2
    className={cn("h-3.5 w-3.5 animate-spin text-muted-foreground", className)}
  />
);
