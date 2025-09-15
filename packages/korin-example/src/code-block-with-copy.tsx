import React from "react";
import { CodeBlock as CodeBlockWithCopy, CodeBlockCopyButton } from "@monorepo/ui/code-block-with-copy";

export default function CodeBlockWithCopyExample() {
  return (
    <div className="p-4">
      <CodeBlockWithCopy code={`pnpm install\npnpm dev`} language="bash">
        <CodeBlockCopyButton />
      </CodeBlockWithCopy>
    </div>
  );
}
