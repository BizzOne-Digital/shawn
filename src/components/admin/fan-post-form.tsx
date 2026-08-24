"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FanPostFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    authorName: string;
    isPublished: boolean;
  };
}

export function FanPostForm({ initialData }: FanPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    body: initialData?.body ?? "",
    authorName: initialData?.authorName ?? "Let's Go Buffalo Team",
    isPublished: initialData?.isPublished ?? true,
  });

  function updateSlugFromTitle(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((prev) => ({ ...prev, title, slug: initialData ? prev.slug : slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData ? `/api/admin/fan-posts/${initialData.id}` : "/api/admin/fan-posts";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save post");

      toast.success(initialData ? "Post updated" : "Post created");
      router.push(`/admin/fan-page/${data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Fan Page Post" : "New Fan Page Post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateSlugFromTitle(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="authorName">Author name</Label>
            <Input
              id="authorName"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Short excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="body">Post body</Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="mt-1 min-h-48"
              required
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-navy">Published</p>
              <p className="text-sm text-muted">Show this post on the public fan page</p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) => setForm({ ...form, isPublished: checked })}
            />
          </div>
          <Button type="submit" variant="accent" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {initialData ? "Save Changes" : "Create Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
