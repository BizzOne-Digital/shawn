import type { UploadFolder } from "@/lib/types/upload-folders";

export type UploadMode = "admin" | "business";

export interface UploadImageResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  folder: string;
}

export async function uploadImageFile(
  file: File,
  options: { mode: UploadMode; folder?: UploadFolder }
): Promise<UploadImageResult> {
  const endpoint = options.mode === "admin" ? "/api/upload" : "/api/business/upload";
  const formData = new FormData();
  formData.append("file", file);
  if (options.mode === "admin") {
    formData.append("folder", options.folder ?? "misc");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error ?? "Upload failed");
  }

  if (typeof json.url !== "string" || !json.url) {
    throw new Error("Upload failed");
  }

  return json as UploadImageResult;
}

export async function deleteUploadedImage(url: string, mode: UploadMode): Promise<void> {
  if (!url.startsWith("/api/uploads/")) return;

  const endpoint = mode === "admin" ? "/api/upload" : "/api/business/upload";
  await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}
