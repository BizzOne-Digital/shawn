import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-utils";
import { leadSchema } from "@/lib/validations/business";
import { sendLeadNotification } from "@/lib/services/email";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    let businessName: string | undefined;
    if (data.businessId) {
      const business = await db.business.findFirst({
        where: { id: data.businessId, status: "PUBLISHED", ...NOT_DELETED },
        select: { name: true, publicEmail: true },
      });
      if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }
      businessName = business.name;
    }

    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
        businessId: data.businessId,
        consent: data.consent,
      },
    });

    await sendLeadNotification(
      { name: data.name, email: data.email, message: data.message },
      businessName
    );

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
