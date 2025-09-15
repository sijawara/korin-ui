import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

interface Participant {
  id: string;
  username: string;
  profile_picture_url: string;
}

interface BaseMessagePart {
  id: string;
  type: string;
  created_at: string;
}

interface TextMessagePart extends BaseMessagePart {
  type: "text";
  content: {
    text: string;
  };
}

interface ToolInvocationMessagePart extends BaseMessagePart {
  type: "tool-invocation";
  content: {
    toolName: string;
    state: string;
  };
}

interface FileMessagePart extends BaseMessagePart {
  type: "file";
  content: {
    url: string;
    name: string;
  };
}

interface ReasoningMessagePart extends BaseMessagePart {
  type: "reasoning";
  content: {
    reasoning: string;
  };
}

interface SourceMessagePart extends BaseMessagePart {
  type: "source";
  content: {
    url: string;
  };
}

type MessagePart =
  | TextMessagePart
  | ToolInvocationMessagePart
  | FileMessagePart
  | ReasoningMessagePart
  | SourceMessagePart;

export interface Room {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  last_message_part?: MessagePart;
}

interface PaginatedResponse {
  rooms: Room[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export function useRooms(
  page: number = 1,
  limit: number = 6,
  participantId?: string,
  search?: string,
  enableSWR: boolean = true
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
      throw new Error("Failed to fetch data");
    }
    return response.json();
  };

  const { data, error, mutate, isLoading } = useSWR<PaginatedResponse>(
    enableSWR && authToken
      ? buildUrl(
          config.baseUrl,
          `/api/room/get?page=${page}&limit=${limit}${participantId ? `&participantId=${participantId}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`
        )
      : null,
    fetcher
  );

  return {
    rooms: data?.rooms || [],
    pagination: data?.pagination,
    isLoading: isLoading || (!error && !data),
    isError: error,
    mutate,
  };
}
