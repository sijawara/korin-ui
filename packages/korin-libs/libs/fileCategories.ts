export type FileCategory = "image" | "video" | "audio" | "document";

const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"];
const videoExtensions = [".mp4", ".mpeg", ".mov", ".avi", ".flv", ".mpg", ".webm", ".wmv", ".3gpp"];
const audioExtensions = [".wav", ".mp3", ".aiff", ".aac", ".ogg", ".flac"];
const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];

/**
 * Extracts the file name from a Firebase storage path or URL and removes timestamp prefix
 * @param path Firebase storage path or URL
 * @returns The file name without the path and timestamp
 */
export function getFileName(path: string): string {
  // Handle full Firebase Storage URLs
  if (path.includes("firebasestorage.googleapis.com")) {
    // Extract the file name from the URL parameters
    const match = path.match(/([^/?]+)(?=\?|$)/);
    if (match) {
      const fullName = decodeURIComponent(match[0]);
      // Remove timestamp prefix if it exists
      return fullName.replace(/^\d+_/, "");
    }
  }

  // Handle regular paths
  const parts = path.split("/");
  const fullName = parts[parts.length - 1] || "Unnamed file";
  // Remove timestamp prefix if it exists
  return fullName.replace(/^\d+_/, "");
}

export const getFileCategory = (url: string): FileCategory => {
  if (!url) return "document";

  // Extract the file name from the Firebase Storage URL
  const decodedUrl = decodeURIComponent(url);

  // Try to extract filename from Firebase URL first
  const firebaseMatch = decodedUrl.match(/\/([^/?]+)\?/);
  // If not a Firebase URL, try to get the last part of the path
  const pathMatch = decodedUrl.split("/").pop();

  const fileName = (firebaseMatch?.[1] || pathMatch || "").toLowerCase();

  // Check file extension
  const extension = `.${fileName.split(".").pop()}`.toLowerCase();

  if (imageExtensions.includes(extension)) {
    return "image";
  }
  if (videoExtensions.includes(extension)) {
    return "video";
  }
  if (audioExtensions.includes(extension)) {
    return "audio";
  }
  if (documentExtensions.includes(extension)) {
    return "document";
  }

  return "document";
};
