import React from "react";
import { MemoizedMarkdown } from "@monorepo/ui/memoized-markdown";

export default function MemoizedMarkdownExample() {
  return (
    <div className="p-4">
      <MemoizedMarkdown content={"# Heading\nSome text with a list:\n- One\n- Two"} />
    </div>
  );
}
