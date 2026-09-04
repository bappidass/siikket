const BASE_URL = "https://api.siiket.com";
const PATH_URL = "https://siiket.s3.ap-south-1.amazonaws.com";

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
};

export { BASE_URL, PATH_URL };
