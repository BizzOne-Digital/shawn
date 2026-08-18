import type { Metadata } from "next";
import Image from "next/image";
import { GearOrderForm } from "@/components/forms/gear-order-form";
import { gearProducts } from "@/lib/content/gear-products";

export const metadata: Metadata = {
  title: "Gear Shop",
  description: "Official Let's Go Buffalo gear — hats, shirts, hoodies, and more.",
};

export default function GearPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-navy">Let&apos;s Go Buffalo Gear</h1>
          <p className="mt-4 text-lg text-muted">
            Rep the 716 with official Let&apos;s Go Buffalo merchandise. Submit an order inquiry and we&apos;ll email you to complete checkout.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gearProducts.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex h-36 items-center justify-center rounded-xl bg-soft-gray p-4">
                <Image
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
