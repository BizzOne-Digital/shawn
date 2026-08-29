import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  UPLOAD_FOLDERS,
  type UploadFolder,
  isUploadFolder,
} from "@/lib/types/upload-folders";

export { UPLOAD_FOLDERS, type UploadFolder, isUploadFolder };

export const MAX_ADMIN_UPLOAD_SIZE = 8 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MIME_TO_EXT: Record<(typeof ALLOWED_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateAdminImageFile(
  mimeType: string,
  size: number
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
    };
  }
  if (size > MAX_ADMIN_UPLOAD_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 8MB" };
  }
  return { valid: true };
}

export function getExtensionFromMime(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType as keyof typeof MIME_TO_EXT] ?? null;
}

export function generateUploadFilename(mimeType: string): string {
  const ext = getExtensionFromMime(mimeType);
  if (!ext) {
    throw new Error("Unsupported mime type");
  }
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
}

export function buildStoredUploadUrl(folder: string, filename: string): string {
  return `/api/uploads/${folder}/${filename}`;
}

export function parseStoredUploadUrl(
  url: string
): { folder: string; filename: string } | null {
  const match = url.match(/^\/api\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { folder: match[1], filename: match[2] };
}

export function isStoredUploadUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/api/uploads/"));
}

export function sanitizeUploadFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

export async function saveStoredUpload(params: {
  folder: UploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
}) {
  await db.storedUpload.create({
    data: {
      folder: params.folder,
      filename: params.filename,
      mimeType: params.mimeType,
      size: params.size,
      data: new Uint8Array(params.data),
    },
  });

  return {
    success: true as const,
    url: buildStoredUploadUrl(params.folder, params.filename),
    filename: params.filename,
    size: params.size,
    folder: params.folder,
  };
}

export async function getStoredUpload(folder: string, filename: string) {
  return db.storedUpload.findUnique({
    where: {
      folder_filename: { folder, filename },
    },
  });
}

export async function deleteStoredUploadByUrl(url: string): Promise<boolean> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed || !isUploadFolder(parsed.folder)) return false;
  if (!sanitizeUploadFilename(parsed.filename)) return false;

  const result = await db.storedUpload.deleteMany({
    where: {
      folder: parsed.folder,
      filename: parsed.filename,
    },
  });

  return result.count > 0;
}
