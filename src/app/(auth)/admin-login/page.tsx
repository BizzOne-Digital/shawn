"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { isAdminRole } from "@/lib/auth-roles";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  async function onSubmit(data: AdminLoginForm) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      const session = await getSession();
      if (!isAdminRole(session?.user?.role)) {
        await signOut({ redirect: false });
        toast.error("This account does not have admin access.");
        return;
      }

      toast.success("Admin access granted");
      router.push(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-navy p-8 shadow-2xl">
        <div className="text-center">
          <SiteLogo
            href="/"
            width={200}
            height={67}
            className="mx-auto justify-center"
            imageClassName="mx-auto"
          />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90">
            <Shield className="size-4 text-buffalo-red" />
            Admin Portal
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Staff sign in</h1>
          <p className="mt-2 text-sm text-white/70">
            Authorized administrators and moderators only
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white/90">
              Admin email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="admin@letsgobuffalo.com"
              {...register("email")}
              className="mt-1 border-white/20 bg-white/10 text-white placeholder:text-white/40"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-buffalo-red">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-white/90">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="mt-1 border-white/20 bg-white/10 text-white"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-buffalo-red">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" variant="accent" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Sign In to Admin
          </Button>
        </form>

        <p className="text-center text-xs text-white/50">
          Business owners:{" "}
          <Link href="/login" className="text-white/80 underline hover:text-white">
            use the regular sign-in page
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-navy">Loading...</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
