import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { z } from "zod";
import slugify from "slugify";

const createBusinessSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  suggestedCategory: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default("NY"),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  publicEmail: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  services: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  locationId: z.string().optional(),
});

export async function GET() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      category: { select: { name: true } },
      images: { where: { type: "LOGO" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(request: Request) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const data = createBusinessSchema.parse(body);

    let slug = slugify(data.name, { lower: true, strict: true });
    const existing = await db.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const business = await db.business.create({
      data: {
        ...data,
        slug,
        ownerId: user.id,
        status: "DRAFT",
        publicEmail: data.publicEmail || undefined,
        website: data.website || undefined,
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }
}
