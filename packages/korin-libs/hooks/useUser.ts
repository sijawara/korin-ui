import useSWR from "swr";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  username: string;
  profile_picture_url: string;
  model?: string;
  persona?: string;
  onboarded?: boolean;
  is_public?: boolean;
  is_auto_replying?: boolean;
  auto_reply_setting?: string;
  summary_setting?: string;
  translation_setting?: string;
  citation?: string;
  web_search_enabled?: boolean;
  document_generation_enabled?: boolean;
  python_code_execution_enabled?: boolean;
  scientific_paper_enabled?: boolean;
  accountant_enabled?: boolean;
  is_knowledgable?: boolean;
  paid_credits?: number;
  default_credits?: number;
  shared_credits?: number;
}

interface CreditSharingInvitation {
  id: string;
  email: string;
  email_name: string;
  created_at: string;
  credit_sharing_id: string;
  owner: {
    email: string;
    name: string;
  };
}

export function useUser() {
  const { authToken, config } = useKorinAI();
  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    return response.json();
  };

  const { data, error, mutate, isLoading } = useSWR<UserDetails>(
    authToken ? buildUrl(config.baseUrl, `/api/profile/detail`) : null,
    fetcher
  );

  const totalCredit =
    (data?.paid_credits ?? 0) +
    (data?.default_credits ?? 0) +
    (data?.shared_credits ?? 0);

  const creditLimited = data ? totalCredit <= 0 : false;
  const minimumToWarn = parseFloat(config.minimumCreditsWarning ?? "10");
  const showWarning = data
    ? totalCredit > 0 && totalCredit <= minimumToWarn
    : false;

  return {
    user: data,
    isLoading: isLoading || (!error && !data),
    isError: error,
    mutate,
    creditLimited,
    showWarning,
    credits: {
      paid: data?.paid_credits,
      shared: data?.shared_credits,
      default: data?.default_credits,
    },
  };
}
