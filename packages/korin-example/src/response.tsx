import React from "react";
import { Response } from "@monorepo/ui/response";

export default function ResponseExample() {
  return (
    <div className="p-4">
      <Response>{`# Title\nSome math: $a^2 + b^2 = c^2$.\n\nA link to https://korinai.com`}</Response>
    </div>
  );
}
