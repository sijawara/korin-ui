import React from "react";
import { AvatarKorin } from "@monorepo/ui/avatar-korin";

export default function AvatarKorinExample() {
  return (
    <div className="p-4 flex items-center gap-4">
      <AvatarKorin src="https://placehold.co/80x80" alt="Korin" className="h-12 w-12" />
      <AvatarKorin fallback="K" alt="Korin" className="h-12 w-12" />
    </div>
  );
}
