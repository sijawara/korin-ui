export type FileCategory = "image" | "video" | "audio" | "document";

const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"];
const videoExtensions = [".mp4", ".mpeg", ".mov", ".avi", ".flv", ".mpg", ".webm", ".wmv", ".3gpp"];
const audioExtensions = [".wav", ".mp3", ".aiff", ".aac", ".ogg", ".flac"];
const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];

/**
 * Extracts the filename from a URL, with special handling for Firebase Storage URLs.
 * For Firebase Storage URLs, it decodes the URL and extracts the original filename.
 * For other URLs, it extracts the last segment of the path.
 *
 * @param {string} url - The URL to extract the filename from
 * @returns {string} The extracted filename, or "Untitled" if no filename can be determined
 */
export const getFileName = (url: string): string => {
  if (!url) return "Untitled";

  try {
    // Decode the URL to handle encoded characters
    const decodedUrl = decodeURIComponent(url);

    // Handle Firebase Storage URLs
    if (decodedUrl.includes("firebasestorage.googleapis.com")) {
      // Extract the path after /o/ and before the query parameters
      const pathMatch = decodedUrl.match(/\/o\/([^?]+)/);
      if (!pathMatch) return "Untitled";

      // Get the last part of the path which contains the filename
      const pathParts = pathMatch[1].split("/");
      const fileNameWithTimestamp = pathParts[pathParts.length - 1];

      // Remove timestamp prefix if present (format: timestamp_originalName)
      const parts = fileNameWithTimestamp.split("_");
      const lastTwoParts = parts.slice(parts.findLastIndex((x) => x.match(/\d{11,}/))).join("_");
      return lastTwoParts;
    }

    // Handle regular URLs
    const urlObj = new URL(decodedUrl);
    const pathname = urlObj.pathname;
    const fileName = pathname.split("/").pop() || "Untitled";

    return fileName;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return "Untitled";
  }
};

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
