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
import { Check, Copy } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_KORINAI_API_KEY;

function InstallBlock({ variant = "default", slug }: { variant?: "default" | "inline"; slug: string }) {
  const [copied, setCopied] = useState(false);
  const cmd = `npx shadcn@latest add https://ui.korinai.com/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInline = variant === "inline";

  return (
    <div className="mt-3 group">
      {!isInline && (
        <div className="flex flex-row justify-between">
          <div className="text-xs text-muted-foreground mb-1">Install</div>
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-4 shrink-0"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <pre className="flex-1 rounded bg-muted p-2 text-xs overflow-x-auto">
          <code>{cmd}</code>
        </pre>
        {isInline && (
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-4 shrink-0"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}

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
        <div className="mt-3 max-w-md mx-auto">
          <InstallBlock variant="inline" slug="all.json" />
        </div>
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
                    <InstallBlock slug="avatar-korin.json" />
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
                    <InstallBlock slug="chat-bubble.json" />
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
                    <InstallBlock slug="memoized-markdown.json" />
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
                    <InstallBlock slug="typing-loader.json" />
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
                    <InstallBlock slug="chat-limited.json" />
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
                    <InstallBlock slug="file-preview-dialog.json" />
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
                    <InstallBlock slug="chat-input.json" />
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
                    <InstallBlock slug="upload-button.json" />
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
                    <InstallBlock slug="file-selector.json" />
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
                    <InstallBlock slug="floating-chat.json" />
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
                    <InstallBlock slug="page-chat.json" />
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
                    <InstallBlock slug="response.json" />
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
                    <InstallBlock slug="reasoning.json" />
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
                    <InstallBlock slug="scroll-area-extended.json" />
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
                    <InstallBlock slug="tool-results.json" />
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
                    <InstallBlock slug="user-confirmation.json" />
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
                    <InstallBlock slug="code-block.json" />
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
                    <InstallBlock slug="code-block-with-copy.json" />
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
