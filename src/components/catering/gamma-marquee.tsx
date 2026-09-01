"use client";

import * as React from "react";
import Image from "next/image";
import { useMounted } from "@/hooks/use-mounted";

/**
 * GammaMarquee — Cycle 31 NEW. gammacatering.com signature infinite
 * horizontal photo marquee — the "photo scroll effect" the user
 * explicitly called out as a must-have.
 *
 * Source: docs/advanced-technical/site_21_gamma.html §4567-4603
 *   .marquee-slider > .marquee-track > .marquee-item[] (14 portrait
 *   food/event photos). Gamma uses Splide (loop + AutoScroll + free drag)
 *   — we reproduce the same VISUAL result with GSAP
 *   `gsap.to(track, { xPercent: -50, ease: 'none', duration: 40,
 *   repeat: -1 })` (the same -50% seam trick gamma uses for their TEXT
 *   marquee in §4611-4619). Children rendered TWICE for the seamless
 *   -50% loop — when the first set has fully scrolled out of view, the
 *   duplicate set is in the exact position the first started, so the
 *   animation loops without a visible jump.
 *
 * Photos: 14 portrait (~3:4) food/event photos from /media/gamma/ — the
 * same 14 images gamma uses in their homepage .marquee-slider. Each
 * rendered in a uniform `aspect-[3/4]` portrait frame (`w-[280px]` mobile,
 * `w-[300px]` md+) with `next/image fill + object-cover` so every photo
 * occupies an identical box — top/bottom edges align pixel-perfectly
 * regardless of source aspect (VLM critique fix). 32px (mr-8) right
 * margin for editorial breathing room.
 *
 * Section: full-bleed (NO horizontal padding), `overflow: hidden`,
 * `bg-cream` — sits in the natural page flow, default z-index. Edge-fade
 * mask on both sides (`mask-image: linear-gradient(to right, transparent,
 * black 5%, black 95%, transparent)`) so photos dissolve softly at the
 * edges — the same trick gamma uses on their marquee (and the same trick
 * the existing `.cep-marquee-mask` uses in globals.css). Pure photo
 * scroll: NO text overlay, NO eyebrow — per gamma's lead, the marquee is
 * just photos. A 1px hairline top + bottom border in
 * `color-mix(in oklch, var(--ink) 8%, transparent)` frames the band as a
 * filmstrip so the marquee reads as a deliberate band instead of a strip
 * with a harsh bottom cut (VLM critique fix).
 *
 * Height: ~440px on md+ (photos 400px + 20px vertical padding top/bottom
 * via `py-5`; +2px for the two 1px hairlines). Photos fit within the
 * section so there is no harsh cut.
 *
 * Reduced-motion: if the user prefers reduced motion, the GSAP tween is
 * NOT created and the track falls back to a native horizontal
 * `overflow-x-auto` scroll with `scroll-snap-x mandatory` so users can
 * still browse the photos by scrolling, just without auto-motion. This
 * matches the gamma site's reduced-motion behaviour (Splide AutoScroll
 * disabled under prefers-reduced-motion).
 *
 * Mount gate: `useMounted()` returns false during SSR + first client
 * render, true after mount. Until mounted, we render a STATIC track
 * (the duplicate-set markup, no GSAP), so the server and client agree
 * on initial HTML and there is no hydration mismatch. After mount, GSAP
 * takes over the track's transform and animates it. This is the same
 * pattern used by `ScrollScene` (`src/components/motion/scroll-scene.tsx`)
 * and recommended in `use-mounted.ts` §14 грабли #8.
 *
 * GSAP is dynamically imported (`await import("gsap")`) so it stays out
 * of the server bundle — same convention as `ScrollScene`. This keeps
 * the client bundle smaller and avoids loading GSAP for users with
 * reduced-motion enabled (the import is gated behind the reduced-motion
 * check).
 *
 * First wow moment after hero: this section is placed immediately after
 * `<SiteHeader />` and before `<CepSimpleBrilliant />` in page.tsx —
 * mirroring gamma's structure (hero → marquee → content). The marquee is
 * the first "wow" photo scroll moment a visitor sees after the hero
 * scroll-up animation completes.
 *
 * @see /home/z/my-project/newsite/docs/advanced-technical/site_21_gamma.html
 *      §4567-4603 (image marquee), §4611-4619 (text marquee — GSAP -50%)
 */

