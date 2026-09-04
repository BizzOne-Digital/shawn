"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const isIndividual = session?.user?.role === UserRole.INDIVIDUAL;

  useEffect(() => {
    fetch("/api/user/newsletter")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.subscribed === "boolean") {
          setNewsletterSubscribed(data.subscribed);
        }
      })
      .catch(() => undefined);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      phone: "",
    },
  });

  async function onSubmit(data: SettingsForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Update failed");
        return;
      }
      await update({ name: data.name });
      toast.success("Settings updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggleNewsletter(subscribed: boolean) {
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/user/newsletter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed }),
      });
      if (!res.ok) {
        toast.error("Unable to update newsletter preference");
        return;
      }
      setNewsletterSubscribed(subscribed);
      toast.success(subscribed ? "Subscribed to newsletter" : "Unsubscribed from newsletter");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Account Settings</h1>
        <p className="text-muted mt-1">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email ?? ""}
                disabled
                className="mt-1 bg-soft-gray"
              />
              <p className="text-xs text-muted mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="name">{isIndividual ? "Your Name" : "Business Name"}</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && (
                <p className="text-sm text-buffalo-red mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} className="mt-1" />
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={newsletterSubscribed}
              disabled={newsletterLoading}
              onCheckedChange={(checked) => void toggleNewsletter(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-muted leading-snug">
              Email me local business updates, community news, and Let&apos;s Go Buffalo announcements.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted mb-4">
            To change your password, use the forgot password flow from the login page.
          </p>
          <Button variant="outline" asChild>
            <a href="/forgot-password">Reset Password</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
