"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLogo } from "@/components/layout/site-logo";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function buildRegisterSchema(isIndividual: boolean) {
  return z
    .object({
      name: z
        .string()
        .min(2, isIndividual ? "Name must be at least 2 characters" : "Business name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
      phone: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
}

interface RegisterFormProps {
  isIndividual?: boolean;
}

export function RegisterForm({ isIndividual = false }: RegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const registerSchema = buildRegisterSchema(isIndividual);

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          memberType: isIndividual ? "INDIVIDUAL" : "BUSINESS",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push(isIndividual ? "/login?callbackUrl=/dashboard" : "/login?callbackUrl=/dashboard/submit");
        return;
      }

      if (isIndividual) {
        toast.success("Welcome! Your individual account is ready.");
        router.push("/dashboard");
      } else {
        toast.success("Welcome! Let's set up your business listing.");
        router.push("/dashboard/submit");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <SiteLogo
            href="/"
            width={300}
            height={100}
            className="mx-auto mb-8"
            imageClassName="mx-auto"
          />
          <h2 className="font-display text-3xl font-bold mb-4">
            {isIndividual ? "Join the Community" : "List Your Business"}
          </h2>
          <p className="text-white/80 text-lg">
            {isIndividual
              ? "Connect with Buffalo-area businesses and access member perks."
              : "Join Buffalo-area businesses reaching new customers every day."}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <SiteLogo href="/" width={180} height={54} className="mb-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {isIndividual ? "Create your individual account" : "Create your business account"}
            </h1>
            <p className="text-muted mt-2">
              {isIndividual
                ? "Join free — no business listing required"
                : "Start listing your business for free"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{isIndividual ? "Your Name" : "Business Name"}</Label>
              <Input
                id="name"
                placeholder={isIndividual ? "e.g. Sally Smith" : "e.g. Joe's Pizza"}
                {...register("name")}
                className="mt-1"
              />
              {errors.name && <p className="text-sm text-buffalo-red mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1" />
              {errors.email && <p className="text-sm text-buffalo-red mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" {...register("phone")} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" {...register("password")} className="mt-1" />
              <PasswordRequirements />
              {errors.password && <p className="text-sm text-buffalo-red mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput id="confirmPassword" {...register("confirmPassword")} className="mt-1" />
              {errors.confirmPassword && (
                <p className="text-sm text-buffalo-red mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" variant="accent" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted">
            {isIndividual ? (
              <>
                Want to list a business instead?{" "}
                <Link href="/register" className="text-navy font-medium hover:text-buffalo-red">
                  Create a business account
                </Link>
              </>
            ) : (
              <>
                Joining as an individual?{" "}
                <Link href="/register?type=individual" className="text-navy font-medium hover:text-buffalo-red">
                  Create an individual account
                </Link>
              </>
            )}
          </p>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-navy font-medium hover:text-buffalo-red">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
