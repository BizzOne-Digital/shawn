"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadImageFile } from "@/lib/utils/upload-client";
import { resolveImageUrl } from "@/lib/utils/image-url";

interface SellerProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  purchaseUrl: string;
}

interface SellerProductsManagerProps {
  businessId: string;
  businessName: string;
}

export function SellerProductsManager({ businessId, businessName }: SellerProductsManagerProps) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/seller-products`);
      if (!res.ok) throw new Error("Failed to load products");
      setProducts(await res.json());
    } catch {
      toast.error("Unable to load seller products");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/businesses/${businessId}/seller-products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) toast.error("Unable to load seller products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  async function handleUpload(file: File) {
    setSaving(true);
    try {
      const upload = await uploadImageFile(file, { mode: "business", folder: "gallery" });
      setImageUrl(upload.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !purchaseUrl.trim() || !imageUrl) {
      toast.error("Product name, image, and link are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/seller-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, purchaseUrl, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add product");
      setName("");
      setPurchaseUrl("");
      setImageUrl("");
      await loadProducts();
      toast.success("Product added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(productId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/seller-products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove product");
      await loadProducts();
      toast.success("Product removed");
    } catch {
      toast.error("Failed to remove product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{businessName} — Seller Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={addProduct} className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm text-muted">
            Add up to 10 product images. Each opens its link in a new tab on your public listing.
          </p>
          <div>
            <Label htmlFor={`product-name-${businessId}`}>Product name</Label>
            <Input
              id={`product-name-${businessId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Product name"
            />
          </div>
          <div>
            <Label htmlFor={`product-url-${businessId}`}>Product link URL</Label>
            <Input
              id={`product-url-${businessId}`}
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              className="mt-1"
              placeholder="https://yourstore.com/product"
            />
          </div>
          <div>
            <Label>Product image</Label>
            <div className="mt-2 flex items-center gap-4">
              {imageUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={resolveImageUrl(imageUrl)}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={imageUrl.startsWith("/api/uploads/")}
                  />
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => fileInputRef.current?.click()}
              >
                {saving ? <Loader2 className="animate-spin" /> : "Upload image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleUpload(file);
                  event.target.value = "";
                }}
              />
            </div>
          </div>
          <Button type="submit" variant="accent" disabled={saving || products.length >= 10}>
            {saving ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
            Add Product
          </Button>
        </form>

        {loading ? (
          <p className="text-sm text-muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted">No products yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border border-border p-4">
                {product.imageUrl && (
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-lg border border-border">
                    <Image
                      src={resolveImageUrl(product.imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized={product.imageUrl.startsWith("/api/uploads/")}
                    />
                  </div>
                )}
                <p className="font-medium text-navy">{product.name}</p>
                <a
                  href={product.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-buffalo-red hover:underline"
                >
                  View product link
                  <ExternalLink className="size-3" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={saving}
                  onClick={() => void removeProduct(product.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
