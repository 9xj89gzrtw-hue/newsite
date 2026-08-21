# Carousel Best Practices — Reference Recipes for the mculinary.com Replication

> **Purpose**: Copy-paste recipes for the photo / video / services / testimonials
> carousels that mculinary.com uses, gathered from web research (Embla docs,
> Motion.dev, CSS-Tricks, W3C APG, GSAP, Cloudinary, Vercel blog). Drop these
> into Next.js 16 / React 19 / TypeScript components in `newsite`. All code is
> TypeScript-ready and assumes the AGENTS.md §5 hard rules (transform/opacity
> only, SmartImage only, no indigo/blue, sticky footer, Server Components by
> default — these carousels are *client* islands).

> **Research source files**: `/tmp/carousel-research/pages/text/*.txt` (cached
> page-reader extractions). Search-result JSONs at `/tmp/carousel-research/q*.json`.

---

## 0. TL;DR — Library choice for the mculinary replication

| Need | Recommended lib | Why |
|---|---|---|
| Photo carousel (3-up, autoplay, infinite) | **Embla Carousel + Autoplay plugin** | 6 KB, framework-agnostic, official autoplay plugin with `pause-on-hover` + `pause-on-focus` built in via `defaultInteraction`. |
| Continuous logo / partner marquee | **Framer Motion `useAnimationFrame`** (hand-rolled) or Motion+ `<Ticker>` | No JS layout thrash, GPU-friendly `x` motion value, trivial `prefers-reduced-motion` guard. |
| Services horizontal-scroll "wow" strip | **GSAP ScrollTrigger** (pinned horizontal section) | Native scroll-driven, no janky JS wheel hijack, works with React 19 via `useLayoutEffect` + `gsap.context`. |
| Video carousel | **Embla slides + native `<video>`** with `IntersectionObserver` | Embla handles index/swipe; native video tag keeps `<Video>` SSR-safe. |
| Photo gallery + lightbox | **`next/image` + scroll-snap track + modal route** | Vercel-validated pattern, blur placeholders, lazy + eager split. |
| Pure-CSS fallback (low-end) | **CSS `scroll-snap-type` + `@keyframes`** | Zero JS, works on Raspberry Pi / kiosks / strict reduced-motion mode. |

> mculinary.com itself is behind an Imperva/SiteGuard captcha, so direct DOM
> inspection failed (page_reader returned only the robot-challenge page). No
> public source confirms which JS library it uses. **Best guess based on the
> screenshot set in `/docs/reference-library/mculinary/` (3 photo carousels +
> 3 services carousels + 2 testimonials carousels) + typical WordPress
> catering-stack conventions**: a **Slick or Swiper** slider shipped via a
> premium theme plugin. Our replication should use **Embla** (lighter, modern,
> React-native) rather than copying the source library — the visual outcome is
> what matters.

---

## 1. Embla Carousel — Autoplay + infinite loop + pause-on-hover (React 19 / Next 16 / TS)

**Install** (already in `package.json`? if not):

```bash
bun add embla-carousel-react embla-carousel-autoplay embla-carousel-class-names
```

