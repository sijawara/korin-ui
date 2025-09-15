import React from "react";
import ChatLimited from "@monorepo/ui/chat-limited";

export default function ChatLimitedExample() {
  return (
    <div className="p-4 space-y-3">
      <ChatLimited warning ownerEmail="admin@example.com" />
      <ChatLimited ownerEmail="admin@example.com" />
    </div>
  );
}
