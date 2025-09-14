export const buildUrl = (baseUrl: string, path: string) => {
  return `${baseUrl}${path}`.replace(/\/+/g, "/");
};
