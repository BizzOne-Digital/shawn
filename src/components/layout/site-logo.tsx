import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  invert?: boolean;
}

export function SiteLogo({
  href = "/",
  className,
  imageClassName,
  width = 160,
  height = 48,
  priority = false,
  invert = false,
}: SiteLogoProps) {
  const content = (
    <Image
      src="/images/logo.png"
      alt="Let's Go Buffalo"
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain",
        invert && "brightness-0 invert",
        className,
        imageClassName
      )}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
