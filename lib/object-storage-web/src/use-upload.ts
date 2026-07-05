import { useCallback, useState } from "react";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

export interface UploadResponse {
  url: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  /** Base path where storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for handling file uploads.
 *
 * Single-step upload: the file is sent as multipart/form-data directly to the
 * backend, which streams it to Cloudinary and returns the public CDN URL.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress(40);
        const response = await fetch(`${basePath}/uploads`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Gagal mengunggah gambar");
        }

        const uploadResponse: UploadResponse = await response.json();

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [basePath, options],
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}
