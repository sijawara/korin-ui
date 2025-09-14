import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";
import type { Room } from "./useRooms";

export function useSingleRoom(roomId: string, enableSWR: boolean = true) {
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

  const { data, error, mutate, isLoading } = useSWR<Room>(
    enableSWR && authToken
      ? buildUrl(config.baseUrl, `/api/room/${roomId}`)
      : null,
    fetcher
  );

  return {
    room: data,
    isLoading: isLoading || (!error && !data),
    isError: error,
    mutate,
  };
}
