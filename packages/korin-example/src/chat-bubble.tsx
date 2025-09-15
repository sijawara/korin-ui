import React, { useMemo } from "react";
import { ChatBubble } from "@monorepo/ui/chat-bubble";

export default function ChatBubbleExample() {
  const message = useMemo(
    () => ({
      id: "demo-1",
      role: "assistant" as const,
      metadata: {
        sender_info: { sender_id: "agent-1", username: "Korin AI" },
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
          text: "Hello! This is a demo ChatBubble with markdown support.\n\n**Bold**, _italic_, and `inline code`.",
        },
      ],
    }),
    [],
  );

  return (
    <div className="p-4">
      <ChatBubble message={message as any} isStreaming={false} />
    </div>
  );
}
