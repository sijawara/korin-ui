"use client";

import { useKorinAI } from "@korinai/libs/contexts/korinai-context";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { Card } from "@monorepo/shadcn-ui/components/ui/card";
import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@monorepo/shadcn-ui/components/ui/tooltip";
import { PageChat, type PageChatProps } from "@monorepo/ui/page-chat";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { MessageCircleMore } from "lucide-react";
import { useEffect, useState } from "react";

export type FloatingChatProps = {
  className?: string;
  buttonClassName?: string;
  chatWindowClassName?: string;
  title?: string;
  // Trigger icon configuration
  triggerIcon?: React.ReactNode;
  triggerIconSize?: number; // px
  // Branding forwarded to PageChat
  branding?: {
    logoLightUrl?: string;
    logoDarkUrl?: string;
    logoSize?: { width: number; height: number };
    headerLogoSize?: { width: number; height: number };
    showHeaderLogo?: boolean;
  };
  // Controlled open state (headless support)
  open?: boolean; // when provided, component becomes controlled
  defaultOpen?: boolean; // initial state when uncontrolled
  onOpenChange?: (open: boolean) => void; // notify open state changes
  // Forward props to PageChat
  chatProps?: PageChatProps;
  // Floating button configuration
  showFloatingButton?: boolean;
};

export function FloatingChat({
  className,
  buttonClassName,
  chatWindowClassName,
  title = "Chat with KorinAI",
  triggerIcon,
  triggerIconSize = 30,
  branding,
  open,
  defaultOpen,
  onOpenChange,
  chatProps,
  showFloatingButton = true,
}: FloatingChatProps) {
  const { language = "en", config, translations } = useKorinAI();
  const t = translations?.[language] || translations.en!;
  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen ?? false);
  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [showTooltip, setShowTooltip] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowTooltip(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !config.chatApi) return null;

  if (!isOpen) {
    if (!showFloatingButton) return null;

    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                  "rounded-full h-13 w-13 p-0 shadow-lg hover:shadow-xl transition-shadow",
                  buttonClassName,
                )}
                variant="default"
              >
                {triggerIcon ?? <MessageCircleMore style={{ width: triggerIconSize, height: triggerIconSize }} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.startChat}</p>
              <TooltipPrimitive.Arrow />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("fixed sm:bottom-6 sm:right-6 z-50", className)}>
      <Card
        className={cn(
          "flex flex-col p-0 bg-background gap-0",
          "fixed inset-0 rounded-none h-[100dvh] w-screen",
          "sm:static sm:w-[440px] sm:h-[600px] sm:rounded-xl overflow-hidden",
          chatWindowClassName,
        )}
      >
        <PageChat {...chatProps} title={title} showCloseButton onClose={() => setIsOpen(false)} branding={branding} />
      </Card>
    </div>
  );
}
