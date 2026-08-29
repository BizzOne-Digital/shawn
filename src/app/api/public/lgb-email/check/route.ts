import { NextResponse } from "next/server";
import { z } from "zod";
import { checkLgbEmailLocalPart } from "@/lib/services/lgb-email-availability";
import { handleApiError } from "@/lib/api-utils";

const querySchema = z.object({
  localPart: z.string().min(1).max(64),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      localPart: searchParams.get("localPart") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email name" }, { status: 400 });
    }

    const result = await checkLgbEmailLocalPart(parsed.data.localPart);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
