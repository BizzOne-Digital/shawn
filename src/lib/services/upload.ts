export interface UploadResult {
  url: string;
  publicId?: string;
}

export interface UploadAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(mimeType: string, size: number): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 5MB" };
  }
  return { valid: true };
}

class CloudinaryAdapter implements UploadAdapter {
  async upload(file: Buffer, filename: string): Promise<UploadResult> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary not configured");
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "letsgobuffalo";

    const crypto = await import("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(file)]), filename);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  async delete(publicId: string): Promise<void> {
    // Cloudinary delete would require signed API call
    console.log(`[Cloudinary] Would delete: ${publicId}`);
  }
}

class DevFallbackAdapter implements UploadAdapter {
  async upload(file: Buffer, filename: string): Promise<UploadResult> {
    const base64 = file.toString("base64");
    const ext = filename.split(".").pop() ?? "jpg";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const mime = mimeMap[ext] ?? "image/jpeg";
    const url = `data:${mime};base64,${base64}`;
    const publicId = `dev-${Date.now()}-${filename}`;

    console.log(`[DevUpload] Stored ${filename} as data URL (${file.length} bytes)`);
    return { url, publicId };
  }

  async delete(publicId: string): Promise<void> {
    console.log(`[DevUpload] Would delete: ${publicId}`);
  }
}

export function getUploadAdapter(): UploadAdapter {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return new CloudinaryAdapter();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
  return new DevFallbackAdapter();
}
