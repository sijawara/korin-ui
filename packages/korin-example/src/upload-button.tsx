import React from "react";
import { UploadButton } from "@monorepo/ui/upload-button";

export default function UploadButtonExample() {
  return (
    <div className="p-4 w-48">
      <UploadButton onUploadComplete={async () => {}} />
    </div>
  );
}
