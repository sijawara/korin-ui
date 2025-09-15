import React from "react";
import { ScrollArea } from "@monorepo/ui/scroll-area-extended";

export default function ScrollAreaExtendedExample() {
  return (
    <div className="p-4">
      <ScrollArea className="h-40 w-full border rounded-md">
        <div className="p-3 space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-sm">
              Item {i + 1}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
