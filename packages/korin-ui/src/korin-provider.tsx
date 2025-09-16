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
  rootContainer,
}: {
  children: React.ReactNode;
  config: KorinAIConfig;
  authToken?: AuthToken;
  language?: string;
  getAuthToken?: () => Promise<AuthToken>;
  translations?: ChatTranslations;
  rootContainer?: Element;
}) => {
  return (
    <KorinAIProvider
      getAuthToken={getAuthToken}
      language={language}
      config={config}
      authToken={authToken}
      translations={translations}
      rootContainer={rootContainer}
    >
      <AgentProvider>{children}</AgentProvider>
    </KorinAIProvider>
  );
};
