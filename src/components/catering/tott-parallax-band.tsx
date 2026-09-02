"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { TottReveal } from "./tott-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

/**
 * TottParallaxBand — Talk of the Town (talkofthetownatlanta.com) parallax
 * quote band (Cycle 30, rebuilt Cycle 62). Their homepage uses 16× CSS-parallax
 * sections (`background-attachment: fixed`) — full-bleed photo backgrounds that
 * stay glued to the viewport while the dark band window slides over them.
 *
 * ══ CYCLE 62 — WHY THE EFFECT DIED AND HOW IT COMES BACK ══
 *
 * Cycle 34 wrapped the photo stack in `ClipPathReveal`, whose inner motion.div
 * carries a permanent inline `will-change: transform` (plus scale/y entrance
 * transforms). Per css-transforms-1 §3 + css-will-change-1, ANY ancestor with
 * `will-change: transform` / transform / filter becomes a containing block for
 * fixed-position painting — `background-attachment: fixed` silently degrades
 * to `scroll` and the "photo doesn't move" effect dies. The old comment claimed
 * "the parallax keeps playing inside the clipped container" — wrong: measured
 * 98.26% pixel drift across a 220px scroll (research/c62/parallax-verify.mjs).
 *
 * The rebuild keeps the CSS-native fixed attachment (the exact TOTT/Avada
 * motion) by giving the photo layer a CLEAN ancestor chain — no transformed
 * element between `.tott-parallax` and `<html>`:
 *
 *   section (plain) → div.absolute (plain) → .tott-parallax (fixed bg)
 *
 * The Cycle-34 entrance reveal is reproduced WITHOUT touching the photo's
 * ancestors: a sibling cover panel (bg-black, z above photo+frame, below
 * content) animates its OWN clip-path `inset(0% 0% 0% 0%)` →
 * `inset(100% 0% 0% 0%)` — a top→bottom wipe that exposes the band exactly
 * like the old reveal. clip-path on a SIBLING cannot create a containing
 * block for the photo layer, so the parallax survives the animation and
 * composes with it (photo already viewport-glued as the cover wipes away).
 *
 * Touch / reduced-motion: the CSS falls back to `background-attachment:
 * scroll` (globals.css media queries). On coarse pointers the layer gains a
 * subtle JS drift (useScroll ±7% on a 118%-tall layer) — real parallax life
 * on mobile instead of a static image. On fine pointers NO transform ever
 * touches the layer (would kill the fixed attachment again).
 *
 * Composition:
 *   - `.tott-parallax` bg: /media/c62/nilov-olive-trees-1920.webp
 *     (Cycle 62: single optimized asset — the old build downloaded the raw
 *     657KB JPG for the CSS layer AND a next/image webp copy hidden beneath;
 *     new webp q75 512KB replaces both, new folder+filename = cache-bust per
 *     AGENTS.md §28).
 *   - Layered burgundy/ink gradient overlays (so the cream text reads).
 *   - Centered stack: script accent "приятного аппетита" (Marck Script),
 *     char-split headline "Еда — это ритуал." (SplitTextReveal, sondaven
 *     per-char reveal), supporting line + olive-divider eyebrow.
 *   - 5px cream border frame (their SR7 decorative border shape).
 *   - `data-theme-flip="cream"` resets the espresso theme on entry.
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (parallax sections)
 * @see research/c62/parallax-verify.mjs (proof harness — must report
 *      attachment:fixed, 0 breaker ancestors, best shift = 0px with
 *      row-correlation err ≪ ±1px err)
 */

