"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { useChat } from '@ai-sdk/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define our UI message interface to match what ChatBubble expects
interface ExtendedUIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_KORINAI_API_KEY;

  // Initialize chat with useChat hook
  const { messages, append, status, stop, setMessages } = useChat({
    api: "https://korinai.com/api/chat",
    sendExtraMessageFields: true,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    onResponse: () => {
      // Clear any previous errors on successful response
      setError(null);
    },
    onError: (error) => {
      setError(error.message || "An error occurred while fetching the response");
    },
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Don't render if we're in the dashboard
  if (pathname?.startsWith("/dashboard") || !mounted) {
    return null;
  }

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Wrapper for form submission
  const handleSubmit = async (content: string) => {
    if (!content.trim() || !apiKey) return;
    
    // Append the user message
    await append({
      role: "user",
      content,
    });
  };

  // Convert a message to our expected format
  const mapMessageToExtendedUIMessage = (message: {
    id: string;
    role: string;
    content: string;
    createdAt?: number | Date | string;
  }): ExtendedUIMessage => {
    return {
      ...message,
      id: message.id,
      role: message.role === 'data' ? 'system' : message.role as 'user' | 'assistant' | 'system',
      content: message.content,
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
    };
  };

  const isLoading = status === "streaming";

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-shadow"
          variant="default"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed sm:bottom-6 sm:right-6 z-50">
      <Card className={cn(
        "flex flex-col p-0",
        // Mobile: Full screen
        "fixed inset-0 rounded-none h-[100dvh] w-screen",
        // Desktop: Larger fixed size with rounded corners
        "sm:static sm:w-[440px] sm:h-[600px] sm:rounded-lg"
      )}>
        {/* Header */}
        <div className="border-b">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/KorinAILogo-Black.svg"
                alt="KorinAI Logo"
                width={24}
                height={24}
                className="dark:hidden"
              />
              <Image
                src="/logo/KorinAILogo-White.svg"
                alt="KorinAI Logo"
                width={24}
                height={24}
                className="hidden dark:block"
              />
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Chat with Korin</h3>
                <Badge
                  variant="secondary"
                  className="h-5 px-2 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/15"
                >
                  AI
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearChat}
                      className="h-8 w-8 hover:bg-muted"
                      disabled={messages.length === 0 || isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            {messages.length === 0 ? (
              <ChatBubble
                message={{
                  role: "assistant",
                  content: "Hello! I'm your AI assistant. How can I help you today?",
                  createdAt: new Date()
                }}
                isStreaming={false}
              />
            ) : (
              messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={mapMessageToExtendedUIMessage(message)}
                  isStreaming={isLoading && message.role === "assistant" && message === messages[messages.length-1]}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput 
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          onStop={stop}
          status={status}
          error={error}
          autoFocus={true}
        />
      </Card>
    </div>
  );
} 