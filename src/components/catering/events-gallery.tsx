"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Keyboard, MousePointer } from "lucide-react";
import { Reveal } from "./reveal";
import { MEDIA, EVENT_CATEGORIES } from "@/lib/media";
import { useMounted } from "@/hooks/use-mounted";

type Category = (typeof EVENT_CATEGORIES)[number];

// Aspect ratio presets for visual variety (Creative Edge mosaic pattern)
const ASPECT_RATIOS = [
  "aspect-[4/5]",   // Portrait - tall
  "aspect-[3/4]",   // Slightly portrait
  "aspect-[4/3]",   // Landscape
  "aspect-[3/2]",   // Wide landscape
  "aspect-[1/1]",   // Square
  "aspect-[5/4]",   // Slightly landscape
  "aspect-[2/3]",   // Portrait
  "aspect-[16/10]", // Cinematic
];

// Featured item indices (span 2 columns on large screens)
const FEATURED_INDICES = [0, 5, 10];

/**
 * Skeleton loader for images — shimmer animation while loading.
 */
function ImageSkeleton({ aspectRatio }: { aspectRatio: string }) {
  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden rounded-xl`}>
      <div className="absolute inset-0 shimmer bg-cream-2" />
    </div>
  );
}

/**
 * Shine sweep effect overlay — glossy hover effect (Cut & Taste pattern).
 */
function ShineOverlay() {
  return (
    <div 
      className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      aria-hidden="true"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"
        style={{ transform: "translateX(-100%)" }}
      />
    </div>
  );
}

/**
 * Gallery Item with parallax depth and enhanced hover states.
 */
function GalleryItem({
  item,
  index,
  onClick,
  reducedMotion,
}: {
  item: (typeof MEDIA.events)[number];
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt — mouse-tracking rotateX/rotateY (Gamma tilt pattern, REF §1643).
  // Disabled on reduced-motion. Spring-smoothed.
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mvX.set((e.clientX - cx) / rect.width);
      mvY.set((e.clientY - cy) / rect.height);
    },
    [mvX, mvY, reducedMotion],
  );

  const onMouseLeave = useCallback(() => {
    if (reducedMotion) return;
    mvX.set(0);
    mvY.set(0);
  }, [mvX, mvY, reducedMotion]);

  // Parallax scroll effect using framer-motion
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Alternate parallax speed based on index for depth variation
  const parallaxSpeed = index % 3 === 0 ? 30 : index % 3 === 1 ? 20 : 40;
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-parallaxSpeed, parallaxSpeed]);

  // Determine aspect ratio with more dramatic variety
  const aspectRatio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
  const isFeatured = FEATURED_INDICES.includes(index);

  return (
    <motion.div
      ref={ref}
      style={{ y, perspective: 1000 }}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`${isFeatured ? "sm:col-span-2 lg:col-span-2" : ""} break-inside-avoid mb-4`}
    >
      <motion.button
        layout
        onClick={onClick}
        data-cursor="смотреть"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative block w-full overflow-hidden rounded-xl card-lift"
        whileHover={!reducedMotion ? { y: -8 } : undefined}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <div className={`relative w-full ${aspectRatio}`}>
          {/* Image skeleton placeholder */}
          {!isLoaded && (
            <ImageSkeleton aspectRatio={aspectRatio} />
          )}
          
          {/* Main image with blur-up and subtle zoom */}
          <Image
            src={item.src}
            alt={item.caption}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-[800ms] ease-out ${
              isLoaded ? "opacity-100" : "opacity-0 blur-sm"
            } group-hover:scale-105`}
            style={{
              transform: "scale(1)",
              transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease, filter 500ms ease",
            }}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
          
          {/* Glossy shine sweep effect */}
          <ShineOverlay />
          
          {/* Gradient overlay — transparent to dark on hover */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          
          {/* Category badge — top left */}
          <div className="absolute left-3 top-3 z-20 rounded-full bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cream backdrop-blur-md transition-all duration-500 opacity-0 translate-y-[-4px] group-hover:opacity-100 group-hover:translate-y-0 md:opacity-70 md:translate-y-0">
            {item.category}
          </div>
          
          {/* Caption reveal — slides up smoothly from bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5 text-left transition-all duration-500 ease-out opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
            <span className="font-mono text-xs uppercase tracking-wider text-gold/90">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-1 font-display text-lg text-white leading-snug">
              {item.caption}
            </p>
          </div>

          {/* Featured indicator */}
          {isFeatured && (
            <div className="absolute right-3 top-3 z-20 rounded-full bg-gold/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white backdrop-blur-sm">
              Избранное
            </div>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}

/**
 * Thumbnail strip for lightbox navigation (professional gallery pattern).
 */
function ThumbnailStrip({
  items,
  currentIndex,
  onSelect,
}: {
  items: typeof MEDIA.events;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll thumbnail into view
  useEffect(() => {
    if (stripRef.current) {
      const activeThumb = stripRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentIndex]);

  return (
    <div 
      ref={stripRef}
      className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-1 max-w-full"
      role="tablist"
      aria-label="Миниатюры галереи"
    >
      {items.map((item, i) => (
        <button
          key={`${item.src}-${i}`}
          role="tab"
          aria-selected={i === currentIndex}
          aria-label={`Перейти к фото ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
            i === currentIndex 
              ? "ring-2 ring-gold ring-offset-2 ring-offset-ink/90 scale-110" 
              : "ring-1 ring-white/20 opacity-60 hover:opacity-100 hover:scale-105"
          }`}
        >
          <Image
            src={item.src}
            alt={item.caption}
            fill
            sizes="56px"
            className="object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Animated counter with smooth number transitions.
 */
function AnimatedCounter({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs tracking-wider">
      <motion.span
        key={current}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="min-w-[1ch] text-center tabular-nums"
      >
        {current + 1}
      </motion.span>
      <span className="text-white/40">/</span>
      <span className="text-white/60">{total}</span>
    </div>
  );
}

/**
 * EventsGallery — PREMIUM LIGHT THEME with:
 *  - Filterable masonry gallery with parallax depth
 *  - Enhanced hover states (reveal, zoom, gradient, shine)
 *  - Professional lightbox with thumbnails & keyboard hints
 *  - Loading states with skeleton/blur-up effects
 *  - Animated category filters with count badges
 *
 * Reference patterns:
 *  - Creative Edge Parties: Photo mosaics with vibrant energy
 *  - Cut & Taste (Las Vegas): Glossy hover effects, high-polish feel
 *  - Ridgewells: Full-bleed gallery with elegant transitions
 */
export function EventsGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>("Все");
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const containerRef = useRef<HTMLElement>(null);
  
  // Respect user's motion preferences
  const prefersReducedMotion = useReducedMotion();

  const all = MEDIA.events;
  const items = useMemo(
    () =>
      category === "Все"
        ? all
        : all.filter((e) => e.category === category),
    [all, category],
  );

  // Reset visible count when category changes (so filtered views don't truncate)
  useEffect(() => {
    setVisibleCount(8);
  }, [category]);

  // Paginate — show first N items by default; rest on "Load more"
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;
  const remainingCount = items.length - visibleCount;

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Все": all.length };
    EVENT_CATEGORIES.slice(1).forEach(cat => {
      counts[cat] = all.filter(e => e.category === cat).length;
    });
    return counts;
  }, [all]);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () =>
      setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length],
  );

  // Show keyboard hint briefly when lightbox opens
  useEffect(() => {
    if (open !== null) {
      setShowKeyboardHint(true);
      const timer = setTimeout(() => setShowKeyboardHint(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard navigation inside the lightbox
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  // Touch/swipe handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Minimum swipe distance threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next(); // Swiped left → next
      } else {
        prev(); // Swiped right → previous
      }
    }
    setTouchStartX(null);
  }, [touchStartX, prev, next]);

  return (
    <section
      id="events"
      ref={containerRef}
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-cream-2 py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                📸 События
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
              >
                Чем мы живём
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-base text-ink/60 font-display italic">
              Реальные мероприятия нашей команды. Нажмите на фото, чтобы рассмотреть.
            </p>
          </Reveal>
        </div>

        {/* Enhanced Category Filter — animated underline + count badges */}
        <Reveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Фильтр событий по типу"
            className="mt-12 flex flex-wrap items-center gap-1 sm:gap-2"
          >
            {EVENT_CATEGORIES.map((cat) => {
              const isActive = category === cat;
              const count = categoryCounts[cat] || 0;
              
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setCategory(cat);
                    setOpen(null);
                  }}
                  className={`group relative min-h-[44px] whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm ${
                    isActive
                      ? "text-white"
                      : "border border-border-line bg-white text-ink/70 hover:border-gold hover:text-gold"
                  }`}
                >
                  {/* Active background with gradient */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-terracotta shadow-md shadow-gold/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Button content */}
                  <span className="relative flex items-center gap-2">
                    {cat}
                    {/* Count badge */}
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-mono transition-colors duration-300 ${
                      isActive 
                        ? "bg-white/25 text-white" 
                        : "bg-cream-2 text-ink/50 group-hover:bg-gold/10 group-hover:text-gold"
                    }`}>
                      {count}
                    </span>
                  </span>
                  
                  {/* Animated underline for inactive state */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold to-terracotta transition-all duration-300 group-hover:w-3/4" />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Masonry Grid — CSS columns with layout animations */}
        <motion.div
          layout
          className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-3 [&>*]:mb-4"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, i) => (
              <GalleryItem
                key={`${item.src}-${item.caption}-${category}`}
                item={item}
                index={i}
                onClick={() => setOpen(i)}
                reducedMotion={prefersReducedMotion ?? false}
              />
            ))}
          </AnimatePresence>
          
          {/* Empty state when no items match filter */}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <p className="font-display text-xl text-ink/40 italic">
                Нет фотографий в этой категории
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Load more button — pagination reveal */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + 8)}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-gold/40 bg-gradient-to-r from-gold/10 to-transparent px-7 py-3.5 text-sm font-semibold text-gold transition-all hover:border-gold hover:from-gold hover:to-terracotta hover:text-white hover:shadow-lg hover:-translate-y-0.5 min-h-[44px]"
            >
              Показать ещё
              <span className="font-mono text-[11px] opacity-70">
                +{remainingCount}
              </span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink/40">
              Показано {visibleItems.length} из {items.length}
            </p>
          </motion.div>
        )}
      </div>

      {/* Phase 9 P2 wow-factor: Pinned horizontal-scroll gallery.
          Only on lg+ desktop and non-reduced-motion. Mobile/reduced-motion
          users see the masonry grid above. */}

      <Phase9PinnedHorizontalGallery items={visibleItems} prefersReducedMotion={prefersReducedMotion ?? false} />

      {/* Enhanced Lightbox — professional gallery experience */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink/95 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          >
            {/* Top bar — counter + close button */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6">
              {/* Counter with animated numbers */}
              <div className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <AnimatedCounter current={open} total={items.length} />
              </div>
              
              {/* Close button */}
              <button
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                onClick={close}
                aria-label="Закрыть (Esc)"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Keyboard shortcuts hint — shown briefly on open */}
            <AnimatePresence>
              {showKeyboardHint && !prefersReducedMotion && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-20 left-1/2 z-30 -translate-x-1/2 hidden md:flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md"
                >
                  <Keyboard className="size-4 text-white/60" />
                  <span className="text-xs text-white/70">
                    <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">←</kbd>
                    {" "}
                    <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">→</kbd>
                    {" "}навигация ·{" "}
                    <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
                    {" "}закрыть
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile swipe hint */}
            <div className="absolute bottom-28 left-1/2 z-30 -translate-x-1/2 flex md:hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
              <MousePointer className="size-4 text-white/60" />
              <span className="text-[10px] text-white/60">Свайп для навигации</span>
            </div>

            {/* Navigation buttons */}
            <button
              className="absolute left-3 z-20 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 md:left-6"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Предыдущее (←)"
            >
              <ChevronLeft className="size-7" />
            </button>

            {/* Main image display */}
            <motion.div
              key={open}
              className="relative w-full max-h-[65vh] max-w-5xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-2xl"
                style={{ touchAction: "pan-y pinch-zoom" }}
              >
                <Image
                  src={items[open].src}
                  alt={items[open].caption}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                
                {/* Subtle vignette overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
                  }}
                />
              </div>
              
              {/* Caption below image */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center px-4">
                <span className="rounded-full bg-gold/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-gold border border-gold/30">
                  {items[open].category}
                </span>
                <p className="font-display text-lg md:text-xl text-white">
                  {items[open].caption}
                </p>
              </div>
            </motion.div>

            <button
              className="absolute right-3 z-20 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 md:right-6"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Следующее (→)"
            >
              <ChevronRight className="size-7" />
            </button>

            {/* Thumbnail strip at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-ink via-ink/90 to-transparent pt-8 pb-4 px-4 md:px-6">
              <ThumbnailStrip
                items={items}
                currentIndex={open}
                onSelect={(i) => setOpen(i)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/**
 * Phase9PinnedHorizontalGallery — pinned horizontal-scroll gallery band.
 *
 * Phase 9 P2 wow-factor pattern (AGENTS.md §14 backlog).
 * 300vh outer wrapper holds a sticky 100vh inner container. As the user
 * scrolls vertically through the section, the gallery translates left
 * horizontally via useScroll + useTransform (x: ['0%', '-70%']).
 *
 * Only on lg+ desktop AND non-reduced-motion. Mobile/reduced-motion users
 * see the existing masonry grid (above) — horizontal scroll is annoying
 * on touch and triggers vestibular issues for reduced-motion users.
 *
 * `mounted` gate prevents SSR/CSR hydration mismatch from useReducedMotion
 * null→boolean transition.
 */
function Phase9PinnedHorizontalGallery({
  items,
  prefersReducedMotion,
}: {
  items: typeof MEDIA.events;
  prefersReducedMotion: boolean;
}) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);

  // useScroll with target ref + offset for section-aware scroll progress.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Translate the inner horizontal track left as the user scrolls.
  // -70% means the track moves left by 70% of its width (10 cards × ~7% each).
  // Adjust based on items.length if needed (more items = more translation).
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  // Progress bar at the bottom (visual indicator)
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Show only on lg+ desktop and non-reduced-motion and after mount.
  // SSR + initial client render: hide (avoids hydration mismatch).
  const shouldShow = mounted && !prefersReducedMotion && items.length > 3;

  if (!shouldShow) return null;

  return (
    <div ref={ref} className="relative mt-16 h-[300vh] hidden lg:block">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-ink py-16">
        {/* Eyebrow + caption */}
        <div className="mx-auto mb-6 max-w-7xl px-5 md:px-8">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
            <MousePointer className="size-3" />
            Прокрутите вниз — события движутся вбок
          </span>
          <h3
            className="mt-3 font-display text-cream"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", lineHeight: 1.1 }}
          >
            Горизонтальная лента{" "}
            <span className="gradient-text italic">событий</span>
          </h3>
        </div>

        {/* Horizontal track — translates left as user scrolls */}
        <motion.div
          style={{ x }}
          className="flex gap-6 px-[5vw] will-change-transform"
        >
          {items.map((item, i) => (
            <div
              key={`pinned-${item.src}-${i}`}
              className="relative aspect-[4/5] w-[55vw] shrink-0 overflow-hidden rounded-3xl border border-cream/10 shadow-2xl shadow-ink/50 md:w-[35vw] lg:w-[25vw] xl:w-[20vw]"
            >
              <Image
                src={item.src}
                alt={item.caption}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, 35vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                loading="lazy"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden="true" />
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">
                <span className="font-mono text-[10px] uppercase tracking-wider text-gold/80">
                  {String(i + 1).padStart(2, "0")} · {item.category}
                </span>
                <p className="mt-1 font-display text-lg leading-tight">
                  {item.caption}
                </p>
              </div>
              {/* Card number badge */}
              <span className="absolute right-4 top-4 z-10 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cream backdrop-blur-md">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Progress bar at bottom */}
        <div className="mx-auto mt-8 max-w-7xl px-5 md:px-8">
          <div className="h-0.5 w-full bg-cream/15">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-gold to-terracotta"
              style={{ scaleX: progressScaleX }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
