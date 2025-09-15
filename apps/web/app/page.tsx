"use client";

import React, { useState } from "react";
import { KorinProvider } from "@monorepo/ui/korin-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@monorepo/shadcn-ui/card";
import { Button } from "@monorepo/shadcn-ui/button";
import { Input } from "@monorepo/shadcn-ui/input";
import type { KorinAIConfig } from "@korinai/libs/types";

// Examples (deduplicated demos)
import AvatarKorinExample from "@monorepo/example/avatar-korin";
import ChatBubbleExample from "@monorepo/example/chat-bubble";
import ChatInputExample from "@monorepo/example/chat-input";
import ChatLimitedExample from "@monorepo/example/chat-limited";
import CodeBlockExample from "@monorepo/example/code-block";
import CodeBlockWithCopyExample from "@monorepo/example/code-block-with-copy";
import FilePreviewDialogExample from "@monorepo/example/file-preview-dialog";
import FileSelectorExample from "@monorepo/example/file-selector";
import FloatingChatExample from "@monorepo/example/floating-chat";
import KorinProviderExample from "@monorepo/example/korin-provider";
import MemoizedMarkdownExample from "@monorepo/example/memoized-markdown";
import PageChatExample from "@monorepo/example/page-chat";
import ReasoningExample from "@monorepo/example/reasoning";
import ResponseExample from "@monorepo/example/response";
import ScrollAreaExtendedExample from "@monorepo/example/scroll-area-extended";
import ToolResultsExample from "@monorepo/example/tool-results";
import TypingLoaderExample from "@monorepo/example/typing-loader";
import UploadButtonExample from "@monorepo/example/upload-button";
import UserConfirmationExample from "@monorepo/example/user-confirmation";

const apiKey = process.env.NEXT_PUBLIC_KORINAI_API_KEY;

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");

  // Minimal Korin config and token getter for demos
  const korinConfig: KorinAIConfig = {
    baseUrl: "https://api.korinai.com",
    chatApi: "https://api.korinai.com/api/chat",
  };
  const getAuthToken = async () => apiKey;

  return (
    <main className="min-h-screen p-8 container mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">KorinAI - UI Components Showcase</h1>
        <p className="text-muted-foreground">Live previews of KorinAI - UI components.</p>
      </header>

      <KorinProvider config={korinConfig} getAuthToken={getAuthToken} language="en">
        {/* Controls: Search + Group Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components (e.g. chat, upload, markdown)"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              "All",
              "Avatar & Identity",
              "Chat & Messaging",
              "Markdown & Rendering",
              "Inputs & Uploads",
              "Dialogs & Selection",
              "Layouts & Containers",
              "Tools & Results",
            ].map((g) => (
              <Button
                key={g}
                size="sm"
                variant={activeGroup === g ? "default" : "outline"}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Build items for the showcase */}
        {(() => {
          const items = [
            {
              id: "avatar",
              title: "AvatarKorin",
              group: "Avatar & Identity",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>AvatarKorin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AvatarKorinExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "chat-showcase",
              title: "ChatBubble",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ChatBubble</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatBubbleExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "memoized-md",
              title: "MemoizedMarkdown",
              group: "Markdown & Rendering",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>MemoizedMarkdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemoizedMarkdownExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "typing-loader",
              title: "TypingLoader",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>TypingLoader</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TypingLoaderExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "chat-limited",
              title: "ChatLimited",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ChatLimited</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatLimitedExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "file-preview",
              title: "FilePreviewDialog",
              group: "Dialogs & Selection",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>FilePreviewDialog</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FilePreviewDialogExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "chatbubble-single",
              title: "ChatBubble (single)",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ChatBubble</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatBubbleExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "chat-input",
              title: "ChatInput",
              group: "Inputs & Uploads",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ChatInput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatInputExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "upload-button",
              title: "UploadButton",
              group: "Inputs & Uploads",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>UploadButton</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadButtonExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "file-selector",
              title: "FileSelector",
              group: "Dialogs & Selection",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>FileSelector</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileSelectorExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "floating-chat",
              title: "FloatingChat",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>FloatingChat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FloatingChatExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "page-chat",
              title: "PageChat",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>PageChat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PageChatExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "response-md",
              title: "Response (Markdown)",
              group: "Markdown & Rendering",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Response (Markdown)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponseExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "reasoning",
              title: "Reasoning",
              group: "Chat & Messaging",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Reasoning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReasoningExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "scroll-area",
              title: "ScrollArea (extended)",
              group: "Layouts & Containers",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ScrollArea (extended)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollAreaExtendedExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "tool-results",
              title: "ToolResults",
              group: "Tools & Results",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>ToolResults</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ToolResultsExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "user-confirmation",
              title: "UserConfirmation",
              group: "Tools & Results",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>UserConfirmation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserConfirmationExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "codeblock",
              title: "CodeBlock",
              group: "Markdown & Rendering",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>CodeBlock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlockExample />
                  </CardContent>
                </Card>
              ),
            },
            {
              id: "codeblock-copy",
              title: "CodeBlock with Copy",
              group: "Markdown & Rendering",
              node: (
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>CodeBlock with Copy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlockWithCopyExample />
                  </CardContent>
                </Card>
              ),
            },
          ];

          const filtered = items.filter((it) => {
            const matchesQuery = it.title.toLowerCase().includes(query.toLowerCase());
            const matchesGroup = activeGroup === "All" || it.group === activeGroup;
            return matchesQuery && matchesGroup;
          });

          // Masonry using CSS columns. Each item must avoid breaking inside columns.
          return (
            <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
              {filtered.map((it) => (
                <div key={it.id} className="break-inside-avoid mb-6">
                  {it.node}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-12">No components match your search.</div>
              )}
            </div>
          );
        })()}
      </KorinProvider>
    </main>
  );
}
