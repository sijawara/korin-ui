import React, { useState } from "react";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { FilePreviewDialog } from "@monorepo/ui/file-preview-dialog";

export default function FilePreviewDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4 space-y-3">
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewDialog url="https://placehold.co/1024x768/png" open={open} onOpenChange={setOpen} name="image.png" />
    </div>
  );
}
