export const buildUrl = (baseUrl: string, path: string) => {
  // Remove trailing slashes from baseUrl and leading slashes from path
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  // Join with a single slash
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
};
