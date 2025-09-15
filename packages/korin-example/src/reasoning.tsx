import React from "react";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@monorepo/ui/reasoning";

export default function ReasoningExample() {
  return (
    <div className="p-4">
      <Reasoning isStreaming defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>{"Thinking steps...\n1. Fetch data\n2. Analyze\n3. Summarize"}</ReasoningContent>
      </Reasoning>
    </div>
  );
}
