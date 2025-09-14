import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

interface GalleryDetail {
  id: string;
  file_url: string;
  caption: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_owner: boolean;
  has_access: boolean;
  access_emails?: string[];
}

interface GalleryDetailResponse {
  message: string;
  item: GalleryDetail;
}

const fetchGalleryDetail = async (
  url: string,
  authToken: string
): Promise<GalleryDetail> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorStatus = response.status;
    switch (errorStatus) {
      case 400:
        throw new Error("Missing gallery ID");
      case 401:
        throw new Error("Unauthorized - Invalid or missing token");
      case 403:
        throw new Error("Forbidden - You don't have access to this gallery");
      case 404:
        throw new Error("Gallery item not found");
      case 405:
        throw new Error("Method not allowed");
      default:
        throw new Error("Failed to fetch gallery detail");
    }
  }

  const data: GalleryDetailResponse = await response.json();
  return data.item;
};

export function useGalleryDetail(fileId: string | null) {
  const { authToken, config } = useKorinAI();
  const { data, error, mutate } = useSWR(
    fileId && authToken
      ? buildUrl(config.baseUrl, `/api/gallery/detail?id=${fileId}`)
      : null,
    async (url) => fetchGalleryDetail(url, authToken),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  return {
    detail: data,
    isLoading: Boolean(fileId) && !error && !data,
    isError: error,
    mutate,
  };
}
