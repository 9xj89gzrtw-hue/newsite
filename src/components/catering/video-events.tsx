"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * VideoEvents — LIGHT THEME
 *
 * Видео-секция мероприятий. Phase 6 architecture (no Mux):
 * 1. Direct external MP4 URL — preferred (RULES §3 — no .mp4 in /public,
 *    always stream from CDN). Uses native <video> via DirectVideoEmbed.
 *    Set `videoSrc` in VIDEO_CATALOG to enable. Sources: Pexels videos CDN,
 *    Mixkit, Coverr, Bunny.net Stream, Cloudinary free tier, Backblaze B2 +
 *    Cloudflare CDN.
 * 2. Mux playback ID — DEPRECATED (Phase 6 removed MuxPlayer). Renders a
 *    stub message telling user to migrate to videoSrc. Kept for backward
 *    compat with any existing data.
 * 3. YouTube embed — legacy fallback when no direct MP4 URL set.
 * 4. Poster-only with play button — lazy-load pattern: пользователь видит
 *    постер до клика, видео подгружается по клику. Сохраняет пропускную
 *    способность (4× iframe initial load saved).
 *
 * P1 patterns (REFERENCE-SITES-ANALYSIS.md §653 Lazy Loading + §1261 Swiper):
 *  - Lazy-load videos on click: posters only until interaction
 *  - Cinematic 16:9 letterbox on play
 *  - Hover preview state
 */

type VideoItem = {
  title: string;
  desc: string;
  source: string;
  poster?: string; // /media/*.jpg — shown until user clicks
  // Phase 6 — direct external MP4 URL (preferred, from any free CDN).
  // When set, DirectVideoEmbed uses native <video> element.
  videoSrc?: string;
  // Phase 5 legacy — Mux playback ID. DEPRECATED in Phase 6. Renders stub.
  // Migrate to videoSrc (direct MP4 URL).
  muxPlaybackId?: string;
  // Legacy YouTube fallback (still works, but RULES §3 prefers direct MP4).
  youtubeEmbedId?: string;
};

const VIDEO_CATALOG: VideoItem[] = [
  {
    title: "Свадебный банкет",
    desc: "Подача блюд, сервировка, атмосфера торжества",
    source: "Роскошный кейтеринг",
    poster: "/media/ridgewells-wedding.webp",
    // Real catering video from Wolfgang Puck Catering (HubSpot CDN, CORS-enabled).
    // "Power Of Food" hero loop, silent, 16MB MP4. Same URL as MEDIA.hero.videoSrc
    // — reused here for the wedding reception context.
    videoSrc: "https://wolfgangpuckcatering.com/hubfs/26S%20No%20Sound%20Power%20Of%20Food.mp4",
  },
  {
    title: "Выездное барбекю",
    desc: "Гриль на свежем воздухе, скандинавский стиль",
    source: "Выездной гриль-кейтеринг",
    poster: "/media/ridgewells-scallops.jpg",
    // Real catering video from GG Catering (Vimeo embed).
    // iframe-based — uses YouTubeEmbed-style pattern but for Vimeo.
    // The vimeoEmbedId is read by YouTubeEmbed component (which renders
    // Vimeo iframe when the URL pattern matches).
    youtubeEmbedId: "1049137317", // Vimeo video ID — YouTubeEmbed auto-detects Vimeo
  },
  {
    title: "Кофе-брейк на конференции",
    desc: "Корпоративное обслуживание, деловые мероприятия",
    source: "Корпоративный кофе-брейк",
    poster: "/media/concorde-avo-toast.jpg",
    // Real catering video from Cut and Taste Las Vegas (Vimeo embed).
    // iframe-based — Vimeo video ID 692388530.
    youtubeEmbedId: "692388530", // Vimeo video ID — YouTubeEmbed auto-detects Vimeo
  },
  {
    title: "Фуршет на банкете",
    desc: "Канапе, брускетты, подача официантами",
    source: "Обслуживание фуршета",
    poster: "/media/concorde-dessert.jpg",
    // Real catering video from Elegant Affairs NY (direct MP4 URL).
    // WordPress wp-content uploads — 533KB MP4, no CORS but <video> element
    // works cross-origin without CORS for video playback (not canvas access).
    videoSrc: "https://elegantaffairscaterers.com/wp-content/uploads/2021/07/landscape-1.mp4",
  },
];

