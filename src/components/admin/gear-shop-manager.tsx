"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GearShopProduct } from "@/lib/gear-shop";

function newProduct(): GearShopProduct {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    image: "",
    priceLabel: "",
    stripePaymentLink: "",
    sortOrder: 0,
  };
}

export function GearShopManager({ initialProducts }: { initialProducts: GearShopProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gear-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setProducts(data.products ?? products);
      toast.success("Gear shop saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Gear shop products (unlimited)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted">
          Add as many items as you like. Paste a Stripe Payment Link URL for each product so visitors can
          buy directly. Leave the Stripe link empty to hide the Buy button.
        </p>
        {products.map((product, index) => (
          <div key={product.id} className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy">Item {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setProducts((prev) => prev.filter((p) => p.id !== product.id))}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={product.name}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) => (p.id === product.id ? { ...p, name: e.target.value } : p))
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Price label</Label>
                <Input
                  value={product.priceLabel}
                  placeholder="$24.99"
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id ? { ...p, priceLabel: e.target.value } : p
                      )
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={product.description}
                rows={2}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === product.id ? { ...p, description: e.target.value } : p
                    )
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={product.image}
                placeholder="/uploads/products/hat.png or https://..."
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) => (p.id === product.id ? { ...p, image: e.target.value } : p))
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Stripe payment link</Label>
              <Input
                value={product.stripePaymentLink}
                placeholder="https://buy.stripe.com/..."
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === product.id ? { ...p, stripePaymentLink: e.target.value } : p
                    )
                  )
                }
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setProducts((prev) => [...prev, newProduct()])}>
            <Plus className="size-4" />
            Add product
          </Button>
          <Button type="button" variant="accent" disabled={saving} onClick={() => void save()}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save gear shop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
