import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@monorepo/shadcn-ui/alert-dialog";
import { Button } from "@monorepo/shadcn-ui/button";
import { FilePreviewDialog } from "@monorepo/ui/file-preview-dialog";
import type { ChatMessage, FileAttachment, MessageMetadata } from "@korinai/libs/types";
import { SimpleMemoizedMarkdown } from "@monorepo/ui/memoized-markdown";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@monorepo/ui/reasoning";
import { ImageGenerationResults, KnowledgeResults, WebSearchResults } from "@monorepo/ui/tool-results";
import { TypingLoader } from "@monorepo/ui/typing-loader";
import { UserConfirmation } from "@monorepo/ui/user-confirmation";
import type { StaticToolError, StaticToolResult, TextPart, UIMessagePart } from "ai";
import { CheckCircle, Copy, Loader2, Paperclip, Play, RefreshCw, Trash2, XCircleIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@monorepo/shadcn-ui/libs/utils";

/**
 * Expected message structure:
 * {
 *   id: string;
 *   role: 'user' | 'assistant';
 *   metadata?: {
 *     sender_info?: {
 *       sender_id?: string;
 *       username?: string;
 *       profile_picture_url?: string;
 *     };
 *     file_attachments?: Array<{
 *       gallery_id: string;
 *       file_caption: string;
 *       file_url: string;
 *     }>;
 *   };
 *   parts: MessagePart[];
 * }
 *
 * Message Part Types and Structures:
 *
 * 1. Text Message:
 * {
 *   type: 'text',
 *   text: string
 * }
 *
 * 2. Reasoning:
 * {
 *   type: 'reasoning',
 *   text: string
 * }
 *
 * 3. Web Search:
 * {
 *   type: 'tool-web_search',
 *   state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error',
 *   input?: { query: string },
 *   output?: {
 *     data: Array<{
 *       id: string;
 *       title: string;
 *       url: string;
 *       text: string;
 *       image?: string;
 *       publishedDate?: string;
 *     }>
 *   }
 * }
 *
 * 4. Knowledge Search:
 * {
 *   type: 'tool-get_relevant_knowledge',
 *   state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error',
 *   input?: { query: string },
 *   output?: {
 *     data: Array<{
 *       id: string;
 *       content: string;
 *       source?: string;
 *       score?: number;
 *       metadata?: Record<string, string | number | boolean>;
 *       timestamp?: string;
 *     }>
 *   }
 * }
 *
 * 5. Other Tool Messages:
 * {
 *   type: 'tool-*',          // Any other tool type
 *   state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error',
 *   input?: any,
 *   output?: any
 * }
 *
 * Note: File attachments are stored in message metadata, not in individual parts
 */

// Custom CSS for faster spinning animation
const spinnerStyles = `
  @keyframes korinai-spin-fast {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-korinai-spin-fast {
    animation: korinai-spin-fast 0.5s linear infinite;
  }
`;

// Helper function to get status badge with animated gradient for running states
const getStatusBadge = (status: string, toolName: string, onResendCommand?: () => void) => {
  const labels = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "output-available": "Completed",
    "output-error": "Error",
  } as const;

  // For running states (input-streaming, input-available), use animated gradient
  if (status === "input-streaming" || status === "input-available") {
    const icon =
      status === "input-streaming" ? (
        <Loader2 className="w-3 h-3 animate-korinai-spin-fast" />
      ) : (
        <Loader2 className="w-3 h-3 animate-korinai-spin-fast" />
      );

    const displayText = status === "input-available" ? "Applying" : toolName;

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-400/60 via-slate-200/90 to-gray-400/60 dark:from-gray-500/40 dark:via-gray-400/50 dark:to-gray-500/40 animate-gradient-x bg-200% backdrop-blur-sm shadow-sm border border-gray-300/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
        {icon}
        {displayText}
      </div>
    );
  }

  // For completed states, use more prominent styling
  const icons = {
    "output-available": <CheckCircle className="size-4 text-green-600" />,
    "output-error": <XCircleIcon className="size-4 text-red-600" />,
  } as const;

  const statusLabel = labels[status as keyof typeof labels] || "Completed";

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      {icons[status as keyof typeof icons] || <CheckCircle className="size-4" />}
      <span className="text-muted-foreground">{toolName}</span>
      <span className="text-muted-foreground/70 text-xs">• {statusLabel}</span>
      {toolName.toLowerCase().includes("command") && onResendCommand && (
        <Button size="icon" variant="ghost" className="h-6 w-6 p-0" aria-label="Run command" onClick={onResendCommand}>
          <Play className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

// Helper function to render tool states as simple pills
function ToolPill({ part }: { part: any }) {
  // Early return if part is incomplete or invalid
  if (!part || !part.type) {
    return null;
  }

  // If it's a tool part but state is null/undefined, treat it as loading
  const state = part.state || "input-streaming";

  // For routing_to_agent tools, try to extract the agent name
  if (part.type === "tool-routing_to_agent") {
    // Try to get agent name from input first, then output (both nullable)
    const agentName = part.input?.agent_name || part.output?.agent_name;

    if (agentName) {
      // Format the agent name nicely
      const displayName = agentName
        .replace(/[-_]/g, " ")
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      return getStatusBadge(state, displayName);
    }
  }

  // Use the tool type as-is, just remove 'tool-' prefix if present and format it
  const toolName = part.type.startsWith("tool-")
    ? part.type
        .slice(5) // Remove 'tool-' prefix
        .replace(/[-_]/g, " ") // Replace - and _ with spaces
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : part.type;

  return getStatusBadge(state, toolName);
}

// FileAttachment component for file previews
function FileAttachment({
  file_url,
  caption,
  effectiveIsMe,
  onOpen,
}: {
  file_url: string;
  caption?: string;
  effectiveIsMe: boolean;
  onOpen: () => void;
}) {
  const displayCaption = useMemo(() => {
    if (!caption) return "Attached file";
    return caption.length > 20 ? caption.substring(0, 20) + "..." : caption;
  }, [caption]);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-border/5 hover:border-border/20 hover:shadow-sm",
        {
          "bg-primary/5 hover:bg-primary/10": effectiveIsMe,
          "bg-muted/60 hover:bg-muted": !effectiveIsMe,
        },
      )}
      onClick={onOpen}
    >
      <div
        className={cn("flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors", {
          "bg-primary/10 text-primary group-hover:bg-primary/20": effectiveIsMe,
          "bg-muted text-muted-foreground group-hover:bg-muted/80": !effectiveIsMe,
        })}
      >
        <Paperclip className="h-4 w-4" />
      </div>
      <span
        className={cn("text-sm font-medium truncate", {
          "text-primary/90": effectiveIsMe,
          "text-muted-foreground": !effectiveIsMe,
        })}
      >
        {displayCaption}
      </span>
    </div>
  );
}

