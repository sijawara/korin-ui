import React from "react";
import { FloatingChat } from "@monorepo/ui/floating-chat";

export default function FloatingChatExample() {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground mb-2">Click the chat button at the bottom-right corner.</p>
      <FloatingChat className="" />
    </div>
  );
}
