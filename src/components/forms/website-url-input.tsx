"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { normalizeWebsiteUrl } from "@/lib/url-utils";

interface WebsiteUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: boolean;
}

export function WebsiteUrlInput({ value, onChange, className, error }: WebsiteUrlInputProps) {
  const protocol = value.startsWith("http://") ? "http://" : "https://";
  const domain = value.replace(/^https?:\/\//i, "");

  function handleProtocolChange(next: string) {
    if (!domain.trim()) {
      onChange("");
      return;
    }
    onChange(`${next}${domain}`);
  }

  function handleDomainChange(next: string) {
    const cleaned = next.replace(/^https?:\/\//i, "");
    if (!cleaned.trim()) {
      onChange("");
      return;
    }
    onChange(normalizeWebsiteUrl(cleaned));
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={protocol} onValueChange={handleProtocolChange}>
        <SelectTrigger className="w-[120px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="https://">https://</SelectItem>
          <SelectItem value="http://">http://</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="text"
        inputMode="url"
        placeholder="yourbusiness.com"
        value={domain}
        onChange={(e) => handleDomainChange(e.target.value)}
        onBlur={() => {
          if (domain.trim()) onChange(normalizeWebsiteUrl(`${protocol}${domain}`));
        }}
        className={cn(error && "border-buffalo-red ring-1 ring-buffalo-red")}
      />
    </div>
  );
}
