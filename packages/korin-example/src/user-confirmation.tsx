import React from "react";
import { UserConfirmation } from "@monorepo/ui/user-confirmation";

export default function UserConfirmationExample() {
  return (
    <div className="p-4">
      <UserConfirmation
        type="tool-git_commit"
        state="input-available"
        input={{ path: "/repo/path", message: "feat: add demo" }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}
