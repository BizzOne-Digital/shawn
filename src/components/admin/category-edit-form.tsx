"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalImageField } from "@/components/admin/local-image-field";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryEditFormProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
    seoTitle: string;
    seoDescription: string;
  };
  subcategories: Subcategory[];
}

export function CategoryEditForm({ category, subcategories: initialSubs }: CategoryEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(category);
  const [subcategories, setSubcategories] = useState(initialSubs);
  const [newSub, setNewSub] = useState({ name: "", slug: "" });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subcategories }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      toast.success("Category updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this category? Businesses will be unassigned.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      toast.success("Category deleted");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  function addSubcategory() {
    if (!newSub.name.trim()) return;
    setSubcategories([
      ...subcategories,
      {
        id: `new-${Date.now()}`,
        name: newSub.name,
        slug: newSub.slug || newSub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sortOrder: subcategories.length,
        isActive: true,
      },
    ]);
    setNewSub({ name: "", slug: "" });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Category Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" required />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Icon</Label>
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1" placeholder="e.g. utensils" />
          </div>
          <div className="sm:col-span-2">
            <LocalImageField
              label="Category image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              folder="gallery"
            />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="mt-1" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            <Label>Active</Label>
          </div>
          <div>
            <Label>SEO Title</Label>
            <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>SEO Description</Label>
            <Textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Subcategories</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {subcategories.map((sub, i) => (
            <div key={sub.id} className="flex gap-3 items-center">
              <Input
                value={sub.name}
                onChange={(e) => {
                  const updated = [...subcategories];
                  updated[i] = {
                    ...sub,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  };
                  setSubcategories(updated);
                }}
                className="flex-1"
              />
              <Switch
                checked={sub.isActive}
                onCheckedChange={(v) => {
                  const updated = [...subcategories];
                  updated[i] = { ...sub, isActive: v };
                  setSubcategories(updated);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSubcategories(subcategories.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${sub.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-3">
            <Input
              placeholder="New subcategory name"
              value={newSub.name}
              onChange={(e) => setNewSub({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addSubcategory}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Save Changes
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
          <Trash2 />
          Delete Category
        </Button>
      </div>
    </form>
  );
}
