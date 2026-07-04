import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useUpload, type UploadResponse } from "./use-upload";

interface ImageDropzoneProps {
  /** Current image URL to preview (e.g. the field's existing value). */
  value?: string;
  /** Called with the servable URL after a successful upload. */
  onUploaded: (servingUrl: string, response: UploadResponse) => void;
  /** Base path where object storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  /** Extra class names for the outer container. */
  className?: string;
  /** Height class for the dropzone/preview (default: "h-44"). */
  heightClassName?: string;
  /** Placeholder label shown when empty. */
  label?: string;
  /** Called when the user clears the current image. */
  onClear?: () => void;
}

/**
 * Drag-and-drop image uploader. Uploads directly to object storage via a
 * presigned URL and reports back the servable URL (mount path + objectPath).
 */
export function ImageDropzone({
  value,
  onUploaded,
  basePath = "/api/storage",
  className = "",
  heightClassName = "h-44",
  label = "Seret & lepas gambar di sini, atau klik untuk memilih",
  onClear,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error } = useUpload({
    basePath,
    onSuccess: (response) => {
      onUploaded(`${basePath}${response.objectPath}`, response);
    },
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      void uploadFile(file);
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles],
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative w-full ${heightClassName} rounded-lg border-2 border-dashed transition-colors cursor-pointer overflow-hidden flex items-center justify-center ${
          isDragging
            ? "border-teal-500 bg-teal-50"
            : value
              ? "border-transparent"
              : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-xs font-medium px-3 py-1.5 rounded-md bg-black/50">
                Klik atau seret untuk mengganti
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center pointer-events-none">
            <svg
              className="w-7 h-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">{progress}%</span>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}

      {value && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="text-xs text-slate-400 hover:text-red-500 mt-1.5 transition-colors"
        >
          Hapus gambar
        </button>
      )}
    </div>
  );
}
