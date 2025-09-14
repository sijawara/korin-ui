const mimeTypes = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  js: "application/javascript",
  py: "application/x-python",
  txt: "text/plain",
  html: "text/html",
  css: "text/css",
  md: "text/markdown",
  csv: "text/csv",
  xml: "text/xml",
  rtf: "text/rtf",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  flv: "video/x-flv",
  mpg: "video/mpeg",
  webm: "video/webm",
  wmv: "video/x-ms-wmv",
  "3gpp": "video/3gpp",
  // Audio formats supported by Gemini API
  wav: "audio/wav",
  mp3: "audio/mp3",
  aiff: "audio/aiff",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac",
};

/**
 * Gets the MIME type for a given file URL
 * @param fileUrl - The URL of the file
 * @returns The MIME type string, defaults to "application/octet-stream" if not found
 */
export function getMimeType(fileUrl: string): string {
  try {
    // Remove query parameters from the URL
    const urlWithoutParams = fileUrl.split("?")[0];

    // Get the file name from the URL
    const fileName = urlWithoutParams.split("/").pop();

    if (!fileName) {
      return "application/octet-stream";
    }

    // Extract extension from the file name
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    return mimeTypes[extension as keyof typeof mimeTypes] || "application/octet-stream";
  } catch (error) {
    console.error("Error determining MIME type:", error);
    return "application/octet-stream";
  }
}

export type MimeTypes = typeof mimeTypes;
export { mimeTypes }; 