export const PATH_URL = "https://siiket.s3.ap-south-1.amazonaws.com";

export function resolveImageUrl(key?: string | null) {
  if (!key) return "";
  return key.startsWith("http") ? key : `${PATH_URL}/${key}`;
}