"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { X, Upload } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BASE_URL } from "@/utils/api";

interface ImageUploadProps {
    initialImages?: string[];
    onUploadComplete?: (urls: string[]) => void;
    onRemoved?: (url: string) => void;
    id?: string;
    folder: string;
    pathUrl?: string;
}


export function MultipleImageUpload({
    initialImages = [],
    onUploadComplete,
    onRemoved,
    id,
    folder,
    pathUrl = "",
}: ImageUploadProps) {


    const inputId = id || `fileInput-${Math.random()}`;

    const [imageUrls, setImageUrls] = useState<string[]>(initialImages);

    const [progress, setProgress] = useState<number | null>(null);

    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);


    const cancelRef = useRef<any>(null);


    useEffect(() => {
        setImageUrls(initialImages);
    }, [initialImages]);



    const waitForUser = (): Promise<any> =>
        new Promise((resolve, reject) => {

            const auth = getAuth();

            if (auth.currentUser)
                return resolve(auth.currentUser);


            const unsub = onAuthStateChanged(auth, (user) => {

                unsub();

                if (user)
                    resolve(user);
                else
                    reject("Not logged");

            });

        });



    const uploadFile = async (
        file: File,
        token: string,
        index: number,
        total: number
    ) => {


        const { data } = await axios.post(
            `${BASE_URL}/api/files/upload`,
            {
                fileName: file.name,
                fileType: file.type,
                folder
            },
            {
                headers: {
                    Authorization: token
                }
            }
        );


        const { uploadUrl, key } = data;


        await axios.put(
            uploadUrl,
            file,
            {
                headers: {
                    "Content-Type": file.type
                },

                onUploadProgress: (e) => {


                    const filePercent =
                        Math.round(
                            (e.loaded * 100) /
                            (e.total || 1)
                        );


                    const totalPercent =
                        Math.round(
                            ((index + filePercent / 100) / total) * 100
                        );


                    setProgress(totalPercent);

                }

            }
        );


        return key;

    }




    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {


        const files = Array.from(
            e.target.files || []
        );


        if (!files.length)
            return;


        e.target.value = "";


        try {


            setUploading(true);
            setProgress(0);
            setError(null);


            const user = await waitForUser();

            const token =
                await user.getIdToken();



            const uploaded = await Promise.all(

                files.map(
                    (file, index) =>
                        uploadFile(
                            file,
                            token,
                            index,
                            files.length
                        )
                )

            );



            const updated = [
                ...imageUrls,
                ...uploaded
            ];


            setImageUrls(updated);


            onUploadComplete?.(updated);



            setUploading(false);
            setProgress(null);



        } catch (err) {

            console.log(err);

            setError(
                "Upload failed"
            );

            setUploading(false);
            setProgress(null);

        }


    }



    const removeImage = (url: string) => {


        const updated =
            imageUrls.filter(
                img => img !== url
            );


        setImageUrls(updated);

        onUploadComplete?.(updated);

        onRemoved?.(url);

    }



    return (

        <div className="space-y-4">


            <div className="flex flex-wrap gap-4">


                {
                    imageUrls.map((url) => (


                        <div
                            key={url}
                            className="relative w-[150px] h-[150px]"
                        >


                            <img

                                src={`${pathUrl}/${url}`}

                                className="w-full h-full object-cover rounded-md border"

                            />


                            <button

                                type="button"

                                onClick={() =>
                                    removeImage(url)
                                }

                                className="
                        absolute top-1 right-1
                        bg-white/80
                        rounded-full p-1
                        "

                            >

                                <X className="h-4 w-4" />

                            </button>


                        </div>


                    ))
                }


            </div>




            <label

                htmlFor={inputId}

                className="
            flex flex-col items-center
            justify-center
            w-40 h-40
            border-2 border-dashed
            rounded-md cursor-pointer
            "

            >


                <Upload className="h-8 w-8" />


                <span>
                    Upload Images
                </span>


                <input

                    id={inputId}

                    type="file"

                    multiple

                    accept="image/*"

                    onChange={handleFileChange}

                    className="hidden"

                />


            </label>




            {
                uploading &&

                <div className="w-60">

                    <Progress value={progress || 0} />

                    <span>
                        {progress}%
                    </span>

                </div>

            }



            {
                error &&

                <p className="text-red-500">
                    {error}
                </p>

            }


        </div>

    );

}