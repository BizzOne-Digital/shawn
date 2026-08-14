import { NextResponse } from "next/server";
import { requireSessionUser, handleApiError } from "@/lib/api-utils";
import { getUploadAdapter, validateImageFile } from "@/lib/services/upload";

export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateImageFile(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const adapter = getUploadAdapter();
    const upload = await adapter.upload(buffer, file.name, file.type);

    return NextResponse.json(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
