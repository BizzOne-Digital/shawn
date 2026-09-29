import { NextResponse } from "next/server";
import { z } from "zod";
import { requireFullAdminApi, recordAuditLog } from "@/lib/admin-utils";
import { getGearShopProducts, saveGearShopProducts } from "@/lib/gear-shop";

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  image: z.string().max(2000).optional().default(""),
  priceLabel: z.string().max(100).optional().default(""),
  stripePaymentLink: z.string().max(2000).optional().default(""),
  sortOrder: z.number().int().optional(),
});

const saveSchema = z.object({
  products: z.array(productSchema),
});

export async function GET() {
  const auth = await requireFullAdminApi();
  if (auth.error) return auth.error;
  const products = await getGearShopProducts();
  return NextResponse.json({ products });
}

export async function PUT(request: Request) {
  const auth = await requireFullAdminApi();
  if (auth.error) return auth.error;

  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const products = await saveGearShopProducts(
    parsed.data.products.map((p, index) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image: p.image ?? "",
      priceLabel: p.priceLabel ?? "",
      stripePaymentLink: p.stripePaymentLink ?? "",
      sortOrder: p.sortOrder ?? index,
    }))
  );

  await recordAuditLog({
    userId: auth.user!.id,
    action: "UPDATE_GEAR_SHOP",
    entity: "SiteSetting",
    metadata: { count: products.length },
  });

  return NextResponse.json({ products });
}
