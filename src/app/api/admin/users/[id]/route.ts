import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import {requireAdminApi, recordAuditLog, requireFullAdminApi } from "@/lib/admin-utils";

const schema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireFullAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (id === user!.id && parsed.data.role && parsed.data.role !== user!.role) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  if (id === user!.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await db.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_USER",
    entity: "User",
    entityId: id,
    metadata: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireFullAdminApi();
  if (error) return error;

  const { id } = await params;
  if (id === user!.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "DELETE_USER",
    entity: "User",
    entityId: id,
    metadata: { email: targetUser.email },
  });

  return NextResponse.json({ success: true });
}
