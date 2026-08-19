/**
 * Video provider abstraction.
 *
 * Phase 6 (2026-08-19): Mux + Cloudflare Stream removed.
 * Mux API returned 404 for all endpoints (credentials likely restricted to
 * Vercel-Mux integration scope). Cloudflare Stream requires paid plan.
 *
 * New approach: direct external MP4 URLs from any free CDN
 * (Pexels videos, Mixkit, Coverr, Bunny.net Stream, Cloudinary free tier,
 * Backblaze B2 + Cloudflare CDN, etc.). Uses native <video> element — no
 * SDK needed, no provider lock-in, no API calls.
 *
 * Rule (see docs/RULES.md): never host .mp4 in /public — always stream
 * from an external CDN. The external URL is set via the `src` field.
 *
 * For YouTube/Vimeo embeds, use the existing iframe pattern directly
 * (see src/components/catering/video-events.tsx YouTubeEmbed component).
 */

export type DirectVideoSource = {
  provider: "direct";
  /** Direct MP4 URL from any CDN (Pexels, Mixkit, Coverr, etc.). */
  src: string;
  /** Optional poster image URL (shown before user clicks play). */
  poster?: string;
};

export type VideoSource = DirectVideoSource;

/**
 * Resolve a poster URL from a direct video source.
 * For external MP4s, the poster is typically a separate image file
 * (Pexels image CDN, etc.). Falls back to empty string.
 */
export function videoPoster(source: VideoSource): string {
  return source.poster ?? "";
}
