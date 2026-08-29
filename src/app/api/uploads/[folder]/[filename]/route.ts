import { NextResponse } from "next/server";
import {
  getStoredUpload,
  isUploadFolder,
  sanitizeUploadFilename,
} from "@/lib/services/stored-upload";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ folder: string; filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { folder, filename } = await context.params;

  if (!isUploadFolder(folder) || !sanitizeUploadFilename(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upload = await getStoredUpload(folder, filename);
  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = Buffer.from(upload.data);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(upload.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
