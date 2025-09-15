import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import useSWR from "swr";

export type KorinAIConfig = {
  baseUrl?: string;
  chatApi?: string;
  minimumCreditsWarning?: string;
  language?: string;
};

export type AuthToken = string | undefined | null;

export type KorinAIContextType = {
  config: Omit<KorinAIConfig, "language">;
  setConfig: (config: KorinAIConfig) => void;
  authToken: AuthToken;
  setAuthToken: (token: AuthToken) => void;
  getAuthToken: () => Promise<AuthToken>;
  language?: string;
  setLanguage: (language: string) => void;
  translations: ChatTranslations;
};

export const KORIN_TRANSLATIONS: ChatTranslations = {
  en: {
    startChat: "Start Chat",
    closeChat: "Close Chat",
    newChat: "New Chat",
    chatHistory: "Chat History",
    loadingConversation: "Loading conversation...",
    noChatHistory: "No chat history yet",
    startConversation: "Start a conversation to see it here",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    thinking: "Thinking...",
    usingTool: "Using {toolName}...",
    attachedFile: "Attached file",
    sharedLink: "Shared a link",
    failedToLoadHistory: "Failed to load chat history",
    tryAgainLater: "Please try again later",
    ai: "AI",
    helloImYourAIAssistant: "Hello! I'm your AI assistant. How can I help you today? 👋",
    preparingExperience: "Preparing your chat experience… Please ensure your API URL and API key are configured.",
    templates: "Templates",
    fileSizeError: "File size must be less than 10MB",
    fileTypeError: "File type not supported",
    uploadSuccess: "File uploaded successfully",
    uploadFailed: "Upload failed",
    dropFile: "Drop your file here",
    retry: "Retry",
    selectAgent: "Select Agent",
    attachFile: "Attach File",
    stopGenerating: "Stop generating",
    sendMessage: "Send message",
    noCredits: "No credits available",
    selectFile: "Select File",
  },
  id: {
    startChat: "Mulai Obrolan",
    closeChat: "Tutup Obrolan",
    newChat: "Obrolan Baru",
    chatHistory: "Riwayat Obrolan",
    loadingConversation: "Memuat percakapan...",
    noChatHistory: "Belum ada riwayat obrolan",
    startConversation: "Mulai percakapan untuk melihatnya di sini",
    previous: "Sebelumnya",
    next: "Selanjutnya",
    page: "Halaman",
    of: "dari",
    thinking: "Memproses...",
    usingTool: "Menggunakan {toolName}...",
    attachedFile: "Berkas terlampir",
    sharedLink: "Membagikan tautan",
    failedToLoadHistory: "Gagal memuat riwayat obrolan",
    tryAgainLater: "Silakan coba lagi nanti",
    ai: "AI",
    helloImYourAIAssistant: "Halo! Saya asisten AI Anda. Ada yang bisa saya bantu? 👋",
    preparingExperience: "Menyiapkan pengalaman chat Anda… Pastikan URL API dan kunci API Anda telah dikonfigurasi.",
    templates: "Template",
    fileSizeError: "Ukuran file harus kurang dari 10MB",
    fileTypeError: "Tipe file tidak didukung",
    uploadSuccess: "File berhasil diunggah",
    uploadFailed: "Gagal mengunggah",
    dropFile: "Letakkan file Anda di sini",
    retry: "Coba Lagi",
    selectAgent: "Pilih Agen",
    attachFile: "Lampirkan File",
    stopGenerating: "Hentikan pembuatan",
    sendMessage: "Kirim pesan",
    noCredits: "Kredit tidak tersedia",
    selectFile: "Pilih File",
  },
};

export const KorinAIContext = createContext<KorinAIContextType>({
  config: {},
  setConfig: () => {},
  authToken: undefined,
  setAuthToken: () => {},
  getAuthToken: () => Promise.resolve(undefined),
  language: "en",
  setLanguage: () => {},
  translations: KORIN_TRANSLATIONS,
});

export const KorinAIProvider = ({
  children,
  config: initialConfig,
  authToken: initialAuthToken,
  language: initialLanguage,
  getAuthToken,
  translations,
}: {
  children: ReactNode;
  config: KorinAIConfig;
  authToken: AuthToken;
  language?: string;
  getAuthToken?: () => Promise<AuthToken>;
  translations?: ChatTranslations;
}) => {
  const [config, setConfig] = useState<KorinAIConfig>(initialConfig);
  const [authToken, setAuthToken] = useState<AuthToken>(initialAuthToken);
  const [language, setLanguage] = useState<string>(initialLanguage || "en");

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (initialAuthToken) {
      setAuthToken(initialAuthToken);
    }
  }, [initialAuthToken]);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [JSON.stringify(initialConfig)]);

  useSWR(getAuthToken ? "auth-token" : null, getAuthToken, {
    dedupingInterval: 1000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    keepPreviousData: false,
    shouldRetryOnError: true,
    errorRetryCount: 5,
    errorRetryInterval: 5000,
    onSuccess: (data) => {
      setAuthToken(data);
    },
  });

  const mergedTranslations = useMemo(() => {
    return Object.keys(translations ?? {}).reduce((acc, lang) => {
      acc[lang] = { ...(KORIN_TRANSLATIONS[lang] || {}), ...translations[lang] };
      return acc;
    }, KORIN_TRANSLATIONS);
  }, [translations]);

  return (
    <KorinAIContext.Provider
      value={{
        config,
        setConfig,
        authToken,
        setAuthToken,
        language,
        setLanguage,
        getAuthToken,
        translations: mergedTranslations,
      }}
    >
      {children}
    </KorinAIContext.Provider>
  );
};

export const useKorinAI = () => {
  const context = useContext(KorinAIContext);
  if (!context) {
    throw new Error("useKorinAI must be used within an KorinAIProvider");
  }
  return context;
};

// Centralized translations
export type ChatTranslations = {
  [lang: string]: {
    startChat: string;
    closeChat: string;
    newChat: string;
    chatHistory: string;
    loadingConversation: string;
    noChatHistory: string;
    startConversation: string;
    previous: string;
    next: string;
    page: string;
    of: string;
    thinking: string;
    usingTool: string;
    attachedFile: string;
    sharedLink: string;
    failedToLoadHistory: string;
    tryAgainLater: string;
    ai: string;
    helloImYourAIAssistant: string;
    preparingExperience: string;
    templates: string;
    fileSizeError: string;
    fileTypeError: string;
    uploadSuccess: string;
    uploadFailed: string;
    dropFile: string;
    retry: string;
    selectAgent: string;
    attachFile: string;
    stopGenerating: string;
    sendMessage: string;
    noCredits: string;
    selectFile: string;
  };
};
