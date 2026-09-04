import { NextResponse } from "next/server";
import { LeadSource } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/api-utils";

const newsletterSchema = z.object({
  subscribed: z.boolean(),
});

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) return result.error;
  const user = result.user;

  const lead = await db.lead.findFirst({
    where: { email: user!.email!, source: LeadSource.NEWSLETTER },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscribed: Boolean(lead) });
}

export async function PUT(request: Request) {
  const result = await requireSessionUser();
  if ("error" in result) return result.error;
  const user = result.user;

  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = user!.email!;
  const existing = await db.lead.findFirst({
    where: { email, source: LeadSource.NEWSLETTER },
    orderBy: { createdAt: "desc" },
  });

  if (parsed.data.subscribed) {
    if (!existing) {
      await db.lead.create({
        data: {
          name: user!.name ?? "Member",
          email,
          message: "Newsletter signup from account settings",
          source: LeadSource.NEWSLETTER,
          consent: true,
        },
      });
    }
    return NextResponse.json({ subscribed: true });
  }

  if (existing) {
    await db.lead.delete({ where: { id: existing.id } });
  }

  return NextResponse.json({ subscribed: false });
}