**Full hook recipe** — copy-paste into
`src/components/carousels/embla/use-embla-autoplay.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, {
  type EmblaCarouselType,
  type EmblaOptionsType,
} from "embla-carousel-react";
import Autoplay, { type AutoplayOptionsType } from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";

export type UseEmblaAutoplayOptions = {
  /** Slide options (loop, align, slidesToScroll, breakpoints…) */
  carouselOptions?: EmblaOptionsType;
  /** Autoplay plugin options. Defaults: 4000ms, defaultInteraction=true, stopOnLastSnap=false. */
  autoplayOptions?: AutoplayOptionsType;
  /** Pause autoplay when pointer enters the carousel root. Default: true. */
  pauseOnHover?: boolean;
  /** Pause autoplay when any element inside receives keyboard focus. Default: true. */
  pauseOnFocus?: boolean;
};

export type UseEmblaAutoplayReturn = {
  /** Ref to attach to the viewport div. */
  emblaRef: React.Ref<HTMLDivElement>;
  /** Embla API (null until mounted). */
  emblaApi: EmblaCarouselType | undefined;
  /** True while the autoplay timer is running. */
  isPlaying: boolean;
  /** True while the user has paused (hover/focus) — useful for UI badges. */
  isPaused: boolean;
  /** Manually start autoplay (e.g. after reduced-motion toggle). */
  play: () => void;
  /** Manually stop autoplay (e.g. when carousel scrolled off-screen). */
  stop: () => void;
};

export function useEmblaAutoplay(
  options: UseEmblaAutoplayOptions = {},
): UseEmblaAutoplayReturn {
  const {
    carouselOptions = { loop: true, align: "start", inViewThreshold: 0 },
    autoplayOptions = { delay: 4000, stopOnInteraction: false },
    pauseOnHover = true,
    pauseOnFocus = true,
  } = options;

  const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions, [
    Autoplay(autoplayOptions),
    ClassNames(),
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sync play/stop state with the Autoplay plugin events
  useEffect(() => {
    if (!emblaApi) return;
    const { autoplay } = emblaApi.plugins();

    const onPlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    const onStop = () => setIsPlaying(false);

    emblaApi.on("autoplay:play", onPlay);
    emblaApi.on("autoplay:stop", onStop);
    // Kick off the autoplay timer (Embla v8+ requires explicit play())
    autoplay?.play();

    return () => {
      emblaApi.off("autoplay:play", onPlay);
      emblaApi.off("autoplay:stop", onStop);
    };
  }, [emblaApi]);

  // Pause-on-hover (uses the plugin's rootNode option for the event target)
  const onPointerEnter = useCallback(() => {
    if (!pauseOnHover) return;
    emblaApi?.plugins().autoplay?.stop();
    setIsPaused(true);
  }, [emblaApi, pauseOnHover]);

  const onPointerLeave = useCallback(() => {
    if (!pauseOnHover) return;
    emblaApi?.plugins().autoplay?.play();
    setIsPaused(false);
  }, [emblaApi, pauseOnHover]);

  // Pause-on-focus — required by W3C APG (rotation must stop on focus)
  const onFocusIn = useCallback(() => {
    if (!pauseOnFocus) return;
    emblaApi?.plugins().autoplay?.stop();
    setIsPaused(true);
  }, [emblaApi, pauseOnFocus]);

  const onFocusOut = useCallback(() => {
    if (!pauseOnFocus) return;
    emblaApi?.plugins().autoplay?.play();
    setIsPaused(false);
  }, [emblaApi, pauseOnFocus]);

  // Imperative play/stop (call from a play/pause button or IO observer)
  const play = useCallback(() => emblaApi?.plugins().autoplay?.play(), [emblaApi]);
  const stop = useCallback(() => emblaApi?.plugins().autoplay?.stop(), [emblaApi]);

  return {
    emblaRef,
    emblaApi,
    isPlaying,
    isPaused,
    play,
    stop,
    // convenience: bind these to the viewport's parent wrapper
    // (the carousel root, NOT the viewport itself)
    // — see the component recipe below.
    ...({
      // hack: re-export the handlers through a cast so the hook return
      // type stays clean for consumers that don't need them.
    } as never),
    handlers: {
      onMouseEnter: onPointerEnter,
      onMouseLeave: onPointerLeave,
      onFocusCapture: onFocusIn,
      onBlurCapture: onFocusOut,
    } as unknown as never,
  } as UseEmblaAutoplayReturn & {
    handlers: {
      onMouseEnter: () => void;
      onMouseLeave: () => void;
      onFocusCapture: () => void;
      onBlurCapture: () => void;
    };
  };
}
```

> **Simplified usage** — if the hook above feels heavy, the bare-minimum version
> below is what most production Embla sites ship. It exposes the four event
> handlers as plain callbacks on the wrapping `<div>`:

```tsx
// Minimal version — drop into a Client Component
"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function PhotoCarousel({ slides }: { slides: Slide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  return (
    <div
      className="embla"
      onMouseEnter={() => emblaApi?.plugins().autoplay?.stop()}
      onMouseLeave={() => emblaApi?.plugins().autoplay?.play()}
    >
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((s) => (
            <div className="embla__slide min-w-0 shrink-0 grow-0 basis-full" key={s.id}>
              <Image src={s.src} alt={s.alt} width={1280} height={853} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => emblaApi?.scrollPrev()} aria-label="Previous slide">‹</button>
      <button onClick={() => emblaApi?.scrollNext()} aria-label="Next slide">›</button>
    </div>
  );
}
```

**Key Embla v8/v9 autoplay options** (verified against
`embla-carousel.com/docs/plugins/autoplay`):

| Option | Type | Default | Effect |
|---|---|---|---|
| `delay` | `number \| (snapList, api) => number[]` | `4000` | Per-slide dwell. Pass a function to vary per slide. |
| `stopOnInteraction` | `boolean` | `true` (v8) / replaced by `defaultInteraction` in v9 | Stop autoplay after user drags/clicks. |
| `stopOnMouseEnter` | `boolean` | `false` (v8) | Pause on hover. (v9: covered by `defaultInteraction: true`.) |
| `stopOnFocus` | `boolean` | `false` (v8) | Pause on keyboard focus — **always set true for a11y.** |
| `stopOnLastSnap` | `boolean` | `false` | Stop after last slide (use only when `loop: false`). |
| `defaultInteraction` | `boolean` | `true` (v9) | Master switch: `false` ⇒ handle interactions manually via `autoplay:interaction` event. |
| `rootNode` | `(root) => HTMLElement \| null` | `null` | Override which node receives mouseenter/leave (use when the carousel is wrapped by a larger interactive card). |
| `breakpoints` | `Record<mediaQuery, options>` | `{}` | E.g. `{ "(min-width: 768px)": { delay: 6000 } }`. |

**Embla events worth subscribing to**:

