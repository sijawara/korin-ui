"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@monorepo/shadcn-ui/components/ui/collapsible";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, memo, useContext, useEffect, useState, useRef } from "react";
import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { Response } from "@monorepo/ui/response";
import { ScrollArea } from "@monorepo/ui/scroll-area-extended";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  initialDuration?: number; // For saved messages that already have a duration
};

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = false,
    onOpenChange,
    duration: durationProp,
    initialDuration,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: initialDuration || 0,
    });

    const [hasAutoClosedRef, setHasAutoClosedRef] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setDuration(Math.round((Date.now() - startTime) / 1000));
        setStartTime(null);
      }
    }, [isStreaming, startTime, setDuration]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (isStreaming && !isOpen) {
        setIsOpen(true);
      } else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosedRef(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosedRef]);

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
    };

    return (
      <ReasoningContext.Provider
        value={{
          isStreaming,
          isOpen: isOpen ?? false,
          setIsOpen,
          duration: duration ?? 0,
        }}
      >
        <Collapsible
          className={cn("not-prose mb-4", className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  },
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title?: string;
};

export const ReasoningTrigger = memo(
  ({ className, title = "Reasoning", children, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          "flex items-center gap-2 text-muted-foreground/70 text-sm hover:text-muted-foreground transition-colors",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainIcon className="size-4 opacity-70" />
            {isStreaming ? (
              <p className="text-muted-foreground/70">Thinking...</p>
            ) : duration > 0 ? (
              <p className="text-muted-foreground/70">Thought for {duration} seconds</p>
            ) : (
              <p className="text-muted-foreground/70">Thought</p>
            )}
            <ChevronDownIcon
              className={cn("size-4 text-muted-foreground/70 transition-transform", isOpen ? "rotate-180" : "rotate-0")}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  },
);

export type ReasoningContentProps = ComponentProps<typeof CollapsibleContent> & {
  children: string;
};

export const ReasoningContent = memo(({ className, children, ...props }: ReasoningContentProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { isStreaming } = useReasoning();

  // Auto-scroll to bottom when content changes during streaming
  useEffect(() => {
    if (isStreaming && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [children, isStreaming]);

  return (
    <CollapsibleContent
      className={cn(
        "mt-4 text-sm",
        "text-muted-foreground/80 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
        className,
      )}
      {...props}
    >
      <ScrollArea viewportClassName="max-h-32" refOnViewport={true} ref={viewportRef}>
        <Response className="grid gap-2 text-muted-foreground/80 pr-4">{children}</Response>
      </ScrollArea>
    </CollapsibleContent>
  );
});

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";
