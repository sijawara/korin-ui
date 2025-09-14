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
