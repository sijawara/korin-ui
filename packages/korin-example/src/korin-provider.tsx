import React from "react";
import { KorinProvider } from "@monorepo/ui/korin-provider";

export default function KorinProviderExample() {
  const config = { baseUrl: "https://api.korinai.com", chatApi: "https://api.korinai.com/api/chat" };
  const getAuthToken = async () => "";
  return (
    <KorinProvider config={config} getAuthToken={getAuthToken} language="en">
      <div className="p-4">KorinProvider is mounted. Place your chat components here.</div>
    </KorinProvider>
  );
}
