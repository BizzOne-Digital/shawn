"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface LeadMessageDialogProps {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source: string;
  createdAt: string;
}

export function LeadMessageDialog({
  name,
  email,
  phone,
  message,
  source,
  createdAt,
}: LeadMessageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-navy">
          <Eye className="size-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {source} · {createdAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-medium text-navy">Email:</span> {email}
          </p>
          {phone && (
            <p>
              <span className="font-medium text-navy">Phone:</span> {phone}
            </p>
          )}
          <div>
            <p className="font-medium text-navy mb-1">Message</p>
            <p className="whitespace-pre-wrap rounded-lg bg-soft-gray p-3 text-muted">{message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
