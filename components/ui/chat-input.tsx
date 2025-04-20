"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Loader2,
  StopCircle,
  AlertOctagon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  isLoading: boolean;
  handleSubmit: (content: string) => Promise<void>;
  onStop?: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
  error?: string | null;
  onRetry?: () => Promise<void>;
  autoFocus?: boolean;
}

export function ChatInput({
  isLoading,
  handleSubmit,
  onStop,
  status = "ready",
  error,
  onRetry,
  autoFocus,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const messageContent = inputValue;
    setInputValue("");
    
    try {
      await handleSubmit(messageContent);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div 
          className={cn(
            "absolute bottom-full w-full mb-2 px-4",
            "transition-all duration-300 ease-in-out",
            showError ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      <form 
        onSubmit={onSubmit} 
        className="relative mx-4 mb-4"
      >
        <div className={cn(
          "relative flex items-center gap-2",
          "rounded-2xl border bg-background",
          "transition-all duration-200 ease-in-out",
          "px-4 py-2 pr-14 shadow-sm hover:shadow-md",
          "h-14"
        )}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Korin..."
            autoFocus={autoFocus}
            className={cn(
              "flex-1 resize-none",
              "bg-transparent",
              "focus:outline-none focus:ring-0",
              "text-base placeholder:text-muted-foreground",
              "h-8 py-1.5",
              "overflow-y-auto"
            )}
            rows={1}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {(status === "streaming" || status === "submitted") && onStop ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onStop}
                className={cn(
                  "h-10 w-10 rounded-xl",
                  "bg-primary/10 hover:bg-primary/20",
                  "transition-all duration-200 ease-in-out",
                  "transform hover:scale-105"
                )}
              >
                <StopCircle className="h-5 w-5 text-primary" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "h-10 w-10 rounded-xl",
                  "transition-all duration-200 ease-in-out",
                  "transform hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  inputValue.trim() && !isLoading 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-muted hover:bg-muted/90"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                ) : (
                  <ArrowUp className={cn(
                    "h-5 w-5",
                    inputValue.trim() 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground"
                  )} />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 