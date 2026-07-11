"use client";

import NextImage from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
}

function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes,
}: ImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          fill ? "absolute inset-0" : "",
          containerClassName
        )}
      >
        <ImageIcon className="h-8 w-8 text-gray-300" />
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <NextImage
          src={src}
          alt={alt}
          fill
          className={cn("object-cover", className)}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
      onError={() => setHasError(true)}
    />
  );
}

export { Image };
