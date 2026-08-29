import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  ad_minimum_daily_bid: z.number().min(0).optional(),
  ad_max_positions: z.number().min(1).max(10).optional(),
  ad_approval_required: z.boolean().optional(),
  require_re_review: z.boolean().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
});

const settingKeys = [
  "ad_minimum_daily_bid",
  "ad_max_positions",
  "ad_approval_required",
  "require_re_review",
  "contact_email",
  "contact_phone",
] as const;

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const settings = await db.siteSetting.findMany({
    where: { key: { in: [...settingKeys] } },
  });

  const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const updates = parsed.data;

  await db.$transaction(
    Object.entries(updates).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value: value as never },
        update: { value: value as never },
      })
    )
  );

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_SETTINGS",
    entity: "SiteSetting",
    metadata: updates,
  });

  return NextResponse.json({ success: true });
}
