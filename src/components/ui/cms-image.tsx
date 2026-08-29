import Image from "next/image";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { cn } from "@/lib/utils";

interface CmsImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export function CmsImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  sizes,
}: CmsImageProps) {
  const resolved = resolveImageUrl(src);

  return (
    <Image
      src={resolved}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      className={cn(className)}
      unoptimized={resolved.startsWith("/api/uploads/")}
    />
  );
}
