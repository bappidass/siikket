import { BASE_URL } from "@/utils/api";
import { auth } from "@/utils/firebase";

export async function downloadAuthedFile(path: string, filename: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first");
  const token = await user.getIdToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: token },
  });
  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}