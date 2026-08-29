import type { Metadata } from "next";
import { GearOrderForm } from "@/components/forms/gear-order-form";
import { CmsImage } from "@/components/ui/cms-image";
import { getPageContent, txt } from "@/lib/content/page-content";
import { resolveImageUrl } from "@/lib/utils/image-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gear Shop",
  description: "Official Let's Go Buffalo gear — hats, shirts, hoodies, and more.",
};

export default async function GearPage() {
  const content = await getPageContent("gear");

  const products = [0, 1, 2, 3].map((index) => ({
    id: `product-${index}`,
    name: txt(content, `products.item_${index}.name`),
    description: txt(content, `products.item_${index}.description`),
    price: parseFloat(txt(content, `products.item_${index}.price`) || "0"),
    image: resolveImageUrl(txt(content, `products.item_${index}.image`)),
  }));

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-navy">{txt(content, "hero.title")}</h1>
          <p className="mt-4 text-lg text-muted">{txt(content, "hero.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-3 font-display text-xl font-bold text-buffalo-red">
                ${product.price.toFixed(2)}
              </p>
              <GearOrderForm productName={product.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
