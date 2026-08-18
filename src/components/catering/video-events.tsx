"use client";

import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * VideoEvents — LIGHT THEME
 * 
 * Видео-секция мероприятий с YouTube embed.
 */
const VIDEO_CATALOG = [
  {
    title: "Свадебный банкет",
    desc: "Подача блюд, сервировка, атмосфера торжества",
    embedId: "LXb3EKWsInQ",
    source: "Роскошный кейтеринг",
  },
  {
    title: "Выездное барбекю",
    desc: "Гриль на свежем воздухе, скандинавский стиль",
    embedId: "sTANio_2cJI",
    source: "Выездной гриль-кейтеринг",
  },
  {
    title: "Кофе-брейк на конференции",
    desc: "Корпоративное обслуживание, деловые мероприятия",
    embedId: "P4bKZj_euUI",
    source: "Корпоративный кофе-брейк",
  },
  {
    title: "Фуршет на банкете",
    desc: "Канапе, брускетты, подача официантами",
    embedId: "eKFTWMCxM3A",
    source: "Обслуживание фуршета",
  },
];

export function VideoEvents() {
  return (
    <section id="video-events" className="relative overflow-hidden bg-cream py-24 md:py-36">
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
            Видеоматериалы наших мероприятий coming soon
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function VideoCard({
  title,
  desc,
  embedId,
  source,
}: {
  title: string;
  desc: string;
  embedId: string;
  source: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5 card-lift"
    >
      {/* Video player */}
      <div className="relative aspect-video overflow-hidden bg-cream">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}?rel=0&modestbranding=1`}
          title={title}
          role="img"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="accelerated-motion; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-gold shadow-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <Play className="size-6 ml-0.5" />
          </span>
        </div>
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
        <Play className="size-5 shrink-0 text-gold mt-1" />
      </div>
    </motion.article>
  );
}
