import React from "react";
import { ChatInput } from "@monorepo/ui/chat-input";

export default function ChatInputExample() {
  return (
    <div className="p-4 max-w-xl border rounded-md">
      <ChatInput
        isLoading={false}
        showTemplate={false}
        handleSubmit={async () => {}}
        status="ready"
        onFileAttach={() => {}}
      />
    </div>
  );
}
