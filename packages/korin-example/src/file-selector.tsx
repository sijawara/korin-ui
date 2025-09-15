import React from "react";
import { FileSelector } from "@monorepo/ui/file-selector";

export default function FileSelectorExample() {
  return (
    <div className="p-4 space-y-2">
      <p className="text-sm text-muted-foreground">Requires gallery access; demo renders selector UI only.</p>
      <FileSelector onSelect={() => {}} onClose={() => {}} />
    </div>
  );
}
