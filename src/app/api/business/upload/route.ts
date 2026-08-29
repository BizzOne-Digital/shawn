import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser, handleApiError } from "@/lib/api-utils";
import {
  deleteStoredUploadByUrl,
  generateUploadFilename,
  saveStoredUpload,
  validateAdminImageFile,
} from "@/lib/services/stored-upload";

export const runtime = "nodejs";

const deleteSchema = z.object({
  url: z.string().min(1),
});

/** Business-owner listing image upload — stored in MongoDB (gallery folder). */
export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateAdminImageFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const filename = generateUploadFilename(file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await saveStoredUpload({
      folder: "gallery",
      filename,
      mimeType: file.type,
      size: file.size,
      data: buffer,
    });

    return NextResponse.json(upload);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!parsed.data.url.startsWith("/api/uploads/gallery/")) {
      return NextResponse.json({ success: true, deleted: false });
    }

    const deleted = await deleteStoredUploadByUrl(parsed.data.url);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return handleApiError(error);
  }
}
