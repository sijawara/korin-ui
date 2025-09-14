"use client";

import React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAgents, type UserProfile } from "../hooks/useAgents";
import { type PromptTemplate } from "@korinai/libs/types";

// We'll keep the Agent interface for backward compatibility
export interface Agent {
  agent_id: string;
  username: string;
  name: string;
  persona: string;
  avatar_url: string;
  email: string;
  prompt_templates: PromptTemplate[];
}

// Convert MainDeskAgent to Agent interface
const convertToAgent = (profile: UserProfile): Agent => ({
  agent_id: profile.id,
  username: profile.username,
  name: profile.name,
  persona: profile.persona,
  avatar_url: profile.profile_picture_url,
  email: profile.email,
  prompt_templates: profile.prompt_templates,
});

interface AgentContextType {
  currentAgent: Agent | null;
  agents: Agent[];
  switchAgent: (agentId: string, slient?: boolean) => void;
  isLoading: boolean;
  isError: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({
  children,
  initialAgentId = "fin-advisor",
  onAgentSwitch,
}: {
  children: React.ReactNode;
  initialAgentId?: string;
  onAgentSwitch?: (agent: Agent) => void;
}) {
  // Fetch agents from the API
  const { agents: apiAgents, isLoading, isError } = useAgents(1, 100); // Fetch up to 100 agents

  // Convert API agents to our Agent interface
  const availableAgents =
    isLoading || isError ? [] : apiAgents.map(convertToAgent);

  const [currentAgent, setCurrentAgent] = useState<Agent | null>(() => {
    // Try to get the agent from localStorage first
    const storedAgentId =
      typeof window !== "undefined"
        ? localStorage.getItem("currentAgentId")
        : null;
    const agentId = storedAgentId || initialAgentId;
    const agent = availableAgents.find((a) => a.agent_id === agentId);
    return agent || availableAgents[0] || null;
  });

  // Update current agent when API data loads
  useEffect(() => {
    if (!isLoading && !isError && apiAgents.length > 0) {
      const storedAgentId =
        typeof window !== "undefined"
          ? localStorage.getItem("currentAgentId")
          : null;
      const agentId = storedAgentId || currentAgent?.agent_id;
      const agent =
        availableAgents.find((a) => a.agent_id === agentId) ||
        availableAgents[0];
      setCurrentAgent(agent);
    }
  }, [apiAgents, isLoading, isError]);

  const switchAgent = useCallback(
    (agentId: string, silent = false) => {
      const agent = availableAgents.find((a) => a.agent_id === agentId);
      if (agent) {
        setCurrentAgent(agent);
        // Store the selected agent ID in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("currentAgentId", agentId);
        }
        if (!silent) onAgentSwitch?.(agent);
      }
    },
    [availableAgents]
  );

  const value = {
    currentAgent,
    agents: availableAgents,
    switchAgent,
    isLoading,
    isError,
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
