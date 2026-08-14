"use client";

import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted",
          actionButton:
            "group-[.toast]:bg-navy group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-soft-gray group-[.toast]:text-navy",
          success:
            "group-[.toast]:border-navy/20 group-[.toast]:bg-soft-gray group-[.toast]:text-navy",
          error:
            "group-[.toast]:border-buffalo-red/50 group-[.toast]:bg-buffalo-red/10 group-[.toast]:text-buffalo-red-dark",
          warning:
            "group-[.toast]:border-buffalo-red/30 group-[.toast]:text-foreground",
          info: "group-[.toast]:border-navy/20 group-[.toast]:text-navy",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
