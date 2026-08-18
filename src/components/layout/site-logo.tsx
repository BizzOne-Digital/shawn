import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  comClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  showCom?: boolean;
  invert?: boolean;
}

export function SiteLogo({
  href = "/",
  className,
  imageClassName,
  comClassName,
  width = 160,
  height = 48,
  priority = false,
  showCom = true,
  invert = false,
}: SiteLogoProps) {
  const content = (
    <span className={cn("inline-flex items-end gap-0.5", className)}>
      <Image
        src="/images/logo.png"
        alt="Let's Go Buffalo"
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "h-auto w-auto object-contain",
          invert && "brightness-0 invert",
          imageClassName
        )}
      />
      {showCom && (
        <span
          className={cn(
            "mb-0.5 text-sm font-bold leading-none text-navy sm:text-base",
            invert && "text-white",
            comClassName
          )}
        >
          .com
        </span>
      )}
    </span>
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
