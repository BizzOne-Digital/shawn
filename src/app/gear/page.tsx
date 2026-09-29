import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GearOrderForm } from "@/components/forms/gear-order-form";
import { CmsImage } from "@/components/ui/cms-image";
import { Button } from "@/components/ui/button";
import { getPageContent, txt } from "@/lib/content/page-content";
import { getGearShopProducts } from "@/lib/gear-shop";
import { resolveImageUrl } from "@/lib/utils/image-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gear Shop",
  description: "Official Let's Go Buffalo gear — hats, shirts, hoodies, and more.",
};

export default async function GearPage() {
  const [content, managedProducts] = await Promise.all([
    getPageContent("gear"),
    getGearShopProducts(),
  ]);

  const cmsProducts = [0, 1, 2, 3]
    .map((index) => ({
      id: `cms-${index}`,
      name: txt(content, `products.item_${index}.name`),
      description: txt(content, `products.item_${index}.description`),
      image: resolveImageUrl(txt(content, `products.item_${index}.image`)),
      priceLabel: txt(content, `products.item_${index}.price`),
      stripePaymentLink: "",
    }))
    .filter((product) => product.name.trim().length > 0);

  const products =
    managedProducts.length > 0
      ? managedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: resolveImageUrl(p.image),
          priceLabel: p.priceLabel,
          stripePaymentLink: p.stripePaymentLink,
        }))
      : cmsProducts;

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-navy">{txt(content, "hero.title")}</h1>
          <p className="mt-4 text-lg text-muted">{txt(content, "hero.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.length === 0 ? (
            <p className="text-muted col-span-full">
              No gear items yet. Add products in Admin → Page Content → Gear Shop.
            </p>
          ) : null}
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex h-36 items-center justify-center rounded-xl bg-soft-gray p-4">
                <CmsImage
                  src={product.image}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <h2 className="mt-4 font-semibold text-navy">{product.name}</h2>
              <p className="mt-1 text-sm text-muted">{product.description}</p>
              {product.priceLabel ? (
                <p className="mt-3 font-display text-lg font-semibold text-buffalo-red">
                  {product.priceLabel.startsWith("$") ? product.priceLabel : `$${product.priceLabel}`}
                </p>
              ) : null}
              {product.stripePaymentLink ? (
                <Button variant="accent" className="mt-4 w-full" asChild>
                  <a href={product.stripePaymentLink} target="_blank" rel="noopener noreferrer">
                    Buy now
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : (
                <>
                  <p className="mt-3 text-sm text-muted">Order inquiry</p>
                  <GearOrderForm productName={product.name} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