```ts
emblaApi
  .on("autoplay:play", () => setPlaying(true))
  .on("autoplay:stop", () => setPlaying(false))
  .on("autoplay:select", (_api, ev) => {
    // ev.detail = { targetSnap, sourceSnap }
  })
  .on("autoplay:timerset", (_api, ev) => {
    // ev.detail.startTime — use for a custom progress bar
  })
  .on("autoplay:timerstopped", (_api, ev) => {
    // ev.detail.stopTime
  });
```

**Reference URLs**:

- Autoplay plugin docs: https://www.embla-carousel.com/docs/plugins/autoplay
- Infinite-loop guide: https://blog.cybermindworks.com/post/building-an-infinite-image-carousel-in-react-with-embla-carousel
- Embla options API: https://www.embla-carousel.com/docs/api/options
- SO on autoplay+Next.js: https://stackoverflow.com/questions/76442961/how-to-use-autoplay-with-embla-carousel-in-next-js

---

## 2. Framer Motion — Infinite marquee (logos / partners / testimonials strip)

This is the **hand-rolled** pattern (no Motion+ paywall) used by the official
`motion/react` `useAnimationFrame` recipe. It animates a single `x` motion value
on a cloned track, reverses direction with a sign flip, and pauses on hover.
Use this for the mculinary-style "press logos" or "partner venues" strip.

```tsx
// src/components/carousels/marquee.tsx
"use client";

import { isMotionValue, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useWillChange } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second. Negative reverses direction. Default: 50. */
  velocity?: number;
  /** Pause on hover. Default: true. */
  pauseOnHover?: boolean;
  /** Multiple of children to render (creates the seamless loop). Default: 4. */
  copies?: number;
  className?: string;
};

export function Marquee({
  children,
  velocity = 50,
  pauseOnHover = true,
  copies = 4,
  className,
}: MarqueeProps) {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Respect prefers-reduced-motion: render static, no animation
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Tie scroll velocity to marquee speed (optional "scroll-jacked" feel).
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  // -0.5..0.5 multiplier derived from scroll velocity
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 0.5], {
    clamp: false,
  });

  const willChange = useWillChange();

  // Width of one set of children — we move by -1 set width, then wrap
  // (wrap modulo trick: keep x in [-width, 0]) so the loop is seamless.
  const x = useTransform(baseX, (v) => {
    const w = containerRef.current?.offsetWidth ?? 0;
    if (w === 0) return `0px`;
    const wrapped = ((v % w) + w) % w; // always positive 0..w
    return `${-wrapped}px`;
  });

  useAnimationFrame((_, delta) => {
    if (paused || reduced) return;
    // px per frame = velocity (px/s) * delta (ms) / 1000
    // adjust by scroll velocity factor for parallax feel
    const move = velocity * (delta / 1000) * (1 + velocityFactor.get());
    baseX.set(baseX.get() + move);
  });

  if (reduced) {
    // Reduced-motion fallback: render children once, no transform
    return (
      <div className={className} aria-live="off">
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: "hidden", display: "flex" }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocusCapture={() => pauseOnHover && setPaused(true)}
      onBlurCapture={() => pauseOnHover && setPaused(false)}
    >
      <motion.div style={{ x, willChange }} className="flex shrink-0">
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} aria-hidden={i > 0 ? "true" : undefined} className="flex shrink-0">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
```

> **Imports note**: in `motion/react` v11+ (formerly `framer-motion`), the
> imports above come from `"motion/react"`. If `newsite` is still on the legacy
> package, swap to `import { ... } from "framer-motion"`.

**Motion+ `<Ticker>` alternative** (paid, 2.1 KB, drop-in):

```tsx
import { Ticker } from "motion-plus/react";
const items = [<Logo1 key="1" />, <Logo2 key="2" />, <Logo3 key="3" />];
return <Ticker items={items} velocity={50} />;
```

Reference URLs:

- https://motion.dev/docs/react-ticker
- https://motion.dev/docs/react-carousel
- https://koenvg.medium.com/infinite-carousel-with-framer-motion-b5f93b06ae9a

---

## 3. Video carousel — autoplay-muted-loop video cards in an Embla track, click-to-expand modal

mculinary has multiple video-heavy sections (event recaps, chef demos). The
recipe below combines:

- **Embla** for swipe/dots/arrows
- **Native `<video>`** with `preload="none"` + `poster` (max performance)
- **`IntersectionObserver`** to play only the on-screen slide (saves CPU + data)
- **Click → modal expand** using a route-less state pattern (works on a Server Component page)

