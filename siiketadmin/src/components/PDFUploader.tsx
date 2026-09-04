import React, { useState, useRef } from "react";
import axios, { CancelTokenSource } from "axios";
import { toast } from "sonner";
import { PATH_URL } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default function PDFUploadWithSignedUrl({
  initialUrl = "",
  initialFileName = "",
  apiEndpoint,
  collection,
  onUploaded = (url: string, fileName: string) => { },
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(initialFileName);
  const [fileUrl, setFileUrl] = useState(initialUrl);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const cancelSource = useRef<CancelTokenSource | null>(null);

  const waitForUser = (): Promise<any> =>
    new Promise((resolve, reject) => {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (currentUser) return resolve(currentUser);
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("Not logged in"));
      });
    });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
  }

  async function uploadFile() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    cancelSource.current = axios.CancelToken.source();
    try {
      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();
      const res = await axios.post(apiEndpoint,
        {
          fileName: file.name,
          fileType: file.type,
          folder: collection,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const { uploadUrl, key: uniqueFileName } = res.data;
      if (!uploadUrl) throw new Error("Failed to get signed upload URL");

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        cancelToken: cancelSource.current?.token,
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setProgress(percent);
          }
        },
      });

      const publicUrl = `${PATH_URL}/${uniqueFileName}`;
      setFileUrl(publicUrl);
      setProgress(100);
      onUploaded(publicUrl, uniqueFileName);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        toast.error("Upload cancelled.");
      } else {
        toast.error(err.message || "Upload failed");
      }
    } finally {
      setUploading(false);
      cancelSource.current = null;
    }
  }

  function cancelUpload() {
    if (cancelSource.current) {
      cancelSource.current.cancel("User cancelled upload.");
      cancelSource.current = null;
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <input type="file" onChange={handleFileSelect} />

      {fileName && <div className="text-sm text-gray-700">Selected: {fileName}</div>}

      {file && !uploading && (
        <button
          onClick={uploadFile}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Upload
        </button>
      )}

      {uploading && (
        <div className="flex flex-col gap-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{progress}%</span>
            <button
              onClick={cancelUpload}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {fileUrl ? (
        <iframe src={fileUrl} title="PDF Preview" className="w-full h-[300px] border rounded-lg" />
      ) : (
        <div className="text-sm text-gray-500">No Doc uploaded yet</div>
      )}
    </div>
  );
}