import { db } from "@/lib/db";

export const GEAR_SHOP_SETTING_KEY = "gear_shop_products";

export type GearShopProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  priceLabel: string;
  stripePaymentLink: string;
  sortOrder: number;
};

function normalizeProduct(raw: unknown, index: number): GearShopProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const name = typeof p.name === "string" ? p.name.trim() : "";
  if (!name) return null;
  return {
    id: typeof p.id === "string" ? p.id : `gear-${index}`,
    name,
    description: typeof p.description === "string" ? p.description : "",
    image: typeof p.image === "string" ? p.image : "",
    priceLabel: typeof p.priceLabel === "string" ? p.priceLabel : "",
    stripePaymentLink: typeof p.stripePaymentLink === "string" ? p.stripePaymentLink : "",
    sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : index,
  };
}

export async function getGearShopProducts(): Promise<GearShopProduct[]> {
  const setting = await db.siteSetting.findUnique({ where: { key: GEAR_SHOP_SETTING_KEY } });
  if (!setting?.value || !Array.isArray(setting.value)) return [];
  return setting.value
    .map((item, index) => normalizeProduct(item, index))
    .filter((p): p is GearShopProduct => p !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveGearShopProducts(products: GearShopProduct[]): Promise<GearShopProduct[]> {
  const sanitized = products
    .map((p, index) => ({
      ...p,
      name: p.name.trim(),
      sortOrder: index,
    }))
    .filter((p) => p.name.length > 0);

  await db.siteSetting.upsert({
    where: { key: GEAR_SHOP_SETTING_KEY },
    create: { key: GEAR_SHOP_SETTING_KEY, value: sanitized },
    update: { value: sanitized },
  });

  return sanitized;
}