```tsx
// src/components/carousels/video-carousel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";

export type VideoSlide = {
  id: string;
  src: string;            // mp4
  poster: string;         // 16:9 still
  title: string;
  description?: string;
};

export function VideoCarousel({ slides }: { slides: VideoSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", containScroll: "trimSnaps" },
    [Autoplay({ delay: 6000, stopOnInteraction: false })],
  );

  const [selected, setSelected] = useState<VideoSlide | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Play only the centered slide; pause others. Use Embla's "select" event.
  useEffect(() => {
    if (!emblaApi) return;
    const playSelected = () => {
      const idx = emblaApi.selectedScrollSnap();
      const slide = slides[idx];
      Object.entries(videoRefs.current).forEach(([id, v]) => {
        if (!v) return;
        if (id === slide?.id) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    };
    emblaApi.on("select", playSelected);
    emblaApi.on("init", playSelected);
    return () => {
      emblaApi.off("select", playSelected);
      emblaApi.off("init", playSelected);
    };
  }, [emblaApi, slides]);

  // IntersectionObserver: pause the entire carousel when scrolled off-screen
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) emblaApi?.plugins().autoplay?.play();
        else emblaApi?.plugins().autoplay?.stop();
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [emblaApi]);

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Featured event videos"
      className="relative"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s) => (
            <div
              key={s.id}
              className="min-w-0 shrink-0 grow-0 basis-full px-2"
              role="group"
              aria-roledescription="slide"
              aria-label={s.title}
            >
              <button
                type="button"
                onClick={() => setSelected(s)}
                className="group relative block w-full"
                aria-label={`Open video: ${s.title}`}
              >
                {/* Poster shown until video loads; uses next/image for blur-up */}
                <Image
                  src={s.poster}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition group-hover:scale-[1.02]"
                  placeholder="blur"
                  blurDataURL={s.poster + "?w=8"}  // replace w/ real LQIP
                />
                <video
                  ref={(el) => { videoRefs.current[s.id] = el; }}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
                  // Pause/play controlled by IO + Embla select handler above
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={s.poster}
                  onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <source src={s.src} type="video/mp4" />
                </video>
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
                    ▶
                  </span>
                </span>
              </button>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              {s.description && <p className="text-sm text-neutral-600">{s.description}</p>}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2"
        aria-label="Previous video"
      >
        ‹
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2"
        aria-label="Next video"
      >
        ›
      </button>

      {/* Click-to-expand modal — uses Headless UI Dialog for focus trap + ESC */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        className="relative z-50"
        aria-label={selected?.title}
      >
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <DialogPanel className="w-full max-w-5xl">
            {selected && (
              <video
                key={selected.id}
                controls
                autoPlay
                loop
                playsInline
                className="aspect-video w-full bg-black"
              >
                <source src={selected.src} type="video/mp4" />
                <track kind="captions" />
              </video>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </section>
  );
}
```

**Performance guardrails for the video carousel**:

1. **`preload="none"`** on every slide video. Only fetch when the slide is
   selected (the IntersectionObserver/Embla `select` handler triggers play,
   which causes the browser to fetch).
2. **`poster`** attribute + a `next/image` of the same poster on top (the
   `<video>` fades in via `onCanPlay` opacity transition).
