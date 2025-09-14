export type FileCategory = "image" | "video" | "audio" | "document";

const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"];
const videoExtensions = [".mp4", ".mpeg", ".mov", ".avi", ".flv", ".mpg", ".webm", ".wmv", ".3gpp"];
const audioExtensions = [".wav", ".mp3", ".aiff", ".aac", ".ogg", ".flac"];
const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];

export const getFileName = (url: string): string => {
  if (!url) return "Untitled";

  const decodedUrl = decodeURIComponent(url);
  const fileNameMatch = decodedUrl.match(/\/([^/?]+)\?/);
  if (!fileNameMatch) return "Untitled";

  // Extract timestamp and actual name
  const fullName = fileNameMatch[1];
  const nameMatch = fullName.match(/\d+_(.+)$/);
  if (nameMatch) {
    // Remove the timestamp prefix and return the actual name
    return nameMatch[1].replace(/_/g, " ");
  }

  return fullName;
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
