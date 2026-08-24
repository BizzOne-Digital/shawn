"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { CmsPage } from "@/lib/content/cms-config";
import type { PageContentMap } from "@/lib/content/content-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageContentEditorProps {
  page: CmsPage;
  initialContent: PageContentMap;
}

export function PageContentEditor({ page, initialContent }: PageContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<PageContentMap>(initialContent);
  const [saving, setSaving] = useState(false);

  function updateField(key: string, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${page.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save");
      }
      toast.success("Page content saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {page.sections.map((cmsSection) => (
        <Card key={cmsSection.id}>
          <CardHeader>
            <CardTitle>{cmsSection.title}</CardTitle>
            <CardDescription>
              Edit text content for this section. Images are not managed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {cmsSection.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.multiline ? (
                  <Textarea
                    id={field.key}
                    value={content[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={content[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