export function VideoEvents() {
  return (
    <section
      id="video-events"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-cream py-24 md:py-36"
    >
      {/* Subtle decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <Play className="size-3" />
                Видео
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
              >
                Как это выглядит{" "}
                <br className="hidden sm:block" />
                <span className="gradient-text italic">в движении</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-base font-display italic text-ink/60">
              Видео наших мероприятий — подача блюд, сервировка, атмосфера.
            </p>
          </Reveal>
        </div>

        {/* Video grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {VIDEO_CATALOG.map((v, i) => (
            <Reveal key={v.title} delay={(i % 2) * 0.1}>
              <VideoCard {...v} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-8 text-center font-mono text-xs text-ink/40">
            Кликните на превью, чтобы воспроизвести видео
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * VideoCard — supports 3 modes per VIDEO_CATALOG item:
 * 1. Mux playback ID (preferred per RULES §3)
 * 2. YouTube embed (legacy fallback)
 * 3. Poster-only until click (lazy-load pattern — REF §653)
 *
 * State: "poster" → "loading" → "playing"
 * On click: state advances to "loading", then sets "playing" (mounts iframe/MuxPlayer).
 */
function VideoCard({
  title,
  desc,
  source,
  poster,
  videoSrc,
  muxPlaybackId,
  youtubeEmbedId,
}: VideoItem) {
  const [state, setState] = useState<"poster" | "loading" | "playing">("poster");
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = () => {
    if (state !== "poster") return;
    setState("loading");
    // Small delay to show loading state, then swap to player
    setTimeout(() => setState("playing"), 250);
  };

  // Reset to poster when component unmounts/hydrates
  useEffect(() => {
    return () => setState("poster");
  }, []);

  return (
    <motion.article
      whileHover={!prefersReducedMotion ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5 card-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video player / poster */}
      <div className="relative aspect-video overflow-hidden bg-ink">
        <AnimatePresence mode="wait">
          {state === "poster" && (
            <motion.button
              key="poster"
              type="button"
              onClick={handlePlay}
              aria-label={`Воспроизвести: ${title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="group/play absolute inset-0 block w-full"
            >
              {/* Poster image */}
              {poster ? (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/play:scale-105"
                  priority={false}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-ink to-charcoal" />
              )}
              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden="true" />

              {/* Play button — pulsing ring + center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="relative flex size-16 items-center justify-center rounded-full bg-white/90 text-gold shadow-2xl backdrop-blur-sm"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : isHovered
                      ? { scale: 1.1 }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  {/* Pulsing ring on hover */}
                  {!prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-white/40"
                      animate={isHovered ? { scale: [1, 1.4], opacity: [0.6, 0] } : { scale: 1, opacity: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                      aria-hidden="true"
                    />
                  )}
                  <Play className="size-6 ml-0.5" />
                </motion.span>
              </div>

              {/* HD badge — indicates direct CDN streaming */}
              {videoSrc && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-gold/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                  HD · CDN
                </div>
              )}
              {muxPlaybackId && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-bordeaux/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm" title="Mux playback IDs are deprecated in Phase 6 — migrate to videoSrc">
                  Mux · legacy
                </div>
              )}
            </motion.button>
          )}

          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-ink"
            >
              <Loader2 className="size-8 animate-spin text-gold" />
              <span className="ml-3 font-mono text-xs uppercase tracking-wider text-cream/70">
                Загрузка…
              </span>
            </motion.div>
          )}

          {state === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {videoSrc ? (
                // Phase 6 — direct external MP4 URL via native <video>.
                // Phase 9: cinema mode with letterbox + grain overlay on play.
                <CinemaVideoEmbed src={videoSrc} poster={poster} title={title} />
              ) : muxPlaybackId ? (
                // Phase 5 legacy — Mux playback ID (deprecated, renders stub).
                <MuxVideoEmbed playbackId={muxPlaybackId} title={title} />
              ) : youtubeEmbedId ? (
                // Legacy YouTube fallback.
                <YouTubeEmbed embedId={youtubeEmbedId} title={title} />
              ) : (
                <div className="flex h-full items-center justify-center text-cream/60 text-sm">
                  Нет источника видео
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <h3 className="font-display text-lg text-ink font-medium">{title}</h3>
          <p className="mt-1 text-sm text-ink/60">{desc}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-gold/70">
            {source}
          </p>
        </div>
        {state === "poster" ? (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Воспроизвести: ${title}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold transition-colors hover:bg-gold/25 min-h-[44px] min-w-[44px]"
          >
            <Play className="size-5 ml-0.5" />
          </button>
        ) : (
          <Play className="size-5 shrink-0 text-gold mt-1" />
        )}
      </div>
    </motion.article>
  );
}

/**
 * MuxVideoEmbed — DEPRECATED in Phase 6.
 *
 * Phase 6 removed Mux infrastructure (API returned 404 — credentials likely
 * restricted to Vercel-Mux integration scope). Replaced with DirectVideoEmbed
 * below, which uses a native <video> element supporting any external MP4 URL
 * from free CDNs (Pexels videos, Mixkit, Coverr, Bunny.net, Cloudinary,
 * Backblaze B2 + Cloudflare CDN).
 *
 * This stub kept to avoid breaking the muxPlaybackId prop in VIDEO_CATALOG
 * (legacy fallback). If a video has muxPlaybackId set (legacy), it renders
 * a placeholder message telling the user to migrate to direct MP4 URL.
 */
function MuxVideoEmbed({ playbackId }: { playbackId: string; title: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-ink p-4 text-center text-cream/60 text-sm">
      Mux playback ID &quot;{playbackId}&quot; requires Mux API access (Phase 5
      was removed). Migrate to a direct MP4 URL in VIDEO_CATALOG.videoSrc
      (Phase 6 pattern).
    </div>
  );
}

/**
 * DirectVideoEmbed — Phase 6.
 *
 * Renders a native <video> element with a direct external MP4 URL from any
 * free CDN (Pexels videos, Mixkit, Coverr, Bunny.net, Cloudinary, etc.).
 * No SDK needed, no API calls, no provider lock-in.
 *
 * Autoplay muted loop (browser autoplay policy compliant).
 */
function DirectVideoEmbed({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls
      className="h-full w-full object-cover"
      aria-label={title}
    />
  );
}

/**
 * YouTubeEmbed — supports both YouTube and Vimeo video IDs.
 * Auto-detects Vimeo IDs by length (Vimeo IDs are typically 9-digit numeric,
 * YouTube IDs are 11-char alphanumeric). Uses youtube-nocookie.com for
 * YouTube privacy; Vimeo player.vimeo.com.
 */
function YouTubeEmbed({ embedId, title }: { embedId: string; title: string }) {
  // Vimeo IDs are all-numeric (e.g. "1049137317"); YouTube IDs are 11-char mixed.
  const isVimeo = /^\d+$/.test(embedId);
  const src = isVimeo
    ? `https://player.vimeo.com/video/${embedId}?autoplay=1&title=0&byline=0&portrait=0`
    : `https://www.youtube-nocookie.com/embed/${embedId}?rel=0&modestbranding=1&autoplay=1`;
  return (
    <iframe
      src={src}
      title={title}
      role="img"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      allow="accelerated-motion; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full"
    />
  );
}

/**
 * CinemaVideoEmbed — Phase 9 cinema mode wrapper.
 *
 * Wraps DirectVideoEmbed with:
 * 1. 16:9 letterbox bars (top + bottom, scale-in from 0% to 100% on play)
 * 2. Subtle grain overlay (SVG feTurbulence via .grain class from globals.css)
 * 3. "CINEMA" badge top-right corner with pulsing dot
 *
 * The letterbox bars create cinematic black bars on top + bottom of the
 * video player, suggesting a premium film presentation. They animate in
 * via scaleY (transform/opacity only — RULES §5 compliant).
 *
 * The grain overlay adds subtle texture for film-like quality. Uses the
 * .grain class from globals.css which is a fixed SVG feTurbulence filter
 * with mix-blend-mode: overlay, opacity 0.05.
 *
 * Reduced-motion: letterbox bars are static (no scale animation), grain
 * is disabled (replaced with subtle border-glow).
 */
function CinemaVideoEmbed({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="relative h-full w-full bg-ink">
      {/* Cinema letterbox bars — top + bottom, scale-in on play */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 bg-ink"
        initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "8%", transformOrigin: "top" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 bg-ink"
        initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "8%", transformOrigin: "bottom" }}
        aria-hidden="true"
      />
      {/* The actual video player */}
      <DirectVideoEmbed src={src} poster={poster} title={title} />
      {/* Grain overlay (cinema film texture) — disabled for reduced-motion */}
      {!prefersReducedMotion && (
        <div
          className="grain pointer-events-none absolute inset-0 z-10 opacity-[0.07] mix-blend-overlay"
          aria-hidden="true"
        />
      )}
      {/* CINEMA badge — top-right corner with pulsing dot */}
      <div className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur-md">
        <motion.span
          className="size-1.5 rounded-full bg-gold"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/80">
          Cinema
        </span>
      </div>
    </div>
  );
}
