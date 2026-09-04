"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { X, Upload } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BASE_URL } from "@/utils/api";

interface ImageUploadProps {
    initialImage?: string;
    onUploadComplete?: (url: string) => void;
    onRemoved?: (url: string) => void;
    id?: string;
    folder: string
}

export function ImageUpload({
    initialImage,
    onUploadComplete,
    onRemoved,
    id,
    folder
}: ImageUploadProps) {
    const inputId = id || `fileInput-${Math.random()}`;

    const [imageUrl, setImageUrl] = useState(initialImage || "");
    const [progress, setProgress] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cancelRef = useRef<any>(null);

    useEffect(() => {
        setImageUrl(initialImage || "");
    }, [initialImage]);

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

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = "";

        try {
            setUploading(true);
            setProgress(0);
            setError(null);

            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();

            const { data } = await axios.post(`${BASE_URL}/api/files/upload`,
                {
                    fileName: file.name,
                    fileType: file.type,
                    folder: folder
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );


            const { uploadUrl, key } = data;

            const CancelToken = axios.CancelToken;
            cancelRef.current = CancelToken.source();

            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
                cancelToken: cancelRef.current.token,
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) /
                        (progressEvent.total || 1)
                    );
                    setProgress(percent);
                },
            });

            setImageUrl(key);
            setUploading(false);
            setProgress(null);
            onUploadComplete?.(key);

        } catch (err: any) {
            if (axios.isCancel(err)) {
                setError("Upload canceled.");
            } else {
                setError("Upload failed. Please try again.");
            }

            setUploading(false);
            setProgress(null);
        }
    };

    const handleCancel = () => {
        if (cancelRef.current) {
            cancelRef.current.cancel();
        }
    };

    return (
        <div className="space-y-3">
            {imageUrl ? (
                <div className="relative w-full md:w-[250px] h-[250px]">
                    <img
                        src={imageUrl}
                        alt="Uploaded"
                        className="w-full h-full object-contain rounded-md border"
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setImageUrl("");
                            onUploadComplete?.("");
                            onRemoved?.(imageUrl);
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label
                    htmlFor={inputId}
                    className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 transition"
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                        Upload Image
                    </span>

                    <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            )}

            {uploading && (
                <div className="space-y-2 w-40">
                    <Progress value={progress || 0} />

                    <div className="flex justify-between text-sm">
                        <span>{progress}%</span>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-red-500 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}