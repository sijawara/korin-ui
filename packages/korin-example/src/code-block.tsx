import React from "react";
import { CodeBlock as CodeBlockContainer, CodeBlockCode } from "@monorepo/ui/code-block";

export default function CodeBlockExample() {
  return (
    <div className="p-4">
      <CodeBlockContainer>
        <CodeBlockCode code={`function add(a:number,b:number){\n  return a+b;\n}`} language="ts" />
      </CodeBlockContainer>
    </div>
  );
}
