"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { MuxCSSProperties } from "@mux/mux-player-react";
import type { VideoSource } from "@/lib/video";
import { muxPoster } from "@/lib/video";
import { cn } from "@/lib/utils";

/**
 * MuxPlayer is a web component shipped via a React wrapper. It must only render
 * on the client (it touches `window`), so we load it with `ssr: false`.
 */
const MuxPlayer = dynamic(
  () => import("@mux/mux-player-react").then((m) => m.default),
  { ssr: false, loading: () => null },
);

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
 * Single video component for the whole site. Streams via Mux (primary) or
 * Cloudflare Stream (fallback) — see `lib/video.ts`. Never point this at a
 * local `.mp4` in /public (Vercel bandwidth penalty).
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
      {source.provider === "mux" ? (
        <MuxPlayer
          playbackId={source.playbackId}
          streamType={source.streamType ?? "on-demand"}
          poster={source.poster ?? muxPoster(source.playbackId)}
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={loop}
          playsInline
          style={hideControls ? ({ "--controls": "none" } as MuxCSSProperties) : undefined}
          className="h-full w-full"
        />
      ) : (
        <iframe
          // Cloudflare Stream embed
          src={`https://customer-${source.customerSubdomain}.cloudflarestream.com/${source.videoUid}/iframe`}
          title="Cloudflare Stream video"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="autoplay; picture-in-picture"
          className="h-full w-full"
        />
      )}
    </div>
  );
}
