/**
 * Video provider abstraction.
 *
 * Rule (see docs/RULES.md): never host .mp4 in /public — always stream via a
 * managed provider. Mux is primary (best Vercel integration, adaptive HLS),
 * Cloudflare Stream is the budget fallback. Both are addressable through one
 * `<VideoPlayer>` component via a discriminated `src` shape.
 */

export type MuxSource = {
  provider: "mux";
  /** Mux playback ID (e.g. from Mux dashboard or upload API). */
  playbackId: string;
  /** Stream type — default "on-demand". */
  streamType?: "on-demand" | "live";
  /** Poster image URL (Mux exposes a thumbnail endpoint). */
  poster?: string;
};

export type CloudflareStreamSource = {
  provider: "cloudflare";
  /** Cloudflare Stream video UID. */
  videoUid: string;
  /** Customer subdomain from Cloudflare Stream dashboard. */
  customerSubdomain: string;
  poster?: string;
};

export type VideoSource = MuxSource | CloudflareStreamSource;

/** Resolve a poster URL from a Mux playback ID (default thumbnail, 16:9). */
export function muxPoster(playbackId: string, opts?: { time?: number; width?: number }) {
  const t = opts?.time ?? 0;
  const w = opts?.width ?? 1280;
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${t}&width=${w}`;
}