/** 14 portrait food/event photos from /media/gamma/ — the exact set gamma
 *  uses in their homepage .marquee-slider (see site_21_gamma.html §304).
 *  Order matches gamma's source order so the visual rhythm of food /
 *  venue / people / detail shots matches the reference site. */
const MARQUEE_PHOTOS: ReadonlyArray<{
  src: string;
  alt: string;
}> = [
  {
    src: "/media/gamma/gamma-catering-waiter-canapes-trolley.jpg",
    alt: "Официант-тележка с канапе",
  },
  {
    src: "/media/gamma/gamma-catering-ice-cream-cart-lake.jpg",
    alt: "Тележка с мороженым у озера",
  },
  {
    src: "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    alt: "Банкетный зал с люстрами",
  },
  {
    src: "/media/gamma/gamma-catering-buffet.jpg",
    alt: "Фуршетные закуски",
  },
  {
    src: "/media/gamma/gamma-catering-caviar-fine-dining.jpg",
    alt: "Икра — fine dining подача",
  },
  {
    src: "/media/gamma/hochzeit-tischdekoration-zitronen-gedeck-gammacatering.jpg",
    alt: "Свадебная сервировка с лимоном",
  },
  {
    src: "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
    alt: "Сервировка стола для гала-ужина",
  },
  {
    src: "/media/gamma/hochzeitslocation-orangerie-blumen-kronleuchter-gammacatering.jpg",
    alt: "Оранжерея с цветами и люстрами",
  },
  {
    src: "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
    alt: "Шоу-кухня — живая готовка",
  },
  {
    src: "/media/gamma/flying-buffet-mini-quiche-sommerfest-gammacatering.jpg",
    alt: "Летающий фуршет — мини-киши на летнем празднике",
  },
  {
    src: "/media/gamma/blumendekoration-reagenzglas-vasen-event-gammacatering.jpg",
    alt: "Цветы в пробирочных вазах на ивенте",
  },
  {
    src: "/media/gamma/gammcatering_karriere_004.jpg",
    alt: "Команда кейтеринга за работой",
  },
  {
    src: "/media/gamma/firmenevent-messe-gala-bankett-gammacatering.jpg",
    alt: "Корпоративное событие — выставка и гала-банкет",
  },
  {
    src: "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    alt: "Сомелье — винный сервис",
  },
];

/** Photo tile — uniform portrait frame (280px mobile / 300px md+) with
 *  aspect-[3/4] so EVERY photo renders at an identical size and the
 *  top/bottom edges of the marquee band align pixel-perfectly. Using
 *  next/image `fill` + `object-cover` (instead of fixed width/height)
 *  so any source aspect crops cleanly into the portrait frame and the
 *  wrapper (not the image) owns the box dimensions — this is what
 *  eliminates the jagged-edge inconsistency VLM critique #1 called out.
 *
 *  Rendered twice per set (see `<PhotoSet />`) for the seamless -50%
 *  loop. mr-8 (32px) right margin for editorial breathing room —
 *  critique #2 asked for less cramped spacing. */
function PhotoTile({
  src,
  alt,
  /** Marks the duplicate clone as decorative for screen readers so the
   *  photo list is not announced twice. */
  ariaHidden = false,
}: {
  src: string;
  alt: string;
  ariaHidden?: boolean;
}): React.ReactElement {
  return (
    <span
      className="gamma-marquee__item relative mr-8 inline-block aspect-[3/4] w-[280px] shrink-0 snap-start overflow-hidden md:w-[300px]"
      aria-hidden={ariaHidden || undefined}
    >
      <Image
        src={src}
        alt={ariaHidden ? "" : alt}
        fill
        sizes="(max-width: 768px) 280px, 300px"
        className="gamma-marquee__img absolute inset-0 h-full w-full object-cover"
        loading="eager"
        // draggable=false so the user can't accidentally trigger the
        // browser's native image-drag gesture over the marquee (which
        // would otherwise interfere with the GSAP-driven motion).
        draggable={false}
      />
    </span>
  );
}

