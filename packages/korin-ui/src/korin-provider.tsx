"use client";

import {
  KorinAIProvider,
  type AuthToken,
  type KorinAIConfig,
} from "@korinai/libs/contexts/korinai-context";
import { AgentProvider } from "@korinai/libs/contexts/agent-context";

export const KorinProvider = ({
  children,
  config,
  authToken,
  language = "en",
  getAuthToken,
}: {
  children: React.ReactNode;
  config: KorinAIConfig;
  authToken?: AuthToken;
  language?: string;
  getAuthToken?: () => Promise<AuthToken>;
}) => {
  return (
    <KorinAIProvider
      getAuthToken={getAuthToken}
      language={language}
      config={config}
      authToken={authToken}
    >
      <AgentProvider>{children}</AgentProvider>
    </KorinAIProvider>
  );
};
