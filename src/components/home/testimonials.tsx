"use client";

import { Quote, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  business?: string;
  rating?: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author, role, business, rating = 5 } = testimonial;

  return (
    <Card className="h-full border-border/80 shadow-sm">
      <CardContent className="flex h-full flex-col p-6">
        <Quote className="size-8 text-buffalo-red/30" aria-hidden="true" />
        <div className="mt-2 flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < rating
                  ? "fill-buffalo-red text-buffalo-red"
                  : "fill-soft-gray text-soft-gray-dark"
              )}
            />
          ))}
        </div>
        <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <footer className="mt-6 border-t border-border pt-4">
          <cite className="not-italic">
            <p className="font-semibold text-navy">{author}</p>
            {(role || business) && (
              <p className="text-sm text-muted">
                {[role, business].filter(Boolean).join(" · ")}
              </p>
            )}
          </cite>
        </footer>
      </CardContent>
    </Card>
  );
}

export function Testimonials({
  testimonials,
  title = "What Our Community Says",
  subtitle = "Hear from business owners and customers across Buffalo",
  className,
}: TestimonialsProps) {
  return (
    <section className={cn("bg-soft-gray py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInUp className="text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted">{subtitle}</p>
        </FadeInUp>

        <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