/** One full set of 14 photos — rendered TWICE inside the track so GSAP
 *  can `xPercent: -50` for a seamless loop (when set 1 has fully exited
 *  left, set 2 is exactly where set 1 started). */
function PhotoSet({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span className="gamma-marquee__set flex shrink-0 items-center">
      {MARQUEE_PHOTOS.map((photo, i) => (
        <PhotoTile
          key={`${photo.src}-${i}`}
          src={photo.src}
          alt={photo.alt}
          ariaHidden={ariaHidden}
        />
      ))}
    </span>
  );
}

export function GammaMarquee() {
  const mounted = useMounted();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // ── Marquee timing ──────────────────────────────────────────────────
  /** One full loop (0 → -50% of the track) in seconds. Must match the
   *  CSS keyframes duration. */
  const MARQUEE_DURATION_S = 40;

  // ── Drag state ──────────────────────────────────────────────────────
  // Cycle 31.1: the user requested the marquee be draggable by cursor
  // (like gammacatering.com, which uses Splide `drag: 'free'`). We
  // implement manual pointer drag on top of the GSAP auto-scroll:
  //   - pointerdown  → kill the GSAP tween, record startX + current baseX
  //   - pointermove  → set track x = baseX + (clientX - startX)
  //   - pointerup    → normalize x into the [-trackWidth/2, 0] loop range,
  //                    then resume the GSAP auto-scroll from there.
  // The track's x is driven by GSAP's transform, so during drag we use
  // gsap.set() to override it. cursor: grab/grabbing + touch-action: none
  // (via the .gamma-marquee__track--draggable class) so touch devices
  // don't fight vertical scroll while dragging horizontally.
  const dragState = React.useRef({
    active: false,
    startX: 0,
    baseX: 0, // track x at pointerdown (in px)
    trackWidth: 0, // one full set width (half of scrollWidth due to clone)
  });

  const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || reducedMotion) return;
    // Only respond to primary pointer (left mouse / touch / pen).
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const track = trackRef.current;
    dragState.current.active = true;
    dragState.current.startX = e.clientX;
    // Freeze the CSS animation at its current offset: read the computed
    // transform (the running keyframes apply it), then swap to a static
    // inline transform so pointermove math has a stable base.
    const cs = getComputedStyle(track);
    const matrix = cs.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const match = matrix.match(/matrix.*\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseFloat(v.trim()));
        currentX = values.length === 16 ? values[12] : values[4] || 0;
      }
    }
    dragState.current.baseX = currentX;
    // One set = half of the track's scrollWidth (two duplicate sets).
    dragState.current.trackWidth = track.scrollWidth / 2;
    // Stop the keyframes animation (inline transform takes over).
    track.style.animation = "none";
    track.style.transform = `translate3d(${currentX}px, 0px, 0px)`;
    // Capture pointer so move events keep firing even if cursor leaves
    // the track bounds during drag.
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    if (sectionRef.current) {
      sectionRef.current.dataset.dragging = "true";
    }
  }, [reducedMotion]);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !trackRef.current) return;
    const delta = e.clientX - dragState.current.startX;
    let newX = dragState.current.baseX + delta;
    // Normalize into the [-trackWidth, 0] range so dragging past either
    // edge wraps to the other side (seamless infinite drag).
    const w = dragState.current.trackWidth;
    if (w > 0) {
      while (newX > 0) newX -= w;
      while (newX < -w) newX += w;
    }
    trackRef.current.style.transform = `translate3d(${newX}px, 0px, 0px)`;
  }, []);

  const onPointerUp = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !trackRef.current) return;
    dragState.current.active = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    if (sectionRef.current) {
      delete sectionRef.current.dataset.dragging;
    }
    // Resume the CSS keyframes from wherever the user dropped the track.
    // The keyframes run 0 → -50% (one set width, w px) over 40s. A track
    // at position X (in [-w, 0]) corresponds to animation progress
    // t = -X / w of the cycle — resume with a matching negative delay.
    const track = trackRef.current;
    const w = dragState.current.trackWidth;
    const cs = getComputedStyle(track);
    const matrix = cs.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const match = matrix.match(/matrix.*\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseFloat(v.trim()));
        currentX = values.length === 16 ? values[12] : values[4] || 0;
      }
    }
    if (w > 0) {
      while (currentX > 0) currentX -= w;
      while (currentX < -w) currentX += w;
    }
    const progress = w > 0 ? -currentX / w : 0; // 0..1
    const resumeAt = progress * MARQUEE_DURATION_S;
    // Drop the inline transform and restart the animation mid-cycle.
    track.style.transform = "";
    track.style.animation = "none";
    // Force a style flush so the animation restarts from scratch with
    // the negative delay (double rAF is the standard trick).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.animation = "";
        track.style.animationDelay = `${-resumeAt}s`;
      });
    });
  }, []);

  // Read prefers-reduced-motion AFTER mount (server has no window) so we
  // don't risk a hydration mismatch. The animation effect below reads
  // this state and skips the GSAP tween when true.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    // addEventListener is the modern API; addListener is the legacy
    // Safari < 14 fallback — both are guarded so we don't crash on old
    // browsers. The fallback is one line and keeps the marquee
    // accessible to users on older macOS / iOS.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof (mq as MediaQueryList).addListener === "function") {
      (mq as MediaQueryList).addListener(onChange);
    }
    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", onChange);
      } else if (typeof (mq as MediaQueryList).removeListener === "function") {
        (mq as MediaQueryList).removeListener(onChange);
      }
    };
  }, []);

  // Cycle 41 PERF FIX (critical): the infinite scroll is now a pure CSS
  // keyframes animation (`.gamma-marquee__track--anim`, transform-only →
  // compositor thread). Previously a GSAP tween updated the inline
  // transform every frame from JS — combined with the grain overlay's
  // repaint loop this contributed to full main-thread freezes on
  // software-rendered browsers. The drag interaction still works: pointer
  // handlers temporarily pause the animation (`.gamma-marquee__track--drag`
  // sets animation-play-state: paused) and translate the track inline,
  // then resume the keyframes from a matched offset.
  React.useEffect(() => {
    if (!mounted || reducedMotion || !trackRef.current) return;
    const track = trackRef.current;
    track.classList.add("gamma-marquee__track--anim");
    return () => {
      track.classList.remove("gamma-marquee__track--anim");
      gsapSetTransformIdentity(track);
    };
  }, [mounted, reducedMotion]);

  // ── Task 5-C: scroll-velocity timeScale ──────────────────────────────
  // The band reacts to scroll speed: fast scrolling accelerates the loop
  // (playbackRate up to 2.2), scrolling up relaxes it (down to 0.6), and
  // at rest it eases back to exactly 1. Implemented on the EXISTING
  // compositor CSS keyframes via the Web Animations API — playbackRate
  // changes never drag the animation back onto the main thread (a GSAP
  // timeScale tween would reintroduce the Cycle 41 freeze).
  //
  // Perf: no always-on rAF. The loop wakes on scroll events (passive) and
  // self-terminates ~0.2s after the last one, once the rate settles at 1.
  // During pointer-drag the keyframes are `animation: none` (inline), so
  // getAnimations() is empty and the loop is a no-op.
  React.useEffect(() => {
    if (!mounted || reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;

    const MAX_RATE = 2.2;
    const MIN_RATE = 0.6;
    /** px/ms at which the rate saturates at MAX_RATE (≈ fast flick). */
    const SATURATION_V = 1.6;
    /** Signed velocity: scrolling down speeds the band up, up slows it. */
    const rateFor = (v: number) => {
      const target = 1 + v * ((MAX_RATE - 1) / SATURATION_V);
      return Math.max(MIN_RATE, Math.min(MAX_RATE, target));
    };

    let rafId = 0;
    let running = false;
    let lastY = window.scrollY;
    let lastT = 0;
    let vel = 0; // smoothed signed px/ms
    let rate = 1;
    let lastScrollAt = 0;

    const apply = () => {
      const anims = track.getAnimations();
      for (const a of anims) {
        if ((a as CSSAnimation).animationName === "gamma-marquee-scroll") {
          a.playbackRate = rate;
        }
      }
    };

    const loop = (now: number) => {
      const y = window.scrollY;
      if (lastT > 0) {
        const dt = Math.max(now - lastT, 1);
        const v = (y - lastY) / dt;
        vel = vel * 0.75 + v * 0.25;
      }
      lastY = y;
      lastT = now;
      // No fresh scroll events → decay toward rest.
      const idle = now - lastScrollAt > 180;
      if (idle) vel *= 0.88;
      rate += (rateFor(vel) - rate) * 0.08;
      if (idle && Math.abs(rate - 1) < 0.01) {
        rate = 1;
        apply();
        running = false;
        rafId = 0;
        return;
      }
      apply();
      rafId = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      lastScrollAt = performance.now();
      if (!running) {
        running = true;
        lastT = 0;
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      // Leave the animation at natural speed for whoever mounts next.
      for (const a of track.getAnimations()) {
        if ((a as CSSAnimation).animationName === "gamma-marquee-scroll") {
          a.playbackRate = 1;
        }
      }
    };
  }, [mounted, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      aria-label="Фотогалерея — кейтеринг в движении"
      className="gamma-marquee relative w-full overflow-hidden bg-cream py-5"
      style={{
        // Cycle 31.1: edge-fade mask REMOVED per user request: "убери
        // плавное затухание". The marquee now has crisp edges on both
        // sides — photos enter/exit hard, matching gamma's marquee
        // behaviour (gamma uses Splide overflow:hidden with no mask).
        // Filmstrip band framing kept — 1px hairline top + bottom in a
        // very low-opacity ink so the marquee reads as a deliberate band
        // rather than a floating strip.
        borderTop:
          "1px solid color-mix(in oklch, var(--ink) 8%, transparent)",
        borderBottom:
          "1px solid color-mix(in oklch, var(--ink) 8%, transparent)",
      }}
    >
      {/* Track: two identical PhotoSets side by side. When GSAP moves the
          track to xPercent:-50, set 1 has fully exited left and set 2 is
          exactly where set 1 started → the loop is seamless.

          Cycle 31.1: the track is now DRAGGABLE by cursor (pointer
          events). On drag, we kill the GSAP auto-scroll and take over
          the transform; on release, we resume auto-scroll from the
          dropped position. cursor: grab / grabbing signals the
          affordance. touch-action: none on the track prevents the
          browser from hijacking the gesture for horizontal swipe-back.

          Under reduced-motion the track keeps the same markup, but no
          tween runs. Instead we let the wrapper scroll horizontally
          natively (overflow-x-auto + scroll-snap) so users can browse
          the photos by hand — the same end-result as gamma's Splide
          AutoScroll being disabled under reduced-motion. */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={
          reducedMotion
            ? "gamma-marquee__track gamma-marquee__track--static flex w-max snap-x snap-mandatory overflow-x-auto pb-3"
            : "gamma-marquee__track gamma-marquee__track--draggable flex w-max will-change-transform cursor-grab select-none"
        }
        style={
          reducedMotion
            ? undefined
            : {
                // Prevent browser from interpreting horizontal drag as
                // swipe-back / scroll. Allow vertical pan for page scroll.
                touchAction: "pan-y",
              }
        }
      >
        <PhotoSet />
        {/* Set 2 — duplicate clone for seamless -50% loop. aria-hidden so
            screen readers don't announce the gallery twice. */}
        <PhotoSet ariaHidden />
      </div>
    </section>
  );
}

/**
 * Defensive identity-transform reset for the track element. Uses
 * `gsap.set(el, { xPercent: 0, clearProps: 'transform' })` when GSAP is
 * available, else falls back to clearing the inline `transform` style
 * directly. Keeps the cleanup branch SSR-safe (gsap is only imported
 * lazily inside the effect).
 */
function gsapSetTransformIdentity(el: HTMLElement) {
  // Don't import gsap just to clear an inline style — direct DOM reset
  // is enough and works whether or not GSAP has loaded.
  el.style.transform = "";
}

export default GammaMarquee;
