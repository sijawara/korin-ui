import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

export interface StorageItem {
  id: string;
  file_url: string;
  caption: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_owner: boolean;
  has_access: boolean;
  access_emails?: string[];
  is_knowledge?: boolean;
}

interface GalleryResponse {
  gallery: StorageItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface GalleryOptions {
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "updated_at" | "file_url" | "caption";
  sortOrder?: "asc" | "desc";
  showAll?: boolean;
}

const fetchGalleryItems = async (
  url: string,
  authToken: string
): Promise<GalleryResponse> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required");
    } else if (response.status === 403) {
      throw new Error("You don't have access to this gallery");
    }
    throw new Error("Failed to fetch gallery items");
  }

  return response.json();
};

export function useGallery(options: GalleryOptions = {}) {
  const { authToken, config } = useKorinAI();
  const queryParams = new URLSearchParams({
    page: options.page?.toString() || "1",
    limit: options.limit?.toString() || "10",
    sortBy: options.sortBy || "created_at",
    sortOrder: options.sortOrder || "desc",
    ...(options.showAll !== undefined && {
      showAll: options.showAll.toString(),
    }),
  });
  const { data, error, mutate } = useSWR<GalleryResponse>(
    authToken
      ? buildUrl(config.baseUrl, `/api/gallery/get?${queryParams}`)
      : null,
    async (url) => fetchGalleryItems(url, authToken),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  return {
    items: data?.gallery || [],
    total: data?.totalItems || 0,
    page: data?.currentPage || 1,
    totalPages: data?.totalPages || 1,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
