import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.user.update({
    where: { id },
    data: { passwordHash },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "SET_USER_PASSWORD",
    entity: "User",
    entityId: id,
    metadata: { targetEmail: targetUser.email },
  });

  return NextResponse.json({ success: true });
}
