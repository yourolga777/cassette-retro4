"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

export function ImageUpload({ label, value, onChange, required }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка загрузки");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
        {label} {required && "*"}
      </label>

      {value && (
        <div className="mb-2 tape-box overflow-hidden w-40 h-40">
          <img src={value} alt="" className="object-cover w-full h-full" />
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          ref={inputRef}
          className="text-sm font-mono text-wood/70 file:mr-2 file:py-1 file:px-3 file:border-0 file:bg-wood/10 file:text-wood file:font-mono file:text-xs file:cursor-pointer"
          disabled={uploading}
        />
        {uploading && <span className="font-mono text-xs text-copper animate-pulse">Загрузка...</span>}
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
            className="font-mono text-xs text-neon hover:underline"
          >
            Удалить
          </button>
        )}
      </div>

      {error && <p className="font-mono text-xs text-neon mt-1">{error}</p>}
    </div>
  );
}
