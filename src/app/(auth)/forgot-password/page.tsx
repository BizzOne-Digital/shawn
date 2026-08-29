"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Request failed");
        return;
      }

      setSent(true);
      toast.success("Check your email for reset instructions");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/images/logo.png"
            alt="Let's Go Buffalo"
            width={200}
            height={67}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-navy">Forgot password?</h1>
          <p className="text-muted mt-2">
            {sent
              ? "If an account exists with that email, we've sent reset instructions."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-buffalo-red mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" variant="accent" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        ) : null}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-navy hover:text-buffalo-red"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
