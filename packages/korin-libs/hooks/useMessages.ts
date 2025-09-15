import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

export interface TextUIPart {
  type: "text";
  text: string;
}

export interface ReasoningUIPart {
  type: "reasoning";
  reasoning: string;
}

interface ToolInvocationPartialCall {
  state: "partial-call";
  toolCallId: string;
  toolName: string;
  args: Record<string, string | number | boolean>;
}

interface ToolInvocationCall {
  state: "call";
  toolCallId: string;
  toolName: string;
  args: Record<string, string | number | boolean>;
}

interface ToolInvocationResult {
  state: "result";
  toolCallId: string;
  toolName: string;
  args: Record<string, string | number | boolean>;
  result: Record<string, string | number | boolean>;
}

type ToolInvocationState =
  | ToolInvocationPartialCall
  | ToolInvocationCall
  | ToolInvocationResult;

interface MessagePart {
  type: string;
  text?: string;
  reasoning?: string;
  toolInvocation?: ToolInvocationState;
  source?: {
    type: string;
    path: string;
    content: string;
  };
  experimental_attachments?: Array<{
    name: string;
    contentType: string;
    url: string;
  }>;
}

interface Annotation {
  id: string;
  type: string;
  data: Record<string, string | number | boolean>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  userId: string;
  fileUrl?: string;
  is_ai: boolean;
  parts: MessagePart[];
  annotations: Annotation[];
}

type MessagesResponse = Message[] | { messages: Message[] };

export function useMessages(
  roomId?: string,
  agentId?: string,
  agentName?: string,
  limit: number = 50
) {
  const { authToken, config } = useKorinAI();
  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized. Please log in again.");
      if (response.status === 400)
        throw new Error("Bad Request - Room ID is required");
      if (response.status === 404) throw new Error("Agent not found");
      throw new Error("Failed to fetch messages");
    }

    return response.json();
  };

  // Construct the query URL with all parameters
  const queryParams = new URLSearchParams();
  if (roomId) queryParams.append("roomId", roomId);
  if (agentId) queryParams.append("agentId", agentId);
  if (agentName) queryParams.append("agentName", agentName);
  if (limit) queryParams.append("limit", limit.toString());

  const queryString = queryParams.toString();
  const apiUrl = buildUrl(
    config.baseUrl,
    `/api/messages/fetch${queryString ? `?${queryString}` : ""}`
  );

  const { data, error, mutate, isLoading } = useSWR<MessagesResponse>(
    roomId && authToken ? apiUrl : null,
    fetcher
  );

  return {
    messages: Array.isArray(data) ? data : data?.messages || [],
    isLoading: (!error && !data) || isLoading,
    isError: error,
    mutate,
  };
}
