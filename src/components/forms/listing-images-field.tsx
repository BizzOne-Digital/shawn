"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageType } from "@prisma/client";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { deleteUploadedImage, uploadImageFile } from "@/lib/utils/upload-client";
import type { UploadMode } from "@/lib/utils/upload-client";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

export interface ListingImageValue {
  url: string;
  publicId?: string;
  type: ImageType;
  alt?: string;
  sortOrder: number;
}

interface ListingImagesFieldProps {
  images: ListingImageValue[];
  onChange: (images: ListingImageValue[]) => void;
  uploadMode: UploadMode;
  altText?: string;
  disabled?: boolean;
}

export function ListingImagesField({
  images,
  onChange,
  uploadMode,
  altText = "Business image",
  disabled = false,
}: ListingImagesFieldProps) {
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File, type: ImageType) {
    setUploading(true);
    try {
      const previous = images.find((image) => image.type === type && type !== "GALLERY");
      const upload = await uploadImageFile(file, {
        mode: uploadMode,
        folder: "gallery",
      });

      if (previous?.url) {
        await deleteUploadedImage(previous.url, uploadMode);
      }

      const filtered = images.filter((image) => image.type !== type || type === "GALLERY");
      const newImage: ListingImageValue = {
        url: upload.url,
        publicId: upload.filename,
        type,
        alt: altText,
        sortOrder: filtered.length,
      };

      onChange(type === "GALLERY" ? [...filtered, newImage] : [...filtered, newImage]);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(image: ListingImageValue) {
    await deleteUploadedImage(image.url, uploadMode);
    onChange(images.filter((entry) => entry !== image));
    toast.success("Image removed");
  }

  function renderSlot(type: ImageType, label: string, optional = false) {
    const image = images.find((entry) => entry.type === type);
    const inputRef = type === "LOGO" ? logoInputRef : coverInputRef;

    return (
      <div key={type}>
        <Label>
          {label} {optional ? "(optional)" : ""}
        </Label>
        <div className="mt-2 flex items-center gap-4">
          {image ? (
            <div className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                <Image
                  src={resolveImageUrl(image.url)}
                  alt={type}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={image.url.startsWith("/api/uploads/")}
                />
              </div>
              <button
                type="button"
                className="absolute -top-2 -right-2 rounded-full bg-buffalo-red p-1 text-white"
                disabled={disabled || uploading}
                onClick={() => void removeImage(image)}
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-navy",
                (disabled || uploading) && "pointer-events-none opacity-50"
              )}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-muted" />
              ) : (
                <ImageIcon className="size-6 text-muted" />
              )}
              <span className="mt-1 text-xs text-muted">Upload</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file, type);
              event.target.value = "";
            }}
          />
        </div>
      </div>
    );
  }

  const galleryImages = images.filter((image) => image.type === "GALLERY");

  return (
    <div className="space-y-6">
      {renderSlot("LOGO", "Logo")}
      {renderSlot("COVER", "Cover Image", true)}

      <div>
        <Label>Gallery Images</Label>
        <div className="mt-2 flex flex-wrap gap-4">
          {galleryImages.map((image, index) => (
            <div key={`${image.url}-${index}`} className="relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                <Image
                  src={resolveImageUrl(image.url)}
                  alt="Gallery"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={image.url.startsWith("/api/uploads/")}
                />
              </div>
              <button
                type="button"
                className="absolute -top-2 -right-2 rounded-full bg-buffalo-red p-1 text-white"
                disabled={disabled || uploading}
                onClick={() => void removeImage(image)}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => galleryInputRef.current?.click()}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-navy",
              (disabled || uploading) && "pointer-events-none opacity-50"
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin text-muted" />
            ) : (
              <Upload className="size-5 text-muted" />
            )}
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file, "GALLERY");
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
