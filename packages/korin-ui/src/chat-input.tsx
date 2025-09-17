"use client";

import { getFileCategory, getFileName, mimeTypes } from "@korinai/libs";
import { useAgent } from "@korinai/libs/contexts/agent-context";
import { useKorinAI } from "@korinai/libs/contexts/korinai-context";
import { useGalleryUpload } from "@korinai/libs/hooks/useGalleryUpload";
import { useIsMobile } from "@korinai/libs/hooks/useIsMobile";
import { useUser } from "@korinai/libs/hooks/useUser";
import type { PromptTemplate } from "@korinai/libs/types";
import { getFileIcon } from "@korinai/libs/ui/getFileIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@monorepo/shadcn-ui/components/ui/avatar";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@monorepo/shadcn-ui/components/ui/dialog";
import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@monorepo/shadcn-ui/components/ui/popover";
import { Textarea } from "@monorepo/shadcn-ui/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@monorepo/shadcn-ui/components/ui/tooltip";
import { AvatarKorin } from "@monorepo/ui/avatar-korin";
import ChatLimited from "@monorepo/ui/chat-limited";
import { FilePreviewDialog } from "@monorepo/ui/file-preview-dialog";
import { FileSelector } from "@monorepo/ui/file-selector";
import { AlertTriangle, ArrowUp, AtSign, Bot, ChevronDown, Loader2, Paperclip, Plus, Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FileAttachment {
  gallery_id: string;
  file_caption: string;
  file_url: string;
}

interface FileInfo {
  url: string;
  name: string;
  displayName: string;
  caption?: string;
  gallery_id?: string;
}

// Define translations interface
interface ChatInputTranslations {
  templates: string;
  fileSizeError: string;
  fileTypeError: string;
  uploadSuccess: string;
  uploadFailed: string;
  dropFile: string;
  retry: string;
  selectAgent: string;
  attachFile: string;
  stopGenerating: string;
  sendMessage: string;
  noCredits: string;
  selectFile: string;
}

interface ChatInputProps {
  isLoading: boolean;
  showTemplate: boolean;
  handleSubmit: (content: string) => Promise<void>;
  onStop?: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
  error?: string | null;
  onRetry?: () => Promise<void>;
  autoFocus?: boolean;
  creditLimited?: boolean;
  ownerEmail?: string;
  showCreditWarning?: boolean;
  templateAlignment?: "always-start" | "responsive-center";
  onFileAttach?: (fileInfo: FileAttachment[] | null) => void;
  handleAttachmentChange?: (fileInfo: FileAttachment[] | null) => void;
  translations?: Record<string, ChatInputTranslations>;
  onError?: (error: string) => void;
  variant?: "default" | "compact";
  // Visibility toggles
  showAttachButton?: boolean; // default true
  showStopButton?: boolean; // default true
  showAgentSelector?: boolean; // default true
}

export function ChatInput({
  isLoading,
  showTemplate,
  handleSubmit,
  onStop,
  status = "ready",
  error,
  onRetry,
  autoFocus,
  creditLimited,
  showCreditWarning,
  templateAlignment = "responsive-center",
  onFileAttach,
  handleAttachmentChange,
  ownerEmail,
  onError,
  variant = "default",
  showAttachButton = true,
  showStopButton = true,
  showAgentSelector = true,
}: ChatInputProps) {
  const { language = "en", translations } = useKorinAI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [openFilePreviewIndex, setOpenFilePreviewIndex] = useState<number | null>(null);
  const { isUploading, uploadFile, uploadProgress } = useGalleryUpload();
  const { user } = useUser();
  const t = translations?.[language] || translations.en!;
  const [isDragging, setIsDragging] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const { agents, currentAgent, switchAgent } = useAgent();
  const isMobile = useIsMobile();

  // Function to handle auto-resizing of textarea
  const autoResize = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 196)}px`;
  }, []);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        autoResize(textareaRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to handle auto-resize when input value changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [inputValue]);

  useEffect(() => {
    if (error) {
      setIsShaking(true);
    } else {
      setIsShaking(false);
    }
  }, [error]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creditLimited) {
      setIsShaking(true);
      return;
    }

    const hasUnuploadedFiles = selectedFiles?.length > 0 && selectedFiles?.some((file) => !file.url);
    if (!inputValue.trim() || hasUnuploadedFiles) return;

    const messageContent = inputValue;
    setInputValue("");

    try {
      await handleSubmit(messageContent);
      // Clear file attachments only after successful submission
      setSelectedFiles([]);
      if (onFileAttach) {
        onFileAttach(null);
      }
      if (handleAttachmentChange) {
        handleAttachmentChange(null);
      }
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  // Add effect to handle shake animation
  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Helper function to validate files
  const validateFiles = (files: File[]): File[] => {
    return files.filter((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError?.(t.fileSizeError);
        return false;
      }

      // Check file extension or MIME type
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const mimeType = file.type.toLowerCase();

      if (!mimeTypes[fileExtension as keyof typeof mimeTypes] && !Object.values(mimeTypes).includes(mimeType)) {
        onError?.(t.fileTypeError);
        return false;
      }

      return true;
    });
  };

  // Upload files and handle state updates
  const uploadFiles = async (files: File[]) => {
    // Create placeholders for all valid files
    const newFiles = files.map((file) => ({
      url: "",
      name: file.name,
      displayName: file.name,
      gallery_id: "",
      status: "uploading" as const,
    }));

    // Add new files to the selected files list
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Upload files sequentially to avoid overwhelming the server
    const uploadedAttachments: FileAttachment[] = [];
    let hasError = false;

    for (const file of files) {
      if (hasError) break;

      try {
        const result = await uploadFile(
          file,
          false,
          [user?.email || ""],
          false,
          currentAgent?.agent_id || user?.id || "",
        );

        if (result.success && result.galleryId && result.fileUrl) {
          const uploadedFile = {
            url: result.fileUrl,
            name: file.name,
            displayName: file.name,
            gallery_id: result.galleryId,
            caption: result.caption || "",
          };

          uploadedAttachments.push({
            gallery_id: result.galleryId,
            file_caption: result.caption || "",
            file_url: result.fileUrl,
          });

          // Update the UI with the uploaded file
          setSelectedFiles((prev) => {
            const updated = [...prev];
            const fileIndex = updated.findIndex((f) => f.name === file.name && !f.url);
            if (fileIndex !== -1) {
              updated[fileIndex] = uploadedFile;
            }
            return updated;
          });
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        console.error(`Error uploading file '${file.name}':`, error);
        onError?.(`Failed to upload '${file.name}': ${error instanceof Error ? error.message : "Unknown error"}`);
        hasError = true;
      }
    }

    if (!hasError && uploadedAttachments.length > 0) {
      if (onFileAttach) {
        onFileAttach(uploadedAttachments);
      }
    } else if (hasError) {
      // If there was an error, only keep successfully uploaded files
      setSelectedFiles((prev) => prev.filter((f) => f.url));
      if (onFileAttach) {
        onFileAttach(uploadedAttachments.length > 0 ? uploadedAttachments : null);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter and validate files
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;

    // Upload the valid files
    await uploadFiles(validFiles);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Handle file/image pasting
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];

    // Check for pasted files/images
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault(); // Prevent default paste behavior for files

      // Filter and validate files
      const validFiles: File[] = files.filter((file) => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          onError?.(t.fileSizeError);
          return false;
        }

        // Check file extension or MIME type
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
        const mimeType = file.type.toLowerCase();

        if (!mimeTypes[fileExtension as keyof typeof mimeTypes] && !Object.values(mimeTypes).includes(mimeType)) {
          onError?.(t.fileTypeError);
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) return;

      // Create placeholders for all valid files
      const newFiles = validFiles.map((file) => ({
        url: "",
        name: file.name,
        displayName: file.name,
        gallery_id: "",
        status: "uploading" as const,
      }));

      // Upload files sequentially
      await uploadFiles(validFiles);
    }
  };

  // Add template handling functions
  const applyTemplate = (template: PromptTemplate) => {
    if (template && template.content) {
      setInputValue(template.content);
      setSelectedTemplate(template);
      // Focus on the textarea after applying template
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  // Handle file selection from dialog
  const handleFileSelect = (fileInfo: FileInfo) => {
    const newFiles = [...selectedFiles, fileInfo];
    setSelectedFiles(newFiles);
    setIsFileSelectorOpen(false);

    if (onFileAttach || handleAttachmentChange) {
      const fileAttachments: FileAttachment[] = newFiles
        .filter((f) => f.gallery_id)
        .map((f) => ({
          gallery_id: f.gallery_id!,
          file_caption: f.caption || "",
          file_url: f.url || "",
        }));

      if (handleAttachmentChange) {
        handleAttachmentChange(fileAttachments);
      }
      if (onFileAttach) {
        onFileAttach(fileAttachments);
      }
    }
  };

  // Handle removing a file
  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    if (onFileAttach || handleAttachmentChange) {
      if (newFiles.length === 0) {
        if (onFileAttach) onFileAttach(null);
        if (handleAttachmentChange) handleAttachmentChange(null);
      } else {
        const fileAttachments: FileAttachment[] = newFiles
          .filter((f) => f.gallery_id)
          .map((f) => ({
            gallery_id: f.gallery_id!,
            file_caption: f.caption || "",
            file_url: f.url || "",
          }));

        if (handleAttachmentChange) {
          handleAttachmentChange(fileAttachments);
        }
        if (onFileAttach) {
          onFileAttach(fileAttachments);
        }
      }
    }
  };

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div
      className="w-full mx-auto z-10 flex flex-col space-y-1 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-primary/50 bg-transparent rounded-lg z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-primary/80">
            <Paperclip className="h-8 w-8" />
            <p className="text-sm font-medium">{t.dropFile}</p>
          </div>
        </div>
      )}

      {/* Credit limit warning */}
      {(showCreditWarning || creditLimited) && (
        <ChatLimited ownerEmail={ownerEmail} shaking={isShaking} warning={showCreditWarning} />
      )}

      {/* Error Section */}
      {error && (
        <div
          className={cn(
            "mx-2 px-3 py-2 md:py-2 mb-1 bg-red-100 text-red-500 rounded-xl border border-red-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2",
            isShaking && "animate-shake",
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm leading-relaxed">{error}</span>
          </div>
          {onRetry && (
            <Button
              onClick={async () => {
                try {
                  await onRetry();
                } catch (retryError) {
                  console.error("Retry failed:", retryError);
                }
              }}
              variant="destructive"
              className="px-4 py-2 h-8 text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors rounded-xl shadow-sm hover:shadow-md flex-shrink-0"
            >
              {t.retry}
            </Button>
          )}
        </div>
      )}

      {/* Prompt Templates Section */}
      {showTemplate && currentAgent?.prompt_templates && currentAgent.prompt_templates.length > 0 && (
        <section className="overflow-x-auto mb-4 px-2">
          <div
            className={cn("flex items-center gap-3 overflow-x-auto no-scrollbar min-w-full justify-start", {
              "sm:justify-center": templateAlignment !== "always-start",
            })}
          >
            {currentAgent.prompt_templates.map((template: PromptTemplate) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={cn(
                  "px-4 py-2 cursor-pointer rounded-xl text-sm whitespace-nowrap transition-colors flex-shrink-0",
                  {
                    "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15":
                      selectedTemplate?.id === template.id,
                    "bg-muted/50 hover:bg-muted/80 border border-border/30 text-foreground/80 hover:text-foreground":
                      selectedTemplate?.id !== template.id,
                  },
                )}
              >
                {template.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Selected Files Section */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 mb-2 relative">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.gallery_id || idx}`}
              className="flex items-center gap-3 overflow-hidden rounded-xl py-3 md:py-2.5 px-3 group cursor-pointer 
                     hover:bg-accent/10 transition-all duration-200 border border-border/30 
                     shadow-sm bg-muted/30 min-h-[60px] md:min-h-auto relative"
              onClick={() => setOpenFilePreviewIndex(idx)}
            >
              {isUploading && !file.gallery_id && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-muted rounded-b-lg overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              )}
              <div className="h-10 w-10 md:h-10 md:w-10 flex items-center justify-center bg-accent/10 rounded-xl border border-border/30 flex-shrink-0">
                {isUploading && !file.gallery_id ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  getFileIcon(file.url || file.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.caption || getFileName(file.url || file.name)}</p>
                <p className="text-xs text-muted-foreground">
                  {isUploading && !file.gallery_id
                    ? `${uploadProgress.status} (${Math.round(uploadProgress.progress)}%)`
                    : getFileCategory(file.url || file.name)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(idx);
                }}
                className="h-9 w-9 md:h-8 md:w-8 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Chat Input Section */}
      <div
        className={cn("shadow-sm bg-muted overflow-hidden rounded-xl", {
          "border border-border/30": variant === "default",
        })}
      >
        <div className="flex flex-col">
          {/* Textarea with inline submit for compact variant */}
          <div className={cn("relative", variant === "compact" && "pr-12")}>
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={inputValue}
              onPaste={handlePaste}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResize(e.target as HTMLTextAreaElement);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isMobile && status !== "streaming") {
                  e.preventDefault();
                  onSubmit(e);
                } else {
                  autoResize(e.target as HTMLTextAreaElement);
                }
              }}
              className="w-full resize-none bg-transparent py-3 md:py-2 px-4 md:px-3 focus:outline-none min-h-[56px] md:min-h-[50px] max-h-[196px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-sm overflow-y-auto rounded-none text-primary"
              rows={variant === "compact" ? 1 : 2}
              autoFocus={autoFocus}
            />
            {variant === "compact" && inputValue.trim() && (
              <Button
                type="submit"
                size="icon"
                onClick={onSubmit}
                disabled={
                  !inputValue.trim() ||
                  isLoading ||
                  creditLimited ||
                  isStreaming ||
                  (selectedFiles?.length > 0 && selectedFiles?.some((file) => !file.url))
                }
                className={cn(
                  "absolute right-2 bottom-2 h-9 w-9 rounded-xl shadow-md hover:shadow-lg transition-all",
                  inputValue.trim() && !isLoading && !creditLimited && status !== "submitted"
                    ? "bg-primary hover:bg-primary/90"
                    : "",
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                <span className="sr-only">{t.sendMessage}</span>
              </Button>
            )}
          </div>

          {/* Controls row (hidden for compact) */}
          {variant !== "compact" && (
            <div className="flex items-center justify-between p-2 md:p-1.5 border-t border-border/20 bg-background">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                {/* File Attachment Button */}
                {showAttachButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFileSelectorOpen(true)}
                    className="h-9 w-9 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                    disabled={creditLimited}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">{t.attachFile}</span>
                  </Button>
                )}

                {/* Agent Selector */}
                {showAgentSelector ? (
                  agents.length > 1 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "cursor-pointer h-9 md:h-9 rounded-xl hover:bg-accent/40 transition-colors px-2 md:px-2 flex items-center gap-1 md:gap-1 min-w-0 max-w-[38vw] sm:max-w-[180px] md:max-w-none overflow-hidden group",
                          )}
                        >
                          {currentAgent ? (
                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                              <div className="h-6 w-6 md:h-6 md:w-6 rounded-full relative overflow-hidden flex-shrink-0">
                                <AvatarKorin
                                  src={currentAgent?.avatar_url}
                                  alt={currentAgent?.name}
                                  fallback={
                                    currentAgent?.name ? String(currentAgent.name).charAt(0).toUpperCase() : undefined
                                  }
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-sm md:text-xs text-muted-foreground">
                                @{currentAgent?.username}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                          ) : (
                            <>
                              <AtSign className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm md:text-xs text-muted-foreground">Select agent</span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[280px] p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                          {agents.map((agent) => (
                            <div
                              key={agent.agent_id}
                              className="flex items-center py-2 px-3 hover:bg-accent/50 cursor-pointer"
                              onClick={() => {
                                switchAgent(agent.agent_id);
                                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                              }}
                            >
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={agent.avatar_url} alt={agent.name} />
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium">{agent.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{agent.persona}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                      <div className="h-6 w-6 md:h-6 md:w-6 rounded-full relative overflow-hidden flex-shrink-0">
                        <AvatarKorin
                          src={currentAgent?.avatar_url}
                          alt={currentAgent?.name}
                          fallback={currentAgent?.name ? String(currentAgent.name).charAt(0).toUpperCase() : undefined}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-sm md:text-xs text-muted-foreground">
                        @{currentAgent?.username || "username"}
                      </span>
                    </div>
                  )
                ) : null}
              </div>

              {/* Send/Stop Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {isStreaming && onStop && showStopButton ? (
                      <Button
                        type="button"
                        size="icon"
                        onClick={onStop}
                        variant="destructive"
                        className="h-10 w-10 md:h-9 md:w-9 rounded-xl shadow-md hover:shadow-lg transition-all"
                        disabled={!isStreaming}
                      >
                        <Square className="h-4 w-4 text-primary-foreground" />
                        <span className="sr-only">{t.stopGenerating}</span>
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="icon"
                        onClick={onSubmit}
                        disabled={!inputValue.trim() || isLoading || creditLimited || isStreaming}
                        className={cn(
                          "h-10 w-10 md:h-9 md:w-9 rounded-xl shadow-md hover:shadow-lg transition-all",
                          (!inputValue.trim() && status !== "streaming") ||
                            (isLoading && status !== "streaming") ||
                            (status === "ready" && creditLimited) ||
                            status === "submitted"
                            ? "opacity-50"
                            : "",
                          status === "streaming"
                            ? "bg-red-500 hover:bg-red-600"
                            : inputValue.trim() && !isLoading && !creditLimited && status !== "submitted"
                              ? "bg-primary hover:bg-primary/90"
                              : "",
                        )}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                        <span className="sr-only">{t.sendMessage}</span>
                      </Button>
                    )}
                  </TooltipTrigger>
                  {creditLimited && (
                    <TooltipContent>
                      <p>{t.noCredits}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={isFileSelectorOpen}
        onOpenChange={(open) => {
          setIsFileSelectorOpen(open);
          if (!open) {
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }, 100);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl">{t.selectFile}</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <FileSelector onSelect={handleFileSelect} onClose={() => setIsFileSelectorOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      {openFilePreviewIndex !== null && selectedFiles[openFilePreviewIndex] && (
        <FilePreviewDialog
          url={selectedFiles[openFilePreviewIndex].url}
          name={selectedFiles[openFilePreviewIndex].name}
          open={openFilePreviewIndex !== null}
          onOpenChange={(open) => {
            if (!open) setOpenFilePreviewIndex(null);
          }}
        />
      )}
    </div>
  );
}
