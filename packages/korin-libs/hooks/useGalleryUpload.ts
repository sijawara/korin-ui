import { useState } from "react";
import { useKorinAI } from "../contexts/korinai-context";
import { buildUrl } from "../libs/build-url";

interface UploadProgress {
  progress: number;
  status: string;
}

interface UploadResult {
  success: boolean;
  fileUrl?: string;
  galleryId?: string;
  caption?: string;
  error?: string;
}

export function useGalleryUpload() {
  const { authToken, config } = useKorinAI();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: "",
  });

  const uploadFile = async (
    file: File,
    isPublic: boolean,
    accessEmails: string[],
    isKnowledge: boolean = true,
    profileId: string,
  ): Promise<UploadResult> => {
    if (!authToken) {
      return { success: false, error: "Auth Token not provided" };
    }

    setIsUploading(true);
    setUploadProgress({ progress: 0, status: "Starting upload..." });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isPublic", isPublic.toString());
      formData.append("accessEmails", JSON.stringify(accessEmails));
      formData.append("isKnowledge", isKnowledge.toString());

      const response = await fetch(buildUrl(config.baseUrl, `/api/gallery/add?profileId=${profileId}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      let fileUrl: string | undefined;
      let galleryId: string | undefined;
      let caption: string | undefined;
      let currentStep = 0;
      const totalSteps = 4; // auth, file, embedding, access

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const updates = chunk
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        for (const update of updates) {
          switch (update.type) {
            case "auth":
              currentStep = 1;
              setUploadProgress((prev) => ({
                ...prev,
                progress: (currentStep / totalSteps) * 100,
                status: `Authentication: ${update.data.status}`,
              }));
              break;
            case "file":
              currentStep = 2;
              setUploadProgress((prev) => ({
                ...prev,
                progress: (currentStep / totalSteps) * 100,
                status: `File: ${update.data.status}`,
              }));
              break;
            case "progress":
              setUploadProgress((prev) => ({
                ...prev,
                status: "Storing your file",
              }));
              break;
            case "url":
              fileUrl = update.data.fileUrl;
              galleryId = update.data.galleryId;
              setUploadProgress((prev) => ({
                ...prev,
                status: "Analyzing content",
              }));
              break;
            case "caption":
              if (update.data.status === "generated") {
                currentStep = 3;
                setUploadProgress((prev) => ({
                  ...prev,
                  progress: (currentStep / totalSteps) * 100,
                  status: "Converting file into numbers",
                }));
              }
              break;
            case "embedding":
              setUploadProgress((prev) => ({
                ...prev,
                status: "Managing access",
              }));
              break;
            case "access":
              currentStep = 4;
              setUploadProgress((prev) => ({
                ...prev,
                progress: (currentStep / totalSteps) * 100,
                status: `Configured access for ${update.data.count} emails`,
              }));
              break;
            case "database":
              setUploadProgress((prev) => ({
                ...prev,
                status: `Database: ${update.data.status}`,
              }));
              if (update.data.id) {
                galleryId = update.data.id;
              }
              break;
            case "complete":
              setUploadProgress((prev) => ({
                ...prev,
                progress: 100,
                status: "Upload complete",
              }));
              if (update.data.caption) {
                caption = update.data.caption;
              }
              if (update.data.galleryItemId) {
                galleryId = update.data.galleryItemId;
              }
              break;
            case "error":
              throw new Error(update.data.message);
          }
        }
      }

      return { success: true, fileUrl, galleryId, caption };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
}
