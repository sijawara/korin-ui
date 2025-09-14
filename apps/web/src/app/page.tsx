"use client";

import React, { useMemo, useState } from "react";
import { AvatarKorin } from "@monorepo/ui/avatar-korin";
import { ChatBubble } from "@monorepo/ui/chat-bubble";
import { ChatInput } from "@monorepo/ui/chat-input";
import ChatLimited from "@monorepo/ui/chat-limited";
import { FilePreviewDialog } from "@monorepo/ui/file-preview-dialog";
import { FileSelector } from "@monorepo/ui/file-selector";
import { FloatingChat } from "@monorepo/ui/floating-chat";
import { KorinProvider } from "@monorepo/ui/korin-provider";
import { MemoizedMarkdown } from "@monorepo/ui/memoized-markdown";
import { PageChat } from "@monorepo/ui/page-chat";
import { TypingLoader } from "@monorepo/ui/typing-loader";
import { UploadButton } from "@monorepo/ui/upload-button";
import { Response } from "@monorepo/ui/response";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@monorepo/ui/reasoning";
import { ScrollArea } from "@monorepo/ui/scroll-area-extended";
import { WebSearchResults, KnowledgeResults, ImageGenerationResults } from "@monorepo/ui/tool-results";
import { UserConfirmation } from "@monorepo/ui/user-confirmation";
import { CodeBlock as CodeBlockContainer, CodeBlockCode } from "@monorepo/ui/code-block";
import { CodeBlock as CodeBlockWithCopy, CodeBlockCopyButton } from "@monorepo/ui/code-block-with-copy";
import { Card, CardContent, CardHeader, CardTitle } from "@monorepo/shadcn-ui/card";
import { Button } from "@monorepo/shadcn-ui/button";
import type { KorinAIConfig } from "@korinai/libs/types";

const apiKey = process.env.NEXT_PUBLIC_KORINAI_API_KEY;

