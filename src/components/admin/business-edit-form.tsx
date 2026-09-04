"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessListingTier, ListingStatus } from "@prisma/client";
import { ListingImagesField, type ListingImageValue } from "@/components/forms/listing-images-field";

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface BusinessFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: ListingStatus;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  publicEmail: string;
  website: string;
  isVerified: boolean;
  isFeatured: boolean;
  categoryId: string;
  subcategoryId: string;
  listingTier: BusinessListingTier;
}

interface BusinessEditFormProps {
  business: BusinessFormData;
  businessId?: string;
  categories: Category[];
  action: "update" | "create";
  initialImages?: ListingImageValue[];
}

export function BusinessEditForm({
  business,
  businessId,
  categories,
  action,
  initialImages = [],
}: BusinessEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(business);
  const [images, setImages] = useState<ListingImageValue[]>(initialImages);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  function updateField<K extends keyof BusinessFormData>(key: K, value: BusinessFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = action === "create"
        ? "/api/admin/businesses"
        : `/api/admin/businesses/${businessId}`;
      const method = action === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const data = await res.json();
      toast.success(action === "create" ? "Business created" : "Business updated");
      router.push(`/admin/businesses/${data.id ?? businessId}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v as ListingStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["DRAFT", "PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "REJECTED", "SUSPENDED", "ARCHIVED"] as ListingStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="listingTier">Listing Tier</Label>
            <Select
              value={form.listingTier}
              onValueChange={(v) => updateField("listingTier", v as BusinessListingTier)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE_BASIC">Free Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-1"
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input id="zipCode" value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="publicEmail">Public Email</Label>
            <Input id="publicEmail" type="email" value={form.publicEmail} onChange={(e) => updateField("publicEmail", e.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={form.website} onChange={(e) => updateField("website", e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category & Flags</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => { updateField("categoryId", v); updateField("subcategoryId", ""); }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div>
              <Label>Subcategory</Label>
              <Select value={form.subcategoryId} onValueChange={(v) => updateField("subcategoryId", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={form.isVerified} onCheckedChange={(v) => updateField("isVerified", v)} />
            <Label>Verified Business</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.isFeatured} onCheckedChange={(v) => updateField("isFeatured", v)} />
            <Label>Featured Listing</Label>
          </div>
        </CardContent>
      </Card>

      {action === "update" && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ListingImagesField
              images={images}
              onChange={setImages}
              uploadMode="admin"
              altText={form.name || "Business image"}
            />
          </CardContent>
        </Card>
      )}

      <Button type="submit" variant="accent" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Save />}
        {action === "create" ? "Create Business" : "Save Changes"}
      </Button>
    </form>
  );
}
