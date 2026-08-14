import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSessionUser, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const body = await request.json();
    const data = settingsSchema.parse(body);

    const user = await db.user.update({
      where: { id: result.user.id },
      data: {
        name: data.name,
        phone: data.phone || null,
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, phone: user.phone });
  } catch (error) {
    return handleApiError(error);
  }
}
