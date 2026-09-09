import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";
import { saveReservedLgbEmailLocalParts } from "@/lib/services/lgb-email-reserved";

const schema = z.object({
  localParts: z.array(z.string().min(1).max(64)),
});

export async function PUT(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const localParts = await saveReservedLgbEmailLocalParts(parsed.data.localParts);

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_RESERVED_EMAILS",
    entity: "SiteSetting",
    metadata: { count: localParts.length },
  });

  return NextResponse.json({ localParts });
}
