"use client";

import * as React from "react";
import type { VideoSource } from "@/lib/video";
import { videoPoster } from "@/lib/video";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  source: VideoSource;
  className?: string;
  /** Autoplay the video muted (use for hero loops). */
  autoPlay?: boolean;
  /** Loop the video (use for hero loops). */
  loop?: boolean;
  /** Hide the player chrome (controls) — use for autoplay hero loops. */
  hideControls?: boolean;
  /** Aspect ratio className, e.g. "aspect-video". */
  aspect?: string;
};

/**
 * Single video component for the whole site.
 *
 * Phase 6 (2026-08-19): Mux + Cloudflare Stream REMOVED.
 * Now uses native <video> element with direct external MP4 URLs from any
 * free CDN (Pexels videos, Mixkit, Coverr, Bunny.net Stream, Cloudinary
 * free tier, Backblaze B2 + Cloudflare CDN, etc.).
 *
 * Never point this at a local `.mp4` in /public — Vercel bandwidth penalty
 * (per docs/RULES.md §3). Always use an external CDN URL.
 *
 * For YouTube/Vimeo embeds, use the iframe pattern directly (see
 * src/components/catering/video-events.tsx YouTubeEmbed component).
 */
export function VideoPlayer({
  source,
  className,
  autoPlay = false,
  loop = false,
  hideControls = false,
  aspect = "aspect-video",
}: VideoPlayerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-black",
        aspect,
        className,
      )}
    >
      {source.provider === "direct" ? (
        <video
          src={source.src}
          poster={source.poster ?? videoPoster(source)}
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={loop}
          playsInline
          controls={!hideControls}
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-cream/60 text-sm">
          Неизвестный источник видео
        </div>
      )}
    </div>
  );
}
