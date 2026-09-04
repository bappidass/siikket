import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";

type PDFFileSelectProps = {
    initialFileUrl?: string | null;
    initialFileName?: string | null;
    onFileChange?: (file?: File | null, url?: string | null) => void;
};

export default function PDFFileSelect({
    initialFileUrl = null,
    initialFileName = null,
    onFileChange,
}: PDFFileSelectProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl);
    const [fileName, setFileName] = useState<string | null>(initialFileName);

    useEffect(() => {
        return () => {
            if (fileUrl && fileUrl.startsWith("blob:")) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (fileUrl && fileUrl.startsWith("blob:")) {
            URL.revokeObjectURL(fileUrl);
        }

        const newUrl = URL.createObjectURL(file);
        setFileUrl(newUrl);
        setFileName(file.name);
        onFileChange?.(file, newUrl);
    }

    return (
        <div className="flex flex-col gap-3 w-full max-w-md">
            <input
                type="file"
                accept="*"
                onChange={handleFileInput}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
            />

            {fileName && <div className="text-sm text-gray-700">Selected: {fileName}</div>}

            {fileUrl ? (
                <div className="flex gap-2">
                    <Button
                        type="button" className="h-8"
                        variant="outline"
                        onClick={() => window.open(fileUrl, "_blank")}
                    >
                        View
                    </Button>

                    <Button asChild className="h-8">
                        <a href={fileUrl} download={fileName}>
                            Download
                        </a>
                    </Button>
                </div>
            ) : (
                <div className="text-sm text-gray-500">No PDF selected</div>
            )}
        </div>
    );
}