export default function Home() {
  // Local state for FilePreviewDialog demo
  const [openPreview, setOpenPreview] = useState(false);

  // Demo message for ChatBubble
  const demoMessage = useMemo(
    () => ({
      id: "demo-1",
      role: "assistant" as const,
      metadata: {
        sender_info: {
          sender_id: "agent-1",
          username: "Korin AI",
          profile_picture_url: "",
        },
        file_attachments: [
          {
            gallery_id: "g1",
            file_caption: "Sample image",
            file_url: "https://placehold.co/600x400/png",
          },
        ],
      },
      parts: [
        {
          type: "text",
          text: "Hello! This is a demo ChatBubble with markdown support.\n\n**Bold**, _italic_, and `inline code`.\n\n```ts\nconst add = (a:number,b:number)=>a+b;\n```",
        },
      ],
    }),
    [],
  );

  // ChatBubble demo messages covering all paths and user confirmation
  const chatMessages = useMemo(() => {
    const baseMeta = {
      sender_info: { sender_id: "agent-1", username: "Korin AI" },
    };

    return [
      // 1) Assistant text with markdown
      {
        id: "m1",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "text",
            text: "Hello! This is standard markdown with code:\n\n```ts\nexport const add = (a:number,b:number)=>a+b\n```",
          },
        ],
      },
      // 2) User message with links and line breaks (PlainTextWithLinks)
      {
        id: "m2",
        role: "user",
        metadata: { sender_info: { username: "You" } },
        parts: [
          {
            type: "text",
            text: "Check this out:\nhttps://korinai.com and https://placehold.co/300x200",
          },
        ],
      },
      // 3) Assistant reasoning (open while streaming)
      {
        id: "m3",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "reasoning",
            text: "I will first fetch data, then analyze patterns, and finally summarize findings.",
          },
          { type: "text", text: "Final answer after reasoning." },
        ],
      },
      // 4) Web search with pill + cards
      {
        id: "m4",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-web_search",
            state: "output-available",
            output: {
              data: [
                {
                  id: "w1",
                  title: "Korin AI",
                  url: "https://korinai.com",
                  text: "AI platform website",
                  image: "https://placehold.co/320x180",
                },
                {
                  id: "w2",
                  title: "Tailwind Docs",
                  url: "https://tailwindcss.com",
                  text: "Utility-first CSS framework",
                },
              ],
            },
          },
        ],
      },
      // 5) Knowledge results
      {
        id: "m5",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-get_relevant_knowledge",
            state: "output-available",
            output: {
              data: {
                results: [
                  {
                    id: "k1",
                    content: "How to integrate the ChatBubble in a page.",
                  },
                  {
                    id: "k2",
                    content: "Styling guidance for shadcn with Tailwind v4.",
                  },
                ],
              },
            },
          },
        ],
      },
      // 6) Image generation results
      {
        id: "m6",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-image_generation",
            state: "output-available",
            output: {
              artifacts: [
                {
                  url: "https://placehold.co/512x512/png",
                  alt: "Generated image 1",
                  filename: "image-1.png",
                },
                {
                  url: "https://placehold.co/512x512/jpg",
                  alt: "Generated image 2",
                  filename: "image-2.jpg",
                },
              ],
            },
          },
        ],
      },
      // 7) Routing to agent (running pill)
      {
        id: "m7",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-routing_to_agent",
            state: "input-available",
            input: { agent_name: "Repo Expert" },
          },
        ],
      },
      // 8) Generic tool error
      {
        id: "m8",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-run_command",
            state: "output-error",
            input: { command: "pnpm build" },
            output: { error: "Build failed" },
          },
        ],
      },
      // 9) Assistant with file attachments in metadata
      {
        id: "m9",
        role: "assistant",
        metadata: {
          ...baseMeta,
          file_attachments: [
            {
              gallery_id: "g1",
              file_caption: "Design Spec",
              file_url: "https://placehold.co/800x600/pdf",
            },
            {
              gallery_id: "g2",
              file_caption: "Logo",
              file_url: "https://placehold.co/600x400/png",
            },
          ],
        },
        parts: [{ type: "text", text: "Attached the files you requested." }],
      },
      // 10) Tool requiring user confirmation (e.g., git commit)
      {
        id: "m10",
        role: "assistant",
        metadata: baseMeta,
        parts: [
          {
            type: "tool-git_commit",
            state: "input-available",
            input: { path: "/repo/path", message: "feat: add demo" },
            output: null,
          },
        ],
      },
    ] as any[];
  }, []);

  // Minimal Korin config and token getter for demos
  const korinConfig: KorinAIConfig = {
    baseUrl: "https://api.korinai.com",
    chatApi: "https://api.korinai.com/api/chat",
  };
  const getAuthToken = async () => apiKey;

  return (
    <main className="min-h-screen p-8 container mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Korin UI Components Showcase</h1>
        <p className="text-muted-foreground">
          Live previews of components from <code>@monorepo/ui</code>.
        </p>
      </header>

      <KorinProvider config={korinConfig} getAuthToken={getAuthToken} language="en">
        {/* Flex wrap layout with consistent card sizing */}
        <div className="flex flex-wrap gap-6">
          {/* AvatarKorin */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>AvatarKorin</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto flex items-center gap-4">
              <AvatarKorin src="https://placehold.co/80x80" alt="Korin" className="h-12 w-12" />
              <AvatarKorin fallback="K" alt="Korin" className="h-12 w-12" />
            </CardContent>
          </Card>

          {/* ChatBubble Showcase (all rendering possibilities) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ChatBubble Showcase</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6">
              {chatMessages.map((m, idx) => (
                <ChatBubble
                  key={m.id}
                  message={m as any}
                  isStreaming={m.id === "m3"}
                  isReasoningActive={m.id === "m3"}
                  onToolConfirm={async () => {}}
                  onToolCancel={async () => {}}
                />
              ))}
            </CardContent>
          </Card>

          {/* MemoizedMarkdown */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>MemoizedMarkdown</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <MemoizedMarkdown content={"# Heading\nSome text with a list:\n- One\n- Two"} />
            </CardContent>
          </Card>

          {/* TypingLoader */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>TypingLoader</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <TypingLoader />
            </CardContent>
          </Card>

          {/* ChatLimited */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ChatLimited</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              <ChatLimited warning ownerEmail="admin@example.com" />
              <ChatLimited ownerEmail="admin@example.com" />
            </CardContent>
          </Card>

          {/* FilePreviewDialog */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>FilePreviewDialog</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              <Button onClick={() => setOpenPreview(true)}>Open Preview</Button>
              <FilePreviewDialog
                url="https://placehold.co/1024x768/png"
                open={openPreview}
                onOpenChange={setOpenPreview}
                name="image.png"
              />
            </CardContent>
          </Card>

          {/* ChatBubble (single) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ChatBubble</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <ChatBubble message={demoMessage as any} isStreaming={false} />
            </CardContent>
          </Card>

          {/* ChatInput */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ChatInput</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="border rounded-md p-3">
                <ChatInput
                  isLoading={false}
                  showTemplate={false}
                  handleSubmit={async () => {}}
                  status="ready"
                  onFileAttach={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* UploadButton */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>UploadButton</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="w-48">
                <UploadButton onUploadComplete={async () => {}} />
              </div>
            </CardContent>
          </Card>

          {/* FileSelector */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>FileSelector</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
              <p className="text-sm text-muted-foreground">
                Requires gallery access; this demo renders the selector UI.
              </p>
              <FileSelector onSelect={() => {}} onClose={() => {}} />
            </CardContent>
          </Card>

          {/* FloatingChat */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>FloatingChat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">Click the chat button at the bottom-right corner.</p>
              <FloatingChat className="" />
            </CardContent>
          </Card>

          {/* PageChat */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>PageChat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <PageChat />
            </CardContent>
          </Card>

          {/* Response (Markdown renderer) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>Response (Markdown)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Response>{`# Title\nSome math: $a^2 + b^2 = c^2$.\n\nA link to https://korinai.com`}</Response>
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>Reasoning</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Reasoning isStreaming defaultOpen>
                <ReasoningTrigger />
                <ReasoningContent>{"Thinking steps...\n1. Fetch data\n2. Analyze\n3. Summarize"}</ReasoningContent>
              </Reasoning>
            </CardContent>
          </Card>

          {/* ScrollArea (extended) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ScrollArea (extended)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <ScrollArea className="h-40 w-full border rounded-md">
                <div className="p-3 space-y-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i} className="text-sm">
                      Item {i + 1}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ToolResults (WebSearch/Knowledge/Image) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>ToolResults</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <WebSearchResults
                results={[
                  {
                    id: "w1",
                    title: "Korin AI",
                    url: "https://korinai.com",
                    text: "AI platform website",
                    image: "https://placehold.co/320x180",
                  },
                  {
                    id: "w2",
                    title: "Tailwind CSS",
                    url: "https://tailwindcss.com",
                    text: "Utility-first CSS framework",
                  },
                ]}
              />
              <KnowledgeResults
                results={[
                  {
                    id: "k1",
                    content: "How to integrate the ChatBubble in a page.",
                  },
                  {
                    id: "k2",
                    content: "Styling guidance for shadcn with Tailwind v4.",
                  },
                ]}
              />
              <ImageGenerationResults
                part={{ state: "output-available" }}
                results={[
                  {
                    url: "https://placehold.co/256x256/png",
                    alt: "Generated 1",
                    filename: "img1.png",
                  },
                  {
                    url: "https://placehold.co/256x256/jpg",
                    alt: "Generated 2",
                    filename: "img2.jpg",
                  },
                ]}
              />
            </CardContent>
          </Card>

          {/* UserConfirmation */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>UserConfirmation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <UserConfirmation
                type="tool-git_commit"
                state="input-available"
                input={{ path: "/repo/path", message: "feat: add demo" }}
                onConfirm={() => {}}
                onCancel={() => {}}
              />
            </CardContent>
          </Card>

          {/* CodeBlock (container + highlighted code) */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>CodeBlock</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <CodeBlockContainer>
                <CodeBlockCode code={`function add(a:number,b:number){\n  return a+b;\n}`} language="ts" />
              </CodeBlockContainer>
            </CardContent>
          </Card>

          {/* CodeBlock with Copy */}
          <Card className="flex flex-col h-[420px] w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]">
            <CardHeader>
              <CardTitle>CodeBlock with Copy</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <CodeBlockWithCopy code={`pnpm install\npnpm dev`} language="bash">
                <CodeBlockCopyButton />
              </CodeBlockWithCopy>
            </CardContent>
          </Card>
        </div>
      </KorinProvider>
    </main>
  );
}
