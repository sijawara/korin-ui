import useSWR from "swr";
import type { PromptTemplate } from "../types";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  is_public: boolean;
  profile_picture_url: string;
  persona: string;
  email: string;
  model: string;
  web_search_enabled: boolean;
  is_following: boolean;
  is_knowledgable: boolean;
  prompt_templates: PromptTemplate[];
}

interface AgentsResponse {
  agents: UserProfile[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Hook to fetch and manage agent profiles
 *
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @param search - Optional search term to filter agents
 *
 * @returns {Object} Object containing:
 * - agents: Array of agent profiles
 * - currentPage: Current page number
 * - totalPages: Total number of pages
 * - totalItems: Total number of items
 * - isLoading: Loading state
 * - isError: Error state
 * - mutate: Function to mutate the data
 *
 * Example successful response:
 * {
 *   "agents": [{
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "name": "John Doe",
 *     "username": "johndoe",
 *     "is_public": true,
 *     "profile_picture_url": "https://example.com/profile.jpg",
 *     "persona": "AI Research Specialist",
 *     "email": "john@example.com",
 *     "model": "gpt-4",
 *     "web_search_enabled": true,
 *     "is_following": false,
 *     "is_knowledgable": true,
 *     "prompt_templates": [{
 *       "id": "789e4567-e89b-12d3-a456-426614174000",
 *       "title": "Research Analysis",
 *       "content": "Analyze the following research paper...",
 *       "created_at": "2024-03-20T10:30:00Z",
 *       "updated_at": "2024-03-20T10:30:00Z"
 *     }]
 *   }],
 *   "currentPage": 1,
 *   "totalPages": 5,
 *   "totalItems": 48
 * }
 */
export function useAgents(page: number = 1, limit: number = 10, search: string = "") {
  const { authToken, config } = useKorinAI();
  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch agent profiles");
    }
    return response.json();
  };

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  }).toString();

  const { data, error, mutate, isLoading } = useSWR<AgentsResponse>(
    authToken ? buildUrl(config.baseUrl, `/api/profile/agents?${queryParams}`) : null,
    fetcher,
  );

  return {
    agents: data?.agents || [],
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 0,
    totalItems: data?.totalItems || 0,
    isLoading: isLoading || (!error && !data && !!authToken),
    isError: error,
    mutate,
  };
}
