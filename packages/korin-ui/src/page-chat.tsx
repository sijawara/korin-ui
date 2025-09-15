"use client";

import { useChat } from "@ai-sdk/react";
import { useAgent } from "@korinai/libs/contexts/agent-context";
import { useKorinAI } from "@korinai/libs/contexts/korinai-context";
import { useDebouncedValue } from "@korinai/libs/hooks/useDebouncedValue";
import { useMessages } from "@korinai/libs/hooks/useMessages";
import { useRooms } from "@korinai/libs/hooks/useRooms";
import { useSingleRoom } from "@korinai/libs/hooks/useSingleRoom";
import { useUser } from "@korinai/libs/hooks/useUser";
import type { FileAttachment } from "@korinai/libs/types";
import { Avatar, AvatarFallback, AvatarImage } from "@monorepo/shadcn-ui/components/ui/avatar";
import { Badge } from "@monorepo/shadcn-ui/components/ui/badge";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { Card } from "@monorepo/shadcn-ui/components/ui/card";
import { Input } from "@monorepo/shadcn-ui/components/ui/input";
import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { Skeleton } from "@monorepo/shadcn-ui/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@monorepo/shadcn-ui/components/ui/tooltip";
import { ChatBubble } from "@monorepo/ui/chat-bubble";
import { ChatInput } from "@monorepo/ui/chat-input";
import { DefaultChatTransport, generateId } from "ai";
import {
  ArrowLeft,
  History,
  Link as LinkIcon,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Terminal,
  User,
  Wand2,
  X,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface PageChatProps {
  className?: string;
  title?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  hideHistory?: boolean;
  pageSize?: number;
  defaultRoomId?: string;
  showRoomName?: boolean;
  onRoomChange?: (roomId: string) => void;
  onSend?: (message: { text: string; roomId: string }) => void;
  headerRightSlot?: ReactNode;
  variant?: "card" | "flat";
  chatInputVariant?: "default" | "compact";
  // Network/config overrides
  throttleMs?: number; // maps to experimental_throttle
  requestHeaders?: Record<string, string>; // merged into transport headers (in addition to Authorization)
  requestBody?: {
    requesterId?: string;
    participantEmail?: string;
    participantId?: string;
    roomId?: string;
    gallery_id?: string;
    file_caption?: string;
    file_url?: string;
    extra_context?: string;
    requesterEmail?: string;
    messageId?: string;
    secrets?: Array<{ key: string; value: string }>;
  };
  // UI toggles
  ui?: {
    showStop?: boolean; // default true
    showAttach?: boolean; // default true
    showActions?: boolean; // controls ChatBubble actions, default true
    showAgentSelector?: boolean; // reserved if selector is present elsewhere
    defaultAgentUsername?: string; // preferred agent username to use
  };
  // Branding for Korin elements
  branding?: {
    logoLightUrl?: string;
    logoDarkUrl?: string;
    // px sizes as width/height objects
    logoSize?: { width: number; height: number }; // welcome avatar fallback logos
    showHeaderLogo?: boolean; // show branding logo in header (default true)
    headerLogoSize?: { width: number; height: number }; // size for header logo
  };
}

export function PageChat({
  className,
  title = "Chat with KorinAI",
  showRoomName = true,
  showCloseButton = false,
  onClose,
  hideHistory = false,
  pageSize = 10,
  defaultRoomId,
  onRoomChange,
  onSend,
  headerRightSlot,
  variant = "flat",
  throttleMs,
  requestHeaders,
  requestBody,
  ui,
  branding,
  chatInputVariant,
}: PageChatProps) {
  const { language = "en", config, translations } = useKorinAI();
  const t = translations?.[language] || translations.en!;
  const { getAuthToken, authToken } = useKorinAI();
  const { creditLimited, showWarning, mutate: mutateUserData, user } = useUser();
  const { currentAgent, agents, isLoading: isLoadingAgents } = useAgent();
  // Resolve active agent (allow overriding with defaultAgentUsername when provided)
  const activeAgent = useMemo(() => {
    const preferredUsername = ui?.defaultAgentUsername;
    if (preferredUsername && Array.isArray(agents)) {
      const found = agents.find((a) => a?.username === preferredUsername);
      if (found) return found;
    }
    return currentAgent;
  }, [ui?.defaultAgentUsername, JSON.stringify(agents), currentAgent]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | undefined>(defaultRoomId || generateId());
  const [isMessageLoaded, setIsMessageLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);

  const [fileAttachments, setFileAttachments] = useState<FileAttachment[] | null>(null);
  const fileAttachmentsRef = useRef<FileAttachment[] | null>(null);

  // Chat history hooks
  const {
    rooms,
    pagination,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
    mutate: mutateRooms,
  } = useRooms(historyPage, pageSize, currentAgent?.agent_id, debouncedSearchQuery, showHistory);

  // Accumulated rooms for infinite scroll
  const [allRooms, setAllRooms] = useState<any[]>([]);

  // Reset accumulator when starting over or agent changes or history closes
  useEffect(() => {
    if (!showHistory || debouncedSearchQuery) {
      setAllRooms([]);
      setHistoryPage(1);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    setAllRooms([]);
    setHistoryPage(1);
  }, [currentAgent?.agent_id, pageSize]);

  // Respond to defaultRoomId changes
  useEffect(() => {
    if (defaultRoomId) {
      setCurrentRoomId((prev) => (prev !== defaultRoomId ? defaultRoomId : prev));
    }
  }, [defaultRoomId]);

  // Group rooms by date
  const groupRoomsByDate = (rooms: any[]) => {
    if (!rooms || !rooms.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const groups: { [key: string]: any[] } = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "Last Week": [],
      Older: [],
    };

    rooms.forEach((room) => {
      if (!room.last_message_part?.created_at) {
        groups["Older"]!.push(room);
        return;
      }

      const msgDate = new Date(room.last_message_part.created_at);

      if (msgDate >= today) {
        groups["Today"]!.push(room);
      } else if (msgDate >= yesterday) {
        groups["Yesterday"]!.push(room);
      } else if (msgDate >= thisWeekStart) {
        groups["This Week"]!.push(room);
      } else if (msgDate >= lastWeekStart) {
        groups["Last Week"]!.push(room);
      } else {
        groups["Older"]!.push(room);
      }
    });

    // Filter out empty groups
    return Object.entries(groups)
      .filter(([_, rooms]) => rooms.length > 0)
      .map(([title, rooms]) => ({
        title,
        rooms: [...rooms].sort(
          (a, b) =>
            new Date(b.last_message_part?.created_at || 0).getTime() -
            new Date(a.last_message_part?.created_at || 0).getTime(),
        ),
      }));
  };

  // Append unique rooms when new page loads
  useEffect(() => {
    if (!rooms) return;
    setAllRooms((prev) => {
      if (historyPage === 1) return rooms;
      const existing = new Set(prev.map((r: any) => r.id));
      const next = rooms.filter((r: any) => !existing.has(r.id));
      return [...prev, ...next];
    });
  }, [JSON.stringify(rooms), historyPage]);

  const { messages: historicalMessages, isLoading: isLoadingHistory } = useMessages(
    currentRoomId,
    currentAgent?.agent_id || user?.id,
  );

  // Update the ref when fileAttachments changes
  useEffect(() => {
    fileAttachmentsRef.current = fileAttachments;
  }, [fileAttachments]);
  // console.debug("historicalMessages", historicalMessages);
  // Convert historical messages to UIMessage format
  const convertedHistoricalMessages = useMemo(() => {
    if (!historicalMessages) return [];
    return historicalMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts || [{ type: "text", text: msg.content || "" }],
      metadata: msg.metadata || {},
      createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    }));
  }, [JSON.stringify(historicalMessages)]);

  // Initialize chat with useCustomChat hook
  const {
    messages,
    setMessages,
    sendMessage,
    status: customStatus,
    stop,
    regenerate,
    error: chatError,
  } = useChat({
    id: currentRoomId,
    messages: convertedHistoricalMessages,
    experimental_throttle: typeof throttleMs === "number" ? throttleMs : 100,
    transport: new DefaultChatTransport({
      api: config.chatApi,
      headers: async () => {
        const token = authToken || (await getAuthToken());
        return {
          Authorization: `Bearer ${token}`,
          ...(requestHeaders || {}),
        };
      },
    }),
    onFinish: async () => {
      if (!currentRoomId) {
        return;
      }

      try {
        setFileAttachments(null);
        await Promise.all([mutateUserData(), mutateRooms()]);
      } catch (error) {
        console.error("❌ Error in finish mutations:", error);
      }
    },
    onError: (error) => {
      setError(error.message || "An error occurred while fetching the response");
    },
  });

  const { room, isLoading: isLoadingRoom } = useSingleRoom(currentRoomId, messages?.length > 0);
  const currentError = Array.isArray(convertedHistoricalMessages)
    ? (convertedHistoricalMessages[convertedHistoricalMessages.length - 1] as any)?.metadata?.error?.message
    : null;

  const isStreaming = ["submitted", "streaming"].includes(customStatus);

  // console.debug("streaming/status", { isStreaming, isLoadingHistory });

  // Handle chat errors
  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
    }
  }, [chatError]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Infinite scroll for history list
  useEffect(() => {
    if (!showHistory) return;
    const node = historyEndRef.current;
    if (!node) return;

    const hasMore = pagination ? historyPage < pagination.total_pages : false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore && !isLoadingRooms) {
          setHistoryPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showHistory, pagination, historyPage, isLoadingRooms]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Debug: Log all messages from useChat
    // console.debug("useChat messages updated", messages);
  }, [messages]);

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    const newId = generateId();
    setCurrentRoomId(newId);
    onRoomChange?.(newId);
  };

  useEffect(() => {
    if (currentRoomId && !isLoadingHistory && !isMessageLoaded) {
      setIsMessageLoaded(true);
    }
  }, [currentRoomId, isLoadingHistory]);

  useEffect(() => {
    if (isMessageLoaded) {
      setMessages(convertedHistoricalMessages);
    }
  }, [isMessageLoaded]);

  // Handle room selection from history
  const handleRoomSelect = (room: any) => {
    setCurrentRoomId(room.id);
    setShowHistory(false);
    setIsMessageLoaded(false);
    setError(null);
    onRoomChange?.(room.id);
  };

  // Handle starting new chat
  const handleNewChat = () => {
    const newId = generateId();
    setCurrentRoomId(newId);
    setMessages([]);
    setError(null);
    setShowHistory(false);
    onRoomChange?.(newId);
  };

  // Handle back from history
  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  // Wrapper for form submission
  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    // Generate room ID if we don't have one
    const currentSessionRoomId = currentRoomId || generateId();
    if (!currentRoomId) {
      setCurrentRoomId(currentSessionRoomId);
    }

    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

      const fileAttachmentsData =
        fileAttachmentsRef.current?.map((attachment) => ({
          gallery_id: attachment.gallery_id || "",
          file_caption: attachment.file_caption || "",
          file_url: attachment.file_url || "",
        })) || [];

      await sendMessage(
        {
          text: content,
          metadata: {
            sender_info: {
              sender_id: user?.id,
              username: user?.username,
              profile_picture_url: user?.profile_picture_url,
            },
            file_attachments: fileAttachmentsData,
          },
        },
        {
          body: {
            // Required
            participantEmail: requestBody?.participantEmail || user?.email,
            participantId: requestBody?.participantId || activeAgent?.agent_id || user?.id,
            roomId: requestBody?.roomId || currentSessionRoomId,
            // Optional swagger-aligned fields
            requesterId: requestBody?.requesterId,
            gallery_id: requestBody?.gallery_id,
            file_caption: requestBody?.file_caption,
            file_url: requestBody?.file_url,
            extra_context: requestBody?.extra_context,
            requesterEmail: requestBody?.requesterEmail,
            messageId: requestBody?.messageId,
            secrets: requestBody?.secrets,
          },
        },
      );

      // Clear any previous errors on successful response
      setError(null);
      onSend?.({ text: content, roomId: currentSessionRoomId });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  // Convert a message to our expected format
  const mapMessageToExtendedUIMessage = (message: any): any => {
    // Handle both old and new message formats - ensure we have proper ChatMessage structure
    const parts = message.parts || [
      {
        type: "text",
        text: message.content || "",
      },
    ];

    return {
      id: message.id || generateId(),
      role: message.role === "data" ? "assistant" : (message.role as "user" | "assistant"),
      metadata: message.metadata || {},
      parts: parts,
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
      annotations: message.annotations, // Preserve annotations
    };
  };

  const handleFileAttach = (fileInfos: FileAttachment[] | null) => {
    console.log("handleFileAttach called with:", fileInfos);
    setFileAttachments(fileInfos);
    fileAttachmentsRef.current = fileInfos;
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return days === 1 ? "Yesterday" : `${days}d ago`;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLastMessagePreview = (room: any) => {
    if (!room.last_message_part) return null;

    const { type, content, ...rest } = room.last_message_part;

    switch (type) {
      case "text":
        return {
          icon: <MessageCircle className="h-3 w-3" />,
          text: content.text || (rest as any).text,
        };
      case "tool-invocation":
        return {
          icon: <Wand2 className="h-3 w-3" />,
          text: t.usingTool.replace("{toolName}", content.toolName),
        };
      case "file":
        return {
          icon: <Paperclip className="h-3 w-3" />,
          text: content.name || t.attachedFile,
        };
      case "reasoning":
        return {
          icon: <Terminal className="h-3 w-3" />,
          text: content.reasoning,
        };
      case "source":
        return {
          icon: <LinkIcon className="h-3 w-3" />,
          text: t.sharedLink,
        };
      default:
        return null;
    }
  };

  const isPreparing = agents?.length <= 0 || !mounted || !config.chatApi;
  const Wrapper = variant === "card" ? Card : "div";
  return (
    <Wrapper className={cn("flex flex-col flex-1 min-h-0 bg-background rounded-xl", className)}>
      {/* Header */}
      <div className="border-b bg-gradient-to-r">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {!showHistory && branding?.showHeaderLogo !== false && (
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-md"
                style={{
                  width: branding?.headerLogoSize?.width ?? 28,
                  height: branding?.headerLogoSize?.height ?? 28,
                }}
              >
                <Image
                  src={branding?.logoLightUrl || `${config.baseUrl}/logo/KorinAILogo-Black.svg`}
                  alt="KorinAI Logo"
                  width={branding?.headerLogoSize?.width ?? 28}
                  height={branding?.headerLogoSize?.height ?? 28}
                  className="dark:hidden object-contain"
                />
                <Image
                  src={branding?.logoDarkUrl || `${config.baseUrl}/logo/KorinAILogo-White.svg`}
                  alt="KorinAI Logo"
                  width={branding?.headerLogoSize?.width ?? 28}
                  height={branding?.headerLogoSize?.height ?? 28}
                  className="hidden dark:block object-contain"
                />
              </div>
            )}
            {showHistory && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isPreparing}
                onClick={handleBackFromHistory}
                className="h-9 w-9 hover:bg-background/80 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {showHistory ? t.chatHistory : showRoomName ? room?.name || title : title}
                </h3>
              </div>
              {!showHistory && isStreaming && <p className="text-xs text-muted-foreground">{t.thinking}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!hideHistory && !showHistory ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowHistory(true)}
                        disabled={isPreparing}
                        className="h-9 w-9 hover:bg-background/80 rounded-xl transition-all duration-200"
                      >
                        <History className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t.chatHistory}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearChat}
                        className="h-9 w-9 hover:bg-background/80 rounded-xl transition-all duration-200"
                        disabled={messages.length === 0 || isStreaming || isPreparing}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t.newChat}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                disabled={isPreparing}
                className="h-8 px-3 text-xs"
              >
                {t.newChat}
              </Button>
            )}
            {headerRightSlot}
            {showCloseButton && onClose && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-9 w-9 hover:bg-background/80 rounded-xl transition-all duration-200 ml-1"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{t.closeChat}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {showHistory && !hideHistory ? (
          /* History View - Full Window */
          <>
            <div className="flex-1 overflow-y-auto bg-background min-h-0">
              <div className="px-4 pb-4 py-2">
                {/* Search Input */}
                <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 mb-4 -mx-2">
                  <div className="relative w-full flex items-center">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-2" />
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      className="pl-8"
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingRooms && historyPage === 1 ? (
                  <div className="space-y-4 py-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isRoomsError ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-destructive">{t.failedToLoadHistory}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.tryAgainLater}</p>
                  </div>
                ) : allRooms?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Room List */}
                    {groupRoomsByDate(allRooms).map(({ title, rooms: roomGroup }) => (
                      <div key={title} className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground/70 px-2">{title}</h4>
                        <div className="space-y-2">
                          {roomGroup.map((room: any) => {
                            const lastMessage = getLastMessagePreview(room);
                            return (
                              <button
                                key={room.id}
                                onClick={() => handleRoomSelect(room)}
                                className="w-full text-left p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-1 flex-shrink-0">
                                    {room.participants
                                      .filter((p: any) => room.participants.length === 1 || p.id !== user?.id)
                                      .slice(0, 1)
                                      .map((participant: any) => (
                                        <div
                                          key={participant.id}
                                          className="w-9 h-9 rounded-full border-2 border-background relative"
                                        >
                                          <Avatar className="h-full w-full">
                                            <AvatarFallback className="text-xs">
                                              {participant.username[0]?.toUpperCase() || <User className="h-4 w-4" />}
                                            </AvatarFallback>
                                          </Avatar>
                                        </div>
                                      ))}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                      <p className="font-medium text-sm truncate">{room.name}</p>
                                      {room.last_message_part && (
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                          {formatTimestamp(room.last_message_part.created_at)}
                                        </span>
                                      )}
                                    </div>
                                    {lastMessage && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground/50 text-xs">{lastMessage.icon}</span>
                                        <p className="text-xs text-muted-foreground/80 truncate">{lastMessage.text}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Sentinel for infinite scroll */}
                    <div ref={historyEndRef} className="h-4" />
                    {isLoadingRooms && (
                      <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                        Loading more...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">{t.noChatHistory}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{t.startConversation}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : isPreparing ? (
          <div className="flex-1 overflow-y-auto bg-background">
            <div className="h-full flex items-center justify-center p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <Avatar
                    className="ring-2 ring-primary/20"
                    style={{
                      width: branding?.logoSize?.width ?? 50,
                      height: branding?.logoSize?.height ?? 50,
                    }}
                  >
                    <AvatarFallback>
                      <Image
                        src={branding?.logoLightUrl || `${config.baseUrl}/logo/KorinAILogo-Black.svg`}
                        alt="KorinAI Logo"
                        width={branding?.logoSize?.width ?? 50}
                        height={branding?.logoSize?.height ?? 50}
                        className="dark:hidden"
                      />
                      <Image
                        src={branding?.logoDarkUrl || `${config.baseUrl}/logo/KorinAILogo-White.svg`}
                        alt="KorinAI Logo"
                        width={branding?.logoSize?.width ?? 50}
                        height={branding?.logoSize?.height ?? 50}
                        className="hidden dark:block"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background">
                    <div className="h-full w-full rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                </div>
                <p className="text-muted-foreground">{t.preparingExperience}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat View - Full Window */
          <>
            <div className="flex-1 overflow-y-auto bg-background">
              <div className="flex flex-col gap-4 p-4">
                {(isLoadingHistory || isLoadingAgents) && !isMessageLoaded ? (
                  <div className="flex-1 overflow-y-auto bg-background">
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="relative">
                          <Avatar
                            className="ring-2 ring-primary/20"
                            style={{
                              width: branding?.logoSize?.width ?? 50,
                              height: branding?.logoSize?.height ?? 50,
                            }}
                          >
                            <AvatarFallback>
                              <Image
                                src={branding?.logoLightUrl || `${config.baseUrl}/logo/KorinAILogo-Black.svg`}
                                alt="KorinAI Logo"
                                width={branding?.logoSize?.width ?? 50}
                                height={branding?.logoSize?.height ?? 50}
                                className="dark:hidden"
                              />
                              <Image
                                src={branding?.logoDarkUrl || `${config.baseUrl}/logo/KorinAILogo-White.svg`}
                                alt="KorinAI Logo"
                                width={branding?.logoSize?.width ?? 50}
                                height={branding?.logoSize?.height ?? 50}
                                className="hidden dark:block"
                              />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background">
                            <div className="h-full w-full rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                        </div>
                        <p className="text-muted-foreground">{t.loadingConversation}</p>
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-4 text-center py-12">
                    <div className="relative">
                      <Avatar
                        className="ring-2 ring-primary/20"
                        style={{
                          width: branding?.logoSize?.width ?? 50,
                          height: branding?.logoSize?.height ?? 50,
                        }}
                      >
                        <AvatarImage
                          width={branding?.logoSize?.width ?? 50}
                          height={branding?.logoSize?.height ?? 50}
                          src={activeAgent?.avatar_url}
                          alt={activeAgent?.name}
                        />
                        <AvatarFallback>
                          <Image
                            src={branding?.logoLightUrl || `${config.baseUrl}/logo/KorinAILogo-Black.svg`}
                            alt="KorinAI Logo"
                            width={branding?.logoSize?.width ?? 50}
                            height={branding?.logoSize?.height ?? 50}
                            className="dark:hidden"
                          />
                          <Image
                            src={branding?.logoDarkUrl || `${config.baseUrl}/logo/KorinAILogo-White.svg`}
                            alt="KorinAI Logo"
                            width={branding?.logoSize?.width ?? 50}
                            height={branding?.logoSize?.height ?? 50}
                            className="hidden dark:block"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-xl border-2 border-background"></div>
                    </div>
                    <div className="flex mt-2 items-start gap-1">
                      <h3 className="text-lg font-medium mb-1">{activeAgent?.name || t.ai}</h3>
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[9px] font-medium bg-primary/15 text-primary border-0 rounded-xl"
                      >
                        {t.ai}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{t.helloImYourAIAssistant}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0">
                    {messages.map((message) => (
                      <ChatBubble
                        key={message.id}
                        message={mapMessageToExtendedUIMessage(message)}
                        isStreaming={customStatus === "streaming" && messages[messages.length - 1]?.id === message.id}
                        showActions={ui?.showActions !== false}
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="w-full">
              <ChatInput
                isLoading={isStreaming || isLoadingHistory}
                variant={chatInputVariant}
                showTemplate={messages.length === 0}
                handleSubmit={handleSubmit}
                onStop={stop}
                showAgentSelector={ui?.showAgentSelector !== false}
                showStopButton={ui?.showStop !== false}
                showAttachButton={ui?.showAttach !== false}
                showCreditWarning={showWarning}
                status={customStatus}
                error={error || currentError}
                onRetry={async () => {
                  try {
                    await regenerate({
                      body: {
                        // Required
                        participantEmail: requestBody?.participantEmail || user?.email,
                        participantId: requestBody?.participantId || activeAgent?.agent_id || user?.id,
                        roomId: requestBody?.roomId || currentRoomId,
                        // Optional swagger-aligned fields
                        requesterId: requestBody?.requesterId,
                        gallery_id: requestBody?.gallery_id,
                        file_caption: requestBody?.file_caption,
                        file_url: requestBody?.file_url,
                        extra_context: requestBody?.extra_context,
                        requesterEmail: requestBody?.requesterEmail,
                        messageId: requestBody?.messageId,
                        secrets: requestBody?.secrets,
                      },
                    });
                    setError(null);
                  } catch (retryError) {
                    console.error("Retry failed:", retryError);
                  }
                }}
                autoFocus={true}
                creditLimited={creditLimited}
                onFileAttach={handleFileAttach}
                templateAlignment="always-start"
              />
            </div>
          </>
        )}
      </div>
    </Wrapper>
  );
}
