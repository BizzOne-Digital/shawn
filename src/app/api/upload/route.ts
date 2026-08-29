import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-utils";
import { handleApiError } from "@/lib/api-utils";
import {
  deleteStoredUploadByUrl,
  generateUploadFilename,
  isUploadFolder,
  saveStoredUpload,
  validateAdminImageFile,
} from "@/lib/services/stored-upload";

export const runtime = "nodejs";

const deleteSchema = z.object({
  url: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (typeof folderValue !== "string" || !isUploadFolder(folderValue)) {
      return NextResponse.json(
        { error: "Invalid folder. Allowed: products, gallery, pages, misc" },
        { status: 400 }
      );
    }

    const validation = validateAdminImageFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const filename = generateUploadFilename(file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await saveStoredUpload({
      folder: folderValue,
      filename,
      mimeType: file.type,
      size: file.size,
      data: buffer,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!parsed.data.url.startsWith("/api/uploads/")) {
      return NextResponse.json({ success: true, deleted: false });
    }

    const deleted = await deleteStoredUploadByUrl(parsed.data.url);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return handleApiError(error);
  }
}