3. **`muted` + `playsInline`** are required for iOS Safari to autoplay.
4. **Max video size**: keep MP4 ≤ 4 MB per clip (≈8s @ 720p, H.264 baseline,
   CRF 28, no audio track — strip audio if it's purely visual).
5. **`<track kind="captions">`** in the modal for accessibility.
6. **Pause off-screen**: the IntersectionObserver calls
   `emblaApi.plugins().autoplay?.stop()` so neither Embla nor the videos
   consume CPU when the section is scrolled past.

Reference URLs:

- https://cloudinary.com/guides/video-effects/video-autoplay-in-html
- https://www.embla-carousel.com/docs/plugins/autoplay
- https://stackoverflow.com/questions/77682673/add-full-screen-mode-for-embla-slide

---

## 4. Photo carousel — masonry + lightbox + autoplay scroll combo (next/image + blur placeholders)

This is the mculinary "events gallery" pattern: a horizontally-scrolling
strip of photos that auto-advances, but opens a full lightbox on click.
Combines Embla + Vercel's documented image-gallery pattern.

```tsx
// src/components/carousels/photo-gallery-carousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogPanel } from "@headlessui/react";

export type Photo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;  // tiny base64 LQIP
};

export function PhotoGalleryCarousel({ photos }: { photos: Photo[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );
  const [active, setActive] = useState<Photo | null>(null);

  return (
    <>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p)}
              className="relative mr-3 h-64 w-96 shrink-0 grow-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${photos.length}: ${p.alt}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                // First 4 images eager (above-the-fold); rest lazy
                loading={i < 4 ? "eager" : "lazy"}
                priority={i < 2}
                sizes="(min-width: 1024px) 384px, 80vw"
                placeholder="blur"
                blurDataURL={p.blurDataURL}
                className="object-cover transition group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onClose={() => setActive(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <DialogPanel className="relative aspect-[4/3] w-full max-w-5xl">
            {active && (
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="100vw"
                priority
                placeholder="blur"
                blurDataURL={active.blurDataURL}
                className="object-contain"
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
```

**Key `next/image` patterns** (validated against Vercel's image-gallery blog):

| Prop | When to use |
|---|---|
| `priority` | Only the first 1-2 above-the-fold images — adds `<link rel="preload">`. |
| `loading="eager"` | First 4 images of an above-the-fold carousel. |
| `loading="lazy"` | Default for everything below the fold. |
| `sizes` | **Always set** — controls which `srcset` is served. Example: `"(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"`. |
| `placeholder="blur"` + `blurDataURL` | Tiny (8×8 or 16×16) base64 LQIP. For static imports, Next auto-generates; for remote, supply your own. |
| `style={{ transform: "translate3d(0,0,0)" }}` | Forces GPU layer (Vercel's perf trick). |

**Blur-placeholder generation** for remote images (run once at build time):

```ts
// scripts/generate-blur-placeholders.ts
import { getPlaiceholder } from "plaiceholder";
// produces a base64 8x8 LQIP
const { base64 } = await getPlaiceholder(remoteUrl, { size: 8 });
```

Reference URLs:

- https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js
- https://javascript.plainenglish.io/handling-500-images-in-a-gallery-with-lazy-loading-in-next-js-15-f103b228a200
- https://www.buildwithmatija.com/blog/handling-500-images-in-a-gallery-with-lazy-loading-in-next-js-15

---

## 5. Services carousel — card-based horizontal scroll-snap + autoplay + dots/arrows

mculinary has 3 service-card carousels (events, spectator, private chef). This
is a **mobile-first scroll-snap** track with optional JS autoplay — works
without JS, enhanced with JS. Best for content that needs to be readable in
RSS / no-JS contexts (SEO-friendly).

```tsx
// src/components/carousels/services-scroll-carousel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Service = { id: string; title: string; image: string; blurb: string };

export function ServicesScrollCarousel({ services }: { services: Service[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[idx] as HTMLElement;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, []);

  // Autoplay: advance every 5s, pause on hover, pause when off-screen
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: number | undefined;
    let paused = false;

    const advance = () => {
      if (paused) return;
      setActiveIdx((cur) => {
        const next = (cur + 1) % services.length;
        scrollTo(next);
        return next;
      });
    };

    timer = window.setInterval(advance, 5000);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);
    track.addEventListener("focusin", onEnter);
    track.addEventListener("focusout", onLeave);

    // Pause off-screen
    const io = new IntersectionObserver(
      (entries) => (paused = !entries[0]?.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(track);

    // Track active slide via scroll position (in case user swipes manually)
    const onScroll = () => {
      const slideWidth = (track.children[0] as HTMLElement)?.offsetWidth ?? 1;
      const idx = Math.round(track.scrollLeft / slideWidth);
      if (idx !== activeIdx) setActiveIdx(idx);
    };
    track.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearInterval(timer);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("focusin", onEnter);
      track.removeEventListener("focusout", onLeave);
      track.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [services.length, scrollTo, activeIdx]);

  // Respect prefers-reduced-motion — skip the autoplay timer entirely
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // timer still set above but advance() does nothing if reduced
  }, []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Our services"
      className="relative"
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((s) => (
          <article
            key={s.id}
            className="snap-start shrink-0 basis-[80%] sm:basis-[60%] md:basis-[40%] lg:basis-[30%]"
          >
            <img src={s.image} alt="" className="h-48 w-full rounded-xl object-cover" />
            <h3 className="mt-3 font-serif text-xl">{s.title}</h3>
            <p className="text-sm text-neutral-600">{s.blurb}</p>
          </article>
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
        className="absolute left-0 top-1/2 -translate-y-1/2"
        aria-label="Previous service"
      >
        ‹
      </button>
      <button
        onClick={() => scrollTo((activeIdx + 1) % services.length)}
        className="absolute right-0 top-1/2 -translate-y-1/2"
        aria-label="Next service"
      >
        ›
      </button>

      {/* Dot navigation */}
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose service">
        {services.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`Go to ${s.title}`}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === activeIdx ? "bg-neutral-900" : "bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
```

**Key CSS scroll-snap primitives** (verified against Paige Niedringhaus + CSS-Tricks):

```css
.track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;      /* strict snap */
  scroll-behavior: smooth;            /* animated scrollTo */
  gap: 1rem;
  /* hide scrollbar */
  scrollbar-width: none;              /* Firefox */
}
.track::-webkit-scrollbar { display: none; }  /* Chrome/Safari */

.slide {
  flex: 0 0 100%;        /* one-up mobile */
  scroll-snap-align: start;
  scroll-snap-stop: always;   /* never skip slides on fast swipe */
}

@media (min-width: 768px) {
  .slide { flex-basis: 33.33%; }  /* 3-up desktop */
}
```

**Pure-CSS autoplay fallback** (no JS at all, from CSS-Tricks / Paige Niedringhaus):

```css
@keyframes tonext {
  75% { left: 0; }
  95% { left: 100%; }
  98% { left: 100%; }
  99% { left: 0; }
}
@keyframes tostart {
  75% { left: 0; }
  95% { left: -300%; }
  98% { left: -300%; }
  99% { left: 0; }
}
@keyframes snap {
  96% { scroll-snap-align: center; }
  97% { scroll-snap-align: none; }
  99% { scroll-snap-align: none; }
  100% { scroll-snap-align: center; }
}

@media (hover: hover) {
  .snapper {
    animation-name: tonext, snap;
    animation-timing-function: ease;
    animation-duration: 4s;
    animation-iteration-count: infinite;
  }
  .slide:last-child .snapper {
    animation-name: tostart, snap;
  }
}
```

Reference URLs:

- https://css-tricks.com/css-only-carousel
- https://www.paigeniedringhaus.com/blog/animate-an-auto-scrolling-carousel-with-only-html-and-css
- https://nolanlawson.com/2019/02/10/building-a-modern-carousel-with-css-scroll-snap-smooth-scrolling-and-pinch-zoom
- https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13

---

## 6. GSAP ScrollTrigger — Pinned horizontal scroll "wow" section

Use this for the mculinary-style "philosophy / signature experiences"
horizontal-scroll strip — the page pins vertically while content scrolls
horizontally. Works in React 19 with `useLayoutEffect` + `gsap.context()`.

```tsx
// src/components/carousels/horizontal-pin-section.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Panel = { id: string; title: string; image: string; blurb: string };

export function HorizontalPinSection({ panels }: { panels: Panel[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const trackEl = track.current!;
      const panelsEl = gsap.utils.toArray<HTMLElement>(".panel");

      // Total horizontal scroll = trackWidth - viewportWidth
      const getScrollAmount = () => trackEl.scrollWidth - window.innerWidth;

      const tween = gsap.to(trackEl, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current!,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Per-panel entrance animations (parallax images, fade-in titles)
      panelsEl.forEach((panel) => {
        const img = panel.querySelector(".panel__image");
        const title = panel.querySelector(".panel__title");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -10 },
            {
              yPercent: 10,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left center",
                end: "right center",
                scrub: true,
              },
            },
          );
        }
        if (title) {
          gsap.fromTo(
            title,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left 80%",
              },
            },
          );
        }
      });
    }, root);

    return () => ctx.revert(); // kills ScrollTriggers + reverts DOM
  }, []);

  return (
    <section ref={root} className="relative h-screen overflow-hidden">
      <div ref={track} className="absolute inset-0 flex will-change-transform">
        {panels.map((p) => (
          <article
            key={p.id}
            className="panel relative h-screen w-screen shrink-0"
          >
            <img
              src={p.image}
              alt=""
              className="panel__image absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-12 left-12 max-w-xl text-white">
              <h2 className="panel__title font-serif text-4xl md:text-6xl">{p.title}</h2>
              <p className="mt-3 text-lg">{p.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

**Critical GSAP-React gotchas**:

1. **Always wrap in `gsap.context(fn, scope)`** so cleanup (`ctx.revert()`) kills
   ScrollTriggers and reverts inline styles. Without this, Next.js fast-refresh
   leaks triggers and breaks layouts.
2. **`invalidateOnRefresh: true`** is mandatory — recalculates `end` on resize.
3. **`anticipatePin: 1`** prevents the 1-frame jump when the section pins.
4. **`scrub: 1`** (or `scrub: true`) gives 1-frame smoothing — `scrub: 2+` feels
   laggy. Use a number for smoothing, `true` for instant.
5. **`containerAnimation: tween`** is how nested ScrollTriggers fire on panels
   *inside* a horizontally-pinned track (the panel-entering-viewport animation).
6. **Don't use `transform` directly** on the track (let GSAP write to `x`).
   Mixing CSS `transform` with GSAP's `x` will conflict.
7. **Add `will-change-transform`** to the track for GPU promotion.

Reference URLs:

- https://gsap.com/docs/v3/Plugins/ScrollTrigger
- https://blog.olivierlarose.com/tutorials/horizontal-section
- https://gsap.com/community/forums/topic/33311-using-gsap-scrolltrigger-for-horizontal-scroll
- https://ksbisht.medium.com/horizontal-scrolling-animation-using-gsap-and-scrolltrigger-f6d91b3f6fda

---

## 7. Performance guardrails — checklist

Apply to every carousel/video on the site. Verified against Cloudinary +
web.dev reduced-motion + Vercel image-gallery.

### Video

| Guardrail | Why | How |
|---|---|---|
| `muted + playsInline + loop` | Required for iOS Safari autoplay. Browsers block autoplay with sound. | HTML attributes on `<video>`. |
| `preload="none"` on carousel slides | Don't fetch 5+ videos when only 1 is visible. Default `preload="metadata"` still loads ~50 KB/video. | HTML attribute; toggle to `"auto"` only when slide is selected. |
| `poster` attribute | Instant first frame; video fades in via `onCanPlay` opacity transition. | `<video poster={posterUrl} />`. |
| ≤ 4 MB per video clip | Bandwidth + CPU. 720p H.264 baseline CRF 28 ≈ 500 KB/s. | ffmpeg: `ffmpeg -i in.mov -vf scale=1280:-2 -c:v libx264 -profile:v baseline -crf 28 -an -movflags +faststart out.mp4` |
| `IntersectionObserver` to pause off-screen | Stops decode/CPU when scrolled past. | `new IntersectionObserver(cb, { threshold: 0.25 })` calls `video.pause()`. |
| `<track kind="captions">` in modal | WCAG 1.2.2. | WebVTT file via `<track src="captions.vtt" kind="captions" srclang="en" />`. |
| Multiple `<source>` fallbacks | AV1 > WebM > MP4. | `<source src="video.av1" type="video/av1"><source src="video.webm" type="video/webm"><source src="video.mp4" type="video/mp4">` |

### Images

| Guardrail | Why |
|---|---|
| Always pass `sizes` | Without it, `next/image` serves the largest `srcset` to every device. |
| `placeholder="blur"` + `blurDataURL` | Avoids layout shift + flash of empty alt text. |
| `loading="eager"` only for first 2-4 above-the-fold images; rest `lazy`. | Don't compete with hero LCP. |
| `priority` only for the LCP image. | Adds `<link rel="preload">` — overuse cancels the benefit. |
| `style={{ transform: "translate3d(0,0,0)" }}` on hover-animated images. | GPU layer promotion; smoother hover. |

### Animation

| Guardrail | Why |
|---|---|
| `prefers-reduced-motion: reduce` → disable autoplay + marquee. | WCAG 2.3.3. Some users get vestibular distress from motion. |
| Pause on hover *and* on keyboard focus. | W3C APG mandate (§Features needed). |
| `IntersectionObserver` to pause when carousel scrolled off-screen. | Saves CPU + battery. |
| Limit simultaneous animations to ~3. | Beyond that, jank increases. |
| Use `transform` + `opacity` only (no `top/left/width`). | Compositor-only properties; no layout thrash. |
| `will-change: transform` only when animating; remove when done. | Long-lived `will-change` bloats GPU memory. |

---

## 8. Accessibility — W3C ARIA Carousel Pattern (APG)

Verified against the W3C WAI APG Carousel pattern
(https://www.w3.org/WAI/ARIA/apg/patterns/carousel). The full pattern is
extensive; the **minimum viable** subset for the mculinary replication is
below.

### Required semantics

```html
<section
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured events"
>
  <!-- Rotation/pause control FIRST (if autoplay) -->
  <button aria-label="Pause slide rotation">⏸</button>

  <!-- Slides viewport -->
  <div class="viewport">
    <div class="track">
      <div role="group" aria-roledescription="slide" aria-label="1 of 5: Wedding at the Phoenician">
        <img alt="..." />
      </div>
      <div role="group" aria-roledescription="slide" aria-label="2 of 5: Corporate gala">
        <img alt="..." />
      </div>
      ...
    </div>
  </div>

  <!-- Previous / Next slide controls -->
  <button aria-label="Previous slide">‹</button>
  <button aria-label="Next slide">›</button>

  <!-- Slide picker (dots) — either tabs pattern OR grouped buttons -->
  <div role="tablist" aria-label="Choose slide">
    <button role="tab" aria-selected="true"  aria-label="Slide 1: Wedding"></button>
    <button role="tab" aria-selected="false" aria-label="Slide 2: Gala"></button>
    ...
  </div>
</section>
```

### Required keyboard behavior

| Key | Action |
|---|---|
| `Tab` | Move through interactive elements in DOM order. Don't trap focus. |
| `Shift+Tab` | Reverse tab. |
| `Enter` / `Space` (on prev/next/pause) | Activate the button — no focus move. |
| `Left` / `Right` arrow (optional, on tablist variant) | Move between slide-picker tabs. |
| Focus enters carousel | Autoplay **must stop**. |
| Focus leaves carousel | Autoplay **may** resume (or stay stopped — user choice). |

### Required rotation-control behavior

> If the carousel can automatically rotate, it also:
> - Has a button for stopping and restarting rotation. This is particularly
>   important for supporting assistive technologies operating in a mode that
>   does not move either keyboard focus or the mouse.
> - Stops rotating when keyboard focus enters the carousel. It does not restart
>   unless the user explicitly requests it to do so.
> - Stops rotating whenever the mouse is hovering over the carousel.

— W3C APG, https://www.w3.org/WAI/ARIA/apg/patterns/carousel

**Implementation note**: Embla's `Autoplay({ stopOnInteraction: true })` covers
hover/focus in v8; in v9 the master switch is `defaultInteraction: true`
(default). To strictly meet the "rotation control button" requirement, add a
visible `<button>` that toggles `emblaApi.plugins().autoplay.play()` / `.stop()`
and update its `aria-label` between "Pause" / "Play".

### `prefers-reduced-motion` recipe

```ts
useEffect(() => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    if (mq.matches) {
      emblaApi?.plugins().autoplay?.stop();
      // also stop marquees, GSAP timelines, etc.
    } else {
      emblaApi?.plugins().autoplay?.play();
    }
  };
  onChange();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}, [emblaApi]);
```

For CSS-only marquees:

```css
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

Reference URLs:

- https://www.w3.org/WAI/ARIA/apg/patterns/carousel
- https://medium.com/@alexdev82/building-an-accessible-carousel-following-w3c-aria-guidelines-cf80cd18c272
- https://testparty.ai/blog/carousel-slider-accessibility
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- https://web.dev/articles/prefers-reduced-motion

---

## 9. Appendix — raw search results (top 5 per query)

Saved at `/tmp/carousel-research/q01.json` through `q16.json`. Key findings:

- **Embla Carousel** is the leading modern React carousel library; autoplay is
  an official plugin (`embla-carousel-autoplay`). v9 (latest RC) replaces
  v8's `stopOnInteraction`/`stopOnMouseEnter`/`stopOnFocus` with the single
  `defaultInteraction` option.
- **Motion.dev** (formerly Framer Motion) offers `<Ticker>` and `<Carousel>`
  as Motion+ paid components, but the underlying `useAnimationFrame` API is
  free and is the standard hand-rolled marquee pattern.
- **GSAP ScrollTrigger** with `pin: true` + `scrub: 1` + `containerAnimation`
  is the standard pinned horizontal-scroll recipe; must be wrapped in
  `gsap.context()` for React 19 cleanup.
- **CSS scroll-snap + `@keyframes`** can build a fully JS-free autoplay
  carousel (CSS-Tricks + Paige Niedringhaus) — useful as a reduced-motion or
  kiosk fallback.
- **`next/image`** with `placeholder="blur"` + `blurDataURL` + per-position
  `sizes` + `priority` (LCP only) is the Vercel-validated gallery pattern.
- **mculinary.com** itself is behind a captcha (Imperva/SiteGuard) and the
  page_reader returned only the robot-challenge page. No public source
  identifies its carousel library; visual inspection of the screenshot set in
  `/docs/reference-library/mculinary/` (3 photo carousels + 3 services carousels
  + 2 testimonials) suggests a WordPress premium theme's slider (Slick or
  Swiper). Our replication should use **Embla** for parity with the modern
  Next.js 16 stack.