// Update MessagePart to use message metadata
function MessagePart({
  part,
  messageId,
  index,
  isMe = false,
  metadata,
  isStreaming = false,
  isReasoningActive = false,
  isLastReasoningPart = false,
  onToolConfirm,
  onToolCancel,
  roomId,
}: {
  part: UIMessagePart<any, any>;
  messageId: string;
  index: number;
  isMe?: boolean;
  metadata?: MessageMetadata;
  isStreaming?: boolean;
  isReasoningActive?: boolean;
  isLastReasoningPart?: boolean;
  onToolConfirm?: (data: Partial<StaticToolResult<any>>) => void;
  onToolCancel?: (data: Partial<StaticToolError<any>>) => void;
  roomId?: string;
}) {
  const [openFilePreviewIndex, setOpenFilePreviewIndex] = useState<number | null>(null);

  // Early return if part is incomplete or invalid
  if (!part) {
    return null;
  }

  // Remove the malformed data check since we now handle null states gracefully
  // The ToolPill component will handle null states by defaulting to 'input-streaming'

  // Render file attachments if present in metadata
  const renderFileAttachments = () => {
    if (metadata?.file_attachments?.length) {
      return metadata.file_attachments.map((attachment: FileAttachment, idx: number) => (
        <React.Fragment key={`${messageId}-attachment-${idx}`}>
          <FileAttachment
            file_url={attachment.file_url}
            caption={attachment.file_caption}
            effectiveIsMe={isMe}
            onOpen={() => setOpenFilePreviewIndex(idx)}
          />
          {openFilePreviewIndex === idx && (
            <FilePreviewDialog
              url={attachment.file_url}
              name={attachment.file_caption || "Attached file"}
              open={true}
              onOpenChange={(open) => {
                if (!open) setOpenFilePreviewIndex(null);
              }}
            />
          )}
        </React.Fragment>
      ));
    }
    return null;
  };

  // Plain text renderer with auto-link and line breaks for user messages
  function PlainTextWithLinks({ text, className = "" }: { text: string; className?: string }) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split(/\r?\n/);
    return (
      <div className={className}>
        {lines.map((line, i) => {
          const segments = [] as React.ReactNode[];
          let lastIndex = 0;
          const matches = [...line.matchAll(urlRegex)];
          if (matches.length === 0) {
            segments.push(line);
          } else {
            for (const m of matches) {
              const start = m.index ?? 0;
              const end = start + m[0].length;
              if (start > lastIndex) segments.push(line.slice(lastIndex, start));
              const href = m[0];
              segments.push(
                <a
                  key={`link-${i}-${start}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {href}
                </a>,
              );
              lastIndex = end;
            }
            if (lastIndex < line.length) segments.push(line.slice(lastIndex));
          }
          return (
            <React.Fragment key={`line-${i}`}>
              {segments}
              {i < lines.length - 1 ? <br /> : null}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (part.type === "step-start" || (part.type === "text" && !part.text.trim())) {
    return null;
  }

  return (
    <div className="w-full space-y-2 bg-200%">
      {/* Render the file attachments if present */}
      {renderFileAttachments()}

      {/* Render the regular message content */}
      {part.type === "text" && part.text && (
        <div className={cn("message-block w-full", { "flex justify-end": isMe })}>
          <div
            className={cn({
              "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[85%] break-words":
                isMe,
              "text-foreground": !isMe,
            })}
          >
            {isMe ? (
              <PlainTextWithLinks text={part.text} className={"text-inherit"} />
            ) : (
              <SimpleMemoizedMarkdown content={part.text} className={"text-foreground"} />
            )}
          </div>
        </div>
      )}

      {part.type === "reasoning" && part.text && (
        <div className="w-full">
          <Reasoning
            className="w-full"
            isStreaming={part.type === "reasoning" && isReasoningActive && isLastReasoningPart}
            defaultOpen={isReasoningActive && isLastReasoningPart ? true : false}
          >
            <ReasoningTrigger />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        </div>
      )}

      {part.type === "tool-web_search" && (
        <div className="not-prose w-full">
          <div className="mb-2">
            <ToolPill part={part} />
          </div>
          {part.output?.data && <WebSearchResults results={part.output.data} />}
        </div>
      )}

      {part.type === "tool-get_relevant_knowledge" && (
        <div className="not-prose w-full">
          <div className="mb-2">
            <ToolPill part={part} />
          </div>
          {part.output?.data?.results && <KnowledgeResults results={part.output.data.results} />}
        </div>
      )}

      {/* User confirmation for tool actions (e.g., git commit, push, etc.) */}
      {part.type?.startsWith("tool-") && (onToolConfirm || onToolCancel) && (
        <div className="not-prose w-full">
          <div className="mb-2">
            <ToolPill part={part} />
          </div>
          {(() => {
            const p: any = part as any;
            return (
              <UserConfirmation
                type={p.type}
                state={p.state}
                input={p.input}
                output={p.output}
                onConfirm={() =>
                  onToolConfirm?.({
                    type: "tool-result",
                    output: p.output,
                    input: p.input,
                  })
                }
                onCancel={() =>
                  onToolCancel?.({
                    type: "tool-error",
                    error: "canceled",
                    input: p.input,
                  })
                }
              />
            );
          })()}
        </div>
      )}

      {(part.type === "tool-image_editing" || part.type === "tool-image_generation") && (
        <div className="not-prose w-full">
          <div className="mb-2">
            <ToolPill part={part} />
          </div>
          <ImageGenerationResults part={part} results={part.output?.artifacts ?? []} />
        </div>
      )}

      {part.type.startsWith("tool-") &&
        !["tool-web_search", "tool-get_relevant_knowledge", "tool-image_generation", "tool-image_editing"].includes(
          part.type,
        ) &&
        !(onToolConfirm || onToolCancel) && (
          <div className="not-prose w-full">
            <div className="mb-2">
              <ToolPill part={part} />
            </div>
          </div>
        )}
    </div>
  );
}

function ChatBubbleComponent({
  message,
  isStreaming,
  isReasoningActive,
  onHyperlinkClicked,
  onMessageDeleted,
  onRegenerate,
  isCreditLimited,
  onContinue,
  onToolConfirm,
  onToolCancel,
  roomId,
  onError,
  showActions = true,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  isReasoningActive?: boolean;
  onHyperlinkClicked?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMessageDeleted?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  isCreditLimited?: boolean;
  onContinue?: () => void;
  onToolConfirm?: (data: Partial<StaticToolResult<any>>) => void;
  onToolCancel?: (data: Partial<StaticToolError<any>>) => void;
  roomId?: string;
  onError?: (error: string) => void;
  showActions?: boolean;
}) {
  const isMe = message.role === "user";
  const isAI = message.role === "assistant";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Find the index of the last reasoning part in the message
  const lastReasoningPartIndex = useMemo(() => {
    if (!message.parts) return -1;
    for (let i = message.parts.length - 1; i >= 0; i--) {
      if (message.parts[i].type === "reasoning") {
        return i;
      }
    }
    return -1;
  }, [message.parts]);

  // Show continue banner if the last part is explicitly marked as 'streaming', regardless of type
  const isLastPartStreaming = useMemo(() => {
    if (!message.parts || message.parts.length === 0) return false;
    const lastPart: any = message.parts.at(-1);
    return (lastPart?.state ?? null) === "streaming";
  }, [JSON.stringify(message.parts)]);

  // Also show banner if the last part is a tool, regardless of its state
  const isLastPartTool = useMemo(() => {
    if (!message.parts || message.parts.length === 0) return false;
    const lastPart: any = message.parts.at(-1);
    return Boolean(lastPart?.type?.startsWith("tool-"));
  }, [JSON.stringify(message.parts)]);

  const isLastPartEmpty = useMemo(() => {
    if (!message.parts || message.parts.length === 0) return false;
    const lastPart: any = message.parts.at(-1);
    return Boolean(lastPart?.text?.trim() === "");
  }, [JSON.stringify(message.parts)]);

  // Memoize sender info lookup to avoid recalculation on every render
  const senderInfo = useMemo(() => {
    const metadata = message.metadata;
    if (metadata?.sender_info) return metadata.sender_info;
    return null;
  }, [message.metadata]);

  // Memoize computed values
  const username = useMemo(() => {
    return senderInfo?.username || (isAI ? "Assistant" : "User");
  }, [senderInfo?.username, isAI]);

  const profilePictureUrl = useMemo(() => {
    return senderInfo?.profile_picture_url;
  }, [senderInfo?.profile_picture_url]);

  // Extract text content from message parts for copying
  const messageTextContent = useMemo(() => {
    return (
      message.parts
        ?.filter((part) => part.type === "text")
        ?.map((part) => (part as TextPart).text)
        ?.join("\n")
        ?.trim() || ""
    );
  }, [JSON.stringify(message.parts)]);

  // Handle copy text
  const handleCopyText = useCallback(async () => {
    if (!messageTextContent) {
      onError?.("No text content to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(messageTextContent);
    } catch (error) {
      console.error("Failed to copy text:", error);
      onError?.("Failed to copy text");
    }
  }, [messageTextContent]);

  // Handle delete message
  const handleDeleteMessage = useCallback(() => {
    if (onMessageDeleted) {
      onMessageDeleted(message.id);
    }
    setShowDeleteDialog(false);
  }, [onMessageDeleted, message.id]);

  // Handle delete button click (show confirmation)
  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyles }} />
      <div
        className={cn("chat-bubble flex group w-full max-w-3xl mx-auto", {
          "justify-end": isMe,
          "justify-start": !isMe,
        })}
      >
        {/* Message content */}
        <div
          className={cn("flex flex-col gap-3 relative w-full max-w-2xl", {
            "items-end": isMe,
            "items-start": !isMe,
          })}
        >
          {/* Username */}
          <div
            className={cn("text-xs text-muted-foreground w-full", {
              "text-right": isMe,
              "text-left": !isMe,
            })}
          >
            {username}
          </div>

          {/* Render message parts in their natural order */}
          <div className="w-full space-y-3">
            {message.parts?.map((part, index) => (
              <MessagePart
                key={`${message.id}-part-${index}`}
                part={part}
                messageId={message.id}
                index={index}
                roomId={roomId}
                isMe={isMe}
                metadata={message.metadata}
                isStreaming={isStreaming}
                isReasoningActive={isReasoningActive}
                isLastReasoningPart={index === lastReasoningPartIndex}
                onToolConfirm={onToolConfirm}
                onToolCancel={onToolCancel}
              />
            ))}
          </div>

          {/* Action buttons - show copy button when there's text content, show delete when not actively streaming this message */}
          {showActions && (messageTextContent || (!messageTextContent && !isStreaming)) && (
            <div
              className={cn("flex gap-1", {
                "justify-end": isMe,
                "justify-start": !isMe,
              })}
            >
              {onMessageDeleted && !isStreaming && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {onRegenerate && !isStreaming && message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRegenerate(message.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  title="Regenerate response"
                  disabled={isCreditLimited}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              {messageTextContent && !isStreaming && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyText}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
              {/* Continue action moved to orange notice below */}
            </div>
          )}

          {/* Show typing loader when this message is streaming */}
          {isStreaming && !isMe && (
            <div className="flex justify-start">
              <TypingLoader />
            </div>
          )}
        </div>
      </div>

      {/* Continue banner under all components */}
      {(isLastPartStreaming || isLastPartTool || isLastPartEmpty) && !isStreaming && onContinue && (
        <div className="w-full max-w-3xl mx-auto mt-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-900 px-4 py-3 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200">
            <div className="text-sm">
              <span className="font-medium">Still in progress:</span> The model has not completed your request. Click
              Continue to proceed.
            </div>
            <Button
              onClick={onContinue}
              className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white inline-flex items-center gap-1.5"
              title="Continue"
              disabled={isCreditLimited}
            >
              <Play className="h-4 w-4" />
              <span className="text-xs font-medium">Continue</span>
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this message will also remove all newer messages in this conversation. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const ChatBubble = ChatBubbleComponent;