const BAND_BG = "/media/c62/nilov-olive-trees-1920.webp";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function TottParallaxBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /** Reveal cover: wipes away when the band enters (sibling — photo's
   * ancestor chain stays clean). Skipped entirely under reduced motion. */
  const coverInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [coverDone, setCoverDone] = useState(false);

  /** Coarse-pointer drift — mobile gets a real (JS) parallax because the CSS
   * fixed attachment is disabled there anyway (globals.css fallback). Fine
   * pointers never receive a transform (fixed attachment must survive). */
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const driftRaw = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const drift = useSpring(driftRaw, { stiffness: 90, damping: 26, mass: 0.4 });

  const driftActive = isCoarse && !reduce;

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-theme-flip="cream"
      aria-label="Еда как ритуал"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-black py-24"
    >
      {/*
        Parallax background — CSS background-attachment: fixed (TOTT's Avada
        pattern). C62 REBUILD: the photo layer sits inside a PLAIN absolute
        wrapper — its ancestor chain (section → main → body → html) contains
        no transform / filter / will-change, so the fixed attachment actually
        attaches to the viewport. On touch the layer is oversized (118%) and
        drifts ±7% with scroll (JS parallax); on desktop it is exactly
        inset-0 with zero transforms.
      */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className={
            driftActive
              ? "tott-parallax absolute -top-[9%] left-0 right-0 h-[118%]"
              : "tott-parallax absolute inset-0"
          }
          style={
            driftActive
              ? { backgroundImage: `url('${BAND_BG}')`, y: drift }
              : { backgroundImage: `url('${BAND_BG}')` }
          }
          aria-hidden="true"
        >
          {/* No next/image here — the CSS layer IS the visual (single
              optimized webp download, C62). The parallax motion comes from
              background-attachment: fixed on .tott-parallax (desktop) or
              the drift transform (touch only). */}
        </motion.div>
      </div>

      {/* Burgundy-ink gradient overlays — deepen edges so cream text reads.
          C62 (seal-critic note): on narrow screens the busier photo made the
          body copy harder to read — mobile gets a heavier veil (max-md). */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/45 to-black/75 max-md:from-black/80 max-md:via-black/60 max-md:to-black/85"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(139,31,28,0.25)_0%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* 5px cream border frame — their SR7 decorative border shape. */}
      <span className="tott-border-frame tott-border-frame--cream z-[3]" aria-hidden="true" />

      {/*
        Reveal cover (C62): sibling wipe panel — animates its own clip-path
        top→bottom; never wraps the photo layer, so the fixed attachment is
        unaffected.

        HYDRATION-SAFE (C62, per blind-QA finding): the panel is ALWAYS in
        the DOM — useReducedMotion() is false during SSR and true on a
        reduce-client first render, so conditional cover rendering produced
        a hydration mismatch (React regenerated the whole tree + a black
        flash). Now: reduce hides the panel via the CSS media query
        (.tott-band-cover → display:none, pre-paint, zero flash) while the
        ANIMATION stays JS-gated. Post-animation unmount (coverDone) is a
        legal post-hydration update.
      */}
      {!coverDone && (
        <motion.div
          aria-hidden="true"
          className="tott-band-cover pointer-events-none absolute inset-0 z-[4] bg-black"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={
            coverInView && !reduce
              ? { clipPath: "inset(100% 0% 0% 0%)" }
              : undefined
          }
          transition={{ duration: 1.2, ease: EASE }}
          onAnimationComplete={() => setCoverDone(true)}
        />
      )}

      {/* Centered content. Soft inherited text-shadow (C62 seal note) lifts
          the olive script + body copy off the busy foliage without touching
          the TOTT palette. */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.5),0_0_2px_rgba(0,0,0,0.35)]">
        <TottReveal
          variant="fade-left"
          as="p"
          className="tott-script mb-4 text-tott-olive"
          text={undefined}
        >
          <span style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>приятного аппетита</span>
        </TottReveal>

        {/* Char-split headline — sondaven.com split-line per-char reveal.
            RU text in Playfair (Cyrillic-safe serif fallback). Same delay
            (0.15s) so the headline lifts in after the script accent settles. */}
        <SplitTextReveal
          as="h2"
          mode="chars"
          stagger={0.03}
          delay={0.15}
          className="font-serif text-white"
        >
          Еда — это ритуал.
        </SplitTextReveal>

        <TottReveal
          variant="fade-right"
          as="p"
          className="tott-body mt-6 mx-auto max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          text={undefined}
        >
          Не меню, не список калорий, не логистика. Ритуал, в котором каждая
          деталь — от первого ножа до последнего бокала — служит одному: моменту,
          который гости запомнят на всю жизнь.
        </TottReveal>

        <TottReveal
          variant="fade-left"
          as="p"
          className="tott-eyebrow mt-10 justify-center text-white/70"
          text={undefined}
        >
          <span style={{ color: "var(--tott-olive)" }}>nilov catering · с 2007 года</span>
        </TottReveal>
      </div>
    </section>
  );
}

export default TottParallaxBand;
