"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UploadFolder } from "@/lib/types/upload-folders";
import { deleteUploadedImage, uploadImageFile } from "@/lib/utils/upload-client";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

interface LocalImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  disabled?: boolean;
  className?: string;
}

export function LocalImageField({
  label,
  value,
  onChange,
  folder,
  disabled = false,
  className,
}: LocalImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(file: File | null) {
    if (!file || disabled) return;

    setUploading(true);
    const previousUrl = value;

    try {
      const upload = await uploadImageFile(file, { mode: "admin", folder });

      if (previousUrl && previousUrl !== upload.url) {
        await deleteUploadedImage(previousUrl, "admin");
      }

      onChange(upload.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleRemove() {
    if (!value || disabled) return;
    await deleteUploadedImage(value, "admin");
    onChange("");
    toast.success("Image removed");
  }

  const previewSrc = value ? resolveImageUrl(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void handleFileSelect(file);
        }}
      />

      {previewSrc ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-border bg-soft-gray">
            <Image
              src={previewSrc}
              alt={label}
              fill
              className="object-cover"
              sizes="112px"
              unoptimized={previewSrc.startsWith("/api/uploads/")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => void handleRemove()}
            >
              <X className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-soft-gray/50 text-muted transition-colors",
            !disabled && !uploading && "hover:border-buffalo-red/40 hover:bg-soft-gray",
            (disabled || uploading) && "cursor-not-allowed opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImageIcon className="size-6" />
          )}
          <span className="text-sm">{uploading ? "Uploading…" : "Choose image"}</span>
        </button>
      )}
    </div>
  );
}