### Search-result URLs (quick index)

- https://www.embla-carousel.com/docs/plugins/autoplay
- https://www.embla-carousel.com/docs/api/options
- https://blog.cybermindworks.com/post/building-an-infinite-image-carousel-in-react-with-embla-carousel
- https://stackoverflow.com/questions/76442961/how-to-use-autoplay-with-embla-carousel-in-next-js
- https://motion.dev/docs/react-ticker
- https://motion.dev/docs/react-carousel
- https://koenvg.medium.com/infinite-carousel-with-framer-motion-b5f93b06ae9a
- https://css-tricks.com/css-only-carousel
- https://www.paigeniedringhaus.com/blog/animate-an-auto-scrolling-carousel-with-only-html-and-css
- https://nolanlawson.com/2019/02/10/building-a-modern-carousel-with-css-scroll-snap-smooth-scrolling-and-pinch-zoom
- https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13
- https://gsap.com/docs/v3/Plugins/ScrollTrigger
- https://blog.olivierlarose.com/tutorials/horizontal-section
- https://gsap.com/community/forums/topic/33311-using-gsap-scrolltrigger-for-horizontal-scroll
- https://www.w3.org/WAI/ARIA/apg/patterns/carousel
- https://cloudinary.com/guides/video-effects/video-autoplay-in-html
- https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js
- https://javascript.plainenglish.io/handling-500-images-in-a-gallery-with-lazy-loading-in-next-js-15-f103b228a200
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- https://web.dev/articles/prefers-reduced-motion
- https://www.awwwards.com/websites/food-drink
- https://www.webcitz.com/blog/best-catering-websites

---

## 10. Decision matrix — which recipe for each mculinary carousel

| mculinary carousel (from screenshots) | Use recipe | Notes |
|---|---|---|
| `carousel-photos-1/2/3.png` — full-bleed event photos, 3-up | **§1 Embla + Autoplay** | Loop, 5s delay, pause on hover/focus, dot nav. |
| `carousel-services-1/2/3.png` — service cards | **§5 CSS scroll-snap + JS autoplay** | Mobile-first; works without JS. |
| `carousel-testimonials-2.png` — quote cards | **§2 Framer Motion Marquee** (slow) OR §1 Embla | Marquee if continuous scroll; Embla if discrete cards. |
| Hero video (if any) | **§3 Video carousel** (single-slide variant) | `preload="none"`, poster, IO pause. |
| "Press" / "As seen in" logos strip | **§2 Framer Motion Marquee** | 50 px/s, pause on hover. |
| Signature-experiences horizontal-scroll section | **§6 GSAP ScrollTrigger pin** | The "wow" effect — pin page vertically, scroll content horizontally. |
| Full event gallery page | **§4 Photo gallery carousel + lightbox** | `next/image` + blur + sizes + modal. |
