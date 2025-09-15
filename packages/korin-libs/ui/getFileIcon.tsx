import type { ReactElement } from "react";

export const getFileIcon = (fileName: string): ReactElement => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-text-icon lucide-file-text"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-image-icon lucide-file-image"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <circle cx="10" cy="12" r="2" />
          <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
        </svg>
      );
    case "mp3":
    case "wav":
    case "ogg":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-audio-icon lucide-file-audio"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0" />
        </svg>
      );
    case "mp4":
    case "avi":
    case "mov":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-video-camera-icon lucide-file-video-camera"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <rect width="8" height="6" x="2" y="12" rx="1" />
          <path d="m10 13.843 3.033-1.755a.645.645 0 0 1 .967.56v4.704a.645.645 0 0 1-.967.56L10 16.157" />
        </svg>
      );
    case "zip":
    case "rar":
    case "7z":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-archive-icon lucide-file-archive"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M10 12v-1" />
          <path d="M10 18v-2" />
          <path d="M10 7V6" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01" />
          <circle cx="10" cy="20" r="2" />
        </svg>
      );
    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-code-icon lucide-file-code"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M10 12.5 8 15l2 2.5" />
          <path d="m14 12.5 2 2.5-2 2.5" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
        </svg>
      );
    case "csv":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-spreadsheet-icon lucide-file-spreadsheet"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M8 13h2" />
          <path d="M14 13h2" />
          <path d="M8 17h2" />
          <path d="M14 17h2" />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-icon lucide-file"
          style={{
            color: "var(--muted-foreground)",
            width: "6rem",
            height: "6rem",
          }}
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
      );
  }
};
