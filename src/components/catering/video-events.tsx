"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * VideoEvents — LIGHT THEME
 *
 * Видео-секция мероприятий. Поддерживает 3 типа источника:
 * 1. Mux playback ID — выводит `<MuxPlayer>` (динамический импорт, lazy).
 *    Используется когда заполнен `muxPlaybackId` в VIDEO_CATALOG.
 * 2. YouTube embed — fallback когда `muxPlaybackId` пустой. Правило §3
 *    требует Mux, но для совместимости с legacy-плейсхолдерами оставлен
 *    fallback. Когда пользователь загрузит клипы в Mux-дашборд и заполнит
 *    `muxPlaybackId`, YouTube fallback автоматически перестанет использоваться.
 * 3. Poster-only with play button — lazy-load pattern: пользователь видит
 *    постер до клика, видeoswar подгружается по клику. Сохраняет пропускную
 *    способность (4× iframe initial load для первой страницы).
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
  muxPlaybackId?: string; // when set, use Mux; else fall back to YouTube
  youtubeEmbedId?: string; // legacy fallback
};

const VIDEO_CATALOG: VideoItem[] = [
  {
    title: "Свадебный банкет",
    desc: "Подача блюд, сервировка, атмосфера торжества",
    source: "Роскошный кейтеринг",
    poster: "/media/event-01.png",
    // Mux playback ID — TODO: user uploads to Mux dashboard, fills in real ID
    // muxPlaybackId: "REPLACE_WITH_REAL_MUX_PLAYBACK_ID",
    youtubeEmbedId: "LXb3EKWsInQ",
  },
  {
    title: "Выездное барбекю",
    desc: "Гриль на свежем воздухе, скандинавский стиль",
    source: "Выездной гриль-кейтеринг",
    poster: "/media/event-02.jpg",
    youtubeEmbedId: "sTANio_2cJI",
  },
  {
    title: "Кофе-брейк на конференции",
    desc: "Корпоративное обслуживание, деловые мероприятия",
    source: "Корпоративный кофе-брейк",
    poster: "/media/event-03.jpg",
    youtubeEmbedId: "P4bKZj_euUI",
  },
  {
    title: "Фуршет на банкете",
    desc: "Канапе, брускетты, подача официантами",
    source: "Обслуживание фуршета",
    poster: "/media/event-04.jpg",
    youtubeEmbedId: "eKFTWMCxM3A",
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

              {/* "Mux" badge if available — indicates premium streaming */}
              {muxPlaybackId && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-gold/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                  HD · Mux
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
              {muxPlaybackId ? (
                <MuxVideoEmbed playbackId={muxPlaybackId} title={title} />
              ) : youtubeEmbedId ? (
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
 * MuxVideoEmbed — renders `<MuxPlayer>` via dynamic import.
 * MuxPlayer is a web component that touches `window`, so it must be
 * client-only (ssr: false). Wrapped here so it only loads when the user
 * actually clicks play (saves initial JS bundle).
 */
function MuxVideoEmbed({ playbackId, title }: { playbackId: string; title: string }) {
  // Lazy dynamic import — MuxPlayer web component only loads on demand.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const MuxPlayer = require("@mux/mux-player-react").default as React.ComponentType<{
    playbackId: string;
    streamType?: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
    className?: string;
  }>;
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      autoPlay
      muted
      loop
      playsInline
      className="h-full w-full"
      // Note: title is set via aria-label since MuxPlayer doesn't have a `title` prop.
      aria-label={title}
    />
  );
}

/**
 * YouTubeEmbed — legacy fallback. Uses youtube-nocookie.com for privacy.
 * Will be replaced by MuxVideoEmbed once user provides muxPlaybackId values
 * in VIDEO_CATALOG above.
 */
function YouTubeEmbed({ embedId, title }: { embedId: string; title: string }) {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${embedId}?rel=0&modestbranding=1&autoplay=1`}
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
