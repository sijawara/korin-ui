"use client";

import {
  KorinAIProvider,
  type AuthToken,
  type KorinAIConfig,
  type ChatTranslations,
} from "@korinai/libs/contexts/korinai-context";
import { AgentProvider } from "@korinai/libs/contexts/agent-context";

export const KorinProvider = ({
  children,
  config,
  authToken,
  language = "en",
  getAuthToken,
  translations,
}: {
  children: React.ReactNode;
  config: KorinAIConfig;
  authToken?: AuthToken;
  language?: string;
  getAuthToken?: () => Promise<AuthToken>;
  translations?: ChatTranslations;
}) => {
  return (
    <KorinAIProvider
      getAuthToken={getAuthToken}
      language={language}
      config={config}
      authToken={authToken}
      translations={translations}
    >
      <AgentProvider>{children}</AgentProvider>
    </KorinAIProvider>
  );
};
