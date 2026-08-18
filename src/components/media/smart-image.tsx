import * as React from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Enforced `next/image` wrapper for the whole site.
 *
 * Rules (docs/RULES.md §4):
 *   - `alt` is REQUIRED (typed as a real string, not optional).
 *   - `placeholder="blur"` + `blurDataURL` when a blur source is provided.
 *   - Sensible `sizes` default; override per-usage.
 *   - AVIF/WebP via next.config `images.formats`.
 *
 * Never use a raw `<img>` — it will be flagged by lint and the design review.
 */
type SmartImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  /** Optional tiny blurred image (data URL) for the placeholder. */
  blurDataURL?: string;
};

export function SmartImage({
  alt,
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority,
  ...rest
}: SmartImageProps) {
  return (
    <Image
      alt={alt}
      sizes={sizes}
      priority={priority}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
      {...rest}
    />
  );
}
