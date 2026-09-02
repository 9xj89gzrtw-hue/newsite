"use client";

/**
 * CepProcess — Cycle 63 (wave-1 + wave-2 critic passes). «Как мы работаем» —
 * compact scroll-driven process strip.
 *
 * Replaces the Cycle 27 «ТВОРЧЕСКИЙ ПОДХОД» 3-column block (~900–1250px tall)
 * with a ~450px section: 4 verb-first steps (Заявка / Созвон / Накрываем /
 * Убираем) threaded by a self-drawing red progress rail (P1⊕P3 pattern,
 * research/c63-process). Still the light cream "pause beat" between the dark
 * EventsVideoCarousel and the Calculator.
 *
 * Layout bands (wave-1 B/C):
 *  - <md (mobile): single column, vertical rail left of the text.
 *  - md–xl (768–1279, tablet): 2×2 grid. NO through-rail here by design —
 *    both rail containers are display:none and the dot nodes are hidden;
 *    the sequential ink-fill animation still runs off the same progress.
 *  - xl+ (desktop): 4 columns, horizontal rail through the dot nodes.
 *
 * Wave-2 additions:
 *  - (A) Passive-restoration re-anchor: browsers can restore scroll position
 *    ~1s AFTER hydration on a mid-scroll reload — later than the
 *    layout-effect jump below — so until the user interacts, every window
 *    scroll re-jumps the spring to the live progress (see the mount
 *    useEffect). A late restore can never collapse + re-draw the fill.
 *  - (B) Body copy renders in Montserrat via inline fontFamily: .cep-text's
 *    Neutra2→Karla chain is Latin-only, so this Russian copy silently fell
 *    back to Liberation Sans/Arial. Scoped here; globals.css untouched
 *    (sitewide font changes are an owner decision).
 *  - (E) Tablet 768–1279: red underline under each verb scales in with the
 *    step fill — the 2×2 band's journey cue (no rail there), zero height
 *    cost.
 *  - (C/D/G) Body 14px mobile; NBSP-bound orphan pairs; copy pass:
 *    TiltedAccent «как это будет», H2 trailing period, step-02
 *    «перезвоним в рабочее время» (verified against the Contact block).
 *
 * Motion architecture — zero re-renders while scrubbing:
 *  - ONE useScroll({ target, offset: ["start 0.85", "start 0.35"] }) on the
 *    section → useSpring (back-to-top.tsx config) → a single MotionValue.
 *  - A useLayoutEffect jump (wave-1 D) snaps the spring to the current
 *    scroll progress the moment `animate` flips true — before the first
 *    animated paint — and the wave-2 mount effect keeps re-anchoring it on
 *    passive (non-user) scrolls, so a mid-scroll reload never collapses the
 *    static state and re-draws it, whatever order restoration lands in.
 *  - Desktop rail: hairline (cep-black/15) + red fill (var(--cep-red))
 *    scaleX 0→1, left-origin, node 1's center → node 4's center. Mobile:
 *    same MotionValue drives the vertical rail (scaleY, top-origin), with
 *    the last 56px masked out so the tail never dangles past the final dot.
 *    Both rails live in the DOM (aria-hidden); CSS picks the direction.
 *  - Each step slices the shared progress (SPEC windows [i/N·0.75, +0.25])
 *    with per-step useTransform overlays: red ink-fill opacity on the
 *    numeral (two stacked spans: -webkit-text-stroke outline under a filled
 *    cep-red copy), verb/body opacity 0.8→1 (wave-1 H: the old 0.45 floor
 *    failed WCAG contrast on cream), dot 0→1 with a subtle scale pulse.
 *
 * Type hierarchy (wave-1 A/B): H2 is the page-wide Cyrillic canon —
 * .ea-section-h2 (Playfair Display, sentence case, ≤64px, lh 1.08), the same
 * class as «Что важно знать» / «Откройте нашу историю» — .cep-ru stays on the
 * step verbs only. Numerals are capped at 32px so the read is H2 ≫ numeral >
 * verb > body.
 *
 * Semantics/a11y: <ol>/<li> with sr-only «Шаг N из 4» per item (wave-1 I),
 * section aria-label, rails + numerals aria-hidden. No sticky/pin, no extra
 * scroll height. Reduced-motion OR pre-mount: static fully-activated state —
 * all hooks run unconditionally before any branching (useMounted gate; no
 * hydration tree swap, split-text-reveal.tsx:192-197 precedent).
 *
 * CSS: existing layers only (globals.css untouched): .ea-section-h2 canon H2,
 * .cep-ru Cyrillic verbs (Neutra2 is Latin-only → Montserrat), .cep-display
 * Latin numerals 01–04, .cep-text body, text-cep / bg-cep-cream utilities.
 * Rail offsets are rem-based (wave-1 E) so a 150% root font stays aligned.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { TiltedAccent } from "@/components/catering/tilted-accent";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

type Step = { num: string; verb: string; body: string };

/**
 * SPEC c63 copy + wave-1 pass + wave-2 G (step-02: W1-FIX — «в рабочее
 * время» убрано: Contact/FAQ-блоки теперь обещают «отвечаем в любое время»,
 * формулировка «перезвоним сразу, как увидим заявку» не противоречит им).
 * \u00A0 (NBSP) binds the orphan pairs measured by the wave-2 critics
 * (D): without them the last rendered line strands a lone word —
 * «предлагаем.» (02 @1024/1920), «и не было.» (04 @1920), «полночь.»
 * (01 @320), «празднике.» (03 @320).
 */
const STEPS: Step[] = [
  { num: "01", verb: "Заявка", body: "Напишите пару строк — хоть в\u00A0полночь." },
  {
    num: "02",
    verb: "Созвон",
    body: "Разговор вместо анкеты: перезвоним сразу, как увидим заявку — слушаем вас, уточняем,\u00A0предлагаем.",
  },
  {
    num: "03",
    verb: "Накрываем",
    body: "Приезжаем, сервируем, подаём горячим. Вы — гость на своём\u00A0празднике.",
  },
  {
    num: "04",
    verb: "Убираем",
    body: "Увозим всё с собой — до последней свечи. Будто нас здесь и не\u00A0было.",
  },
];

/** Editorial easing + spring — repo canon (Cycle 27 / back-to-top.tsx:18). */
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 120, damping: 25, restDelta: 0.001 } as const;

/**
 * Numeral — .cep-display (Neutra2, Latin digits): 20px mobile / ≤32px md+
 * (wave-1 B — must read clearly below the verb-in-hierarchy, never rival the
 * 64px canon H2). `tabular-nums w-[2ch] text-left` pins the box to exactly
 * two digit widths so the verb indent is row-stable on mobile (wave-1 F).
 * Measured: ch(.cep-display) = 0.5em → the mobile box is exactly 1.25rem
 * (20px @375); the body's pl-8 offset depends on that (see ProcessStep).
 */
const NUMERAL =
  "cep-display tabular-nums w-[2ch] text-left text-[1.25rem] md:text-[clamp(1.5rem,2.2vw,2rem)]";

export function CepProcess() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;

  // All hooks unconditional, before any branching (manifesto.tsx precedent).
  const ref = useRef<HTMLElement | null>(null);
  const interacted = useRef(false); // wave-2 A: user-interaction marker
  const { scrollYProgress } = useScroll({
    target: ref,
    // Section top: 85% viewport → 0%, 35% viewport → 100% (~50vh of drawing).
    offset: ["start 0.85", "start 0.35"],
  });
  const line = useSpring(scrollYProgress, SPRING);

  /**
   * SSR-flash fix (wave-1 D): on a reload already scrolled into the section,
   * `animate` flips true a frame after hydration; without this, the static
   * fully-activated state visibly collapses and re-draws over ~1.3s of
   * spring travel. Jump the spring to the CURRENT scroll progress inside
   * useLayoutEffect — after the animate-commit, before its first paint — so
   * the first animated frame is already correct. The static fallback itself
   * stays for reduced-motion / no-JS.
   */
  useLayoutEffect(() => {
    if (animate) line.jump(scrollYProgress.get());
  }, [animate, line, scrollYProgress]);

  /**
   * Passive-restoration re-anchor (wave-2 A): on a reload already scrolled
   * into the section, the browser can restore the scroll position ~1s AFTER
   * hydration — later than the layout-effect jump above — so the spring
   * would settle at the pre-restore value, then visibly collapse and slowly
   * re-draw when the restore lands. Until the user actually interacts
   * (pointerdown / wheel / touchstart / keydown all precede any user-driven
   * scroll), every window scroll is treated as passive restoration and the
   * spring is re-jumped to the live progress — invisible and exact. After
   * the first interaction the jumping stops so user-driven scrubbing
   * animates the spring naturally.
   */
  useEffect(() => {
    const mark = () => {
      interacted.current = true;
    };
    const reanchor = () => {
      if (!interacted.current) line.jump(scrollYProgress.get());
    };
    const opts = { passive: true } as const;
    window.addEventListener("pointerdown", mark, opts);
    window.addEventListener("wheel", mark, opts);
    window.addEventListener("touchstart", mark, opts);
    window.addEventListener("keydown", mark, opts);
    window.addEventListener("scroll", reanchor, opts);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("scroll", reanchor);
    };
  }, [line, scrollYProgress]);

  // Static stand-in for SSR first paint / reduced motion: fully drawn,
  // fully activated. Swapping to the MotionValue post-mount is the documented
  // repo pattern (reveal.tsx:32-35) — one commit, no hydration mismatch.
  const railX = animate ? { scaleX: line } : { scaleX: 1 };
  const railY = animate ? { scaleY: line } : { scaleY: 1 };

  return (
    <section
      ref={ref}
      aria-label="Как мы работаем — 4 шага"
      data-header-theme="light"
      className="bg-cep-cream px-8 py-6 text-cep-black md:px-14 md:py-20"
    >
      {/* Compact header: tilted marginalia + canon H2 + counter line.
          wave-2 height pass: mobile py/margins/gaps tightened (py-6, mb-3,
          gap-y-2/0.25) to hold the ≤510px mobile gate once the mandated 14px
          body + longer step-02 copy landed; md+ rhythm keeps wave-1 values
          (mb-8 md vs wave-1's mb-10 — only −8px, holds the ≤620 @768 gate). */}
      <motion.div
        key={animate ? "animated" : "static"}
        initial={animate ? { opacity: 0, y: 24 } : false}
        whileInView={animate ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-3 md:mb-8"
      >
        {/* wave-2 G.1: «от и до» duplicated the counter line's «от … до»
            figure; the accent is decorative marginalia → «как это будет».
            Size floor 1.1→0.95rem: the 1.1rem floor bound below ~1100px, so
            this only slims the accent on mobile/tablet (desktop cap
            1.4rem @≥1400 unchanged) — buys header height for the 375 gate. */}
        {/* wave-3 seal: accent↔H2 clearance — the rotated script's bounding
            box sat 1px off the H2 cap-height; mb gives the marginalia air. */}
        <TiltedAccent
          text="как это будет"
          size="clamp(0.95rem, 1.6vw, 1.4rem)"
          color="var(--cep-red)"
          className="mb-2 block md:mb-3"
        />
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-0.5">
          {/* H2 — page-wide Cyrillic canon: .ea-section-h2 (Playfair Display,
              sentence case, ≤64px, lh 1.08) exactly as in «Что важно знать» /
              «Откройте нашу историю». Baseline-locked to the counter line via
              items-end below. The trailing period is the site's editorial
              signature (wave-2 G.3); the aria-label above stays period-free.
              C71: слова поднимаются каскадом (SplitTextReveal, дефолты SPEC:
              words / stagger 0.06 / 0.7s / [0.22,1,0.36,1]) — визуальный стиль
              H2 не меняется: тот же класс на том же h2. */}
          <SplitTextReveal as="h2" className="ea-section-h2">
            Как мы работаем.
          </SplitTextReveal>
          {/* Counter line — visible on mobile too (wave-1 J.3); wraps under
              the H2 on narrow screens, which is fine. Mobile 13px = body
              size (wave-2 height pass); desktop keeps the SPEC 15px. */}
          <p className="cep-text text-[13px] leading-normal text-cep-black/65 md:text-[15px]">
            от заявки до чистой кухни — 4 шага
          </p>
        </div>
      </motion.div>

      {/* Steps + the two aria-hidden rails (H/V share one MotionValue).
          Rails exist only on the single-row bands: xl 4-col (horizontal) and
          <md 1-col (vertical). The md–xl 2-col band has NO through-rail —
          both containers are display:none there (wave-1 C). */}
      <div className="relative">
        {/* Desktop rail: hairline through the dot centers at 3.875rem
            (md:h-14 numeral box 3.5rem + half of the md:h-3 dot row 0.375rem)
            — rem-based so 150% root font keeps alignment (wave-1 E). Spans
            node 1's center (0.25rem) to node 4's center (25% − 1.75rem at
            xl:gap-x-8). */}
        <div
          aria-hidden="true"
          className="absolute left-[calc(0.25rem-0.5px)] right-[calc(25%_-_1.75rem)] top-[calc(3.875rem-0.5px)] hidden h-px bg-cep-black/15 xl:block"
        >
          <motion.div
            className="h-full w-full origin-left bg-cep-red"
            style={railX}
          />
        </div>
        {/* Mobile rail: vertical; dots sit on it (li left edge). The last
            56px fade to transparent so the tail never dangles past the final
            dot (wave-1 G). Rem offsets: dot center = 0.5625rem. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[calc(0.25rem-0.5px)] top-[calc(0.5625rem-0.5px)] w-px bg-cep-black/15 md:hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 56px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 56px), transparent 100%)",
          }}
        >
          <motion.div
            className="h-full w-full origin-top bg-cep-red"
            style={railY}
          />
        </div>

        {/* md:gap-y-8 (wave-2 F): breathing room between the 2×2 rows;
            inert at xl (single row). Mobile gap-y-3→2: wave-2 height pass. */}
        <ol className="grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-8 md:gap-y-8 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <ProcessStep
              key={step.num}
              step={step}
              index={i}
              total={STEPS.length}
              progress={line}
              animate={animate}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * One step. Activation = a slice of the shared spring progress (per-step
 * useTransform → pure MotionValues, no setState / re-renders — the
 * ManifestoWord pattern, manifesto.tsx:320-358).
 */
function ProcessStep({
  step,
  index,
  total,
  progress,
  animate,
}: {
  step: Step;
  index: number;
  total: number;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  // Line draws across [0, 1]; step i ignites on its SPEC window.
  const start = (index / total) * 0.75;
  const end = start + 0.25;
  const fill = useTransform(progress, [start, end], [0, 1]); // numeral ink + dot
  // Verb/body muted floor (wave-1 H): 0.45 on cream #F7F5F5 fails WCAG
  // (~2:1). Floor 0.85 keeps the black/65 body at ≈4.6:1 (AA ≥4.5:1) and
  // the verb ≈12:1, climbing to ~6.8:1 once the step ignites.
  const ink = useTransform(progress, [start, end], [0.85, 1]); // 0.85 floor: black/65@0.85 ≈ 4.6:1 on cream (AA ≥4.5)
  const pulse = useTransform(fill, [0, 0.4, 1], [1, 1.5, 1]); // dot scale-pop

  return (
    <li className="relative flex flex-wrap items-start gap-x-3 gap-y-0.25 pl-8 md:flex-col md:items-start md:gap-0 md:pl-0">
      {/* Numbered-step announcement for AT users (wave-1 I). */}
      <span className="sr-only">
        Шаг {index + 1} из {total}
      </span>

      {/* Numeral — -webkit-text-stroke outline under a red ink-fill overlay.
          Fixed md:h-14 box keeps every column's dot on the same 3.875rem
          line; the w-[2ch] box (via NUMERAL) keeps mobile indents aligned. */}
      <span className="relative block md:flex md:h-14 md:items-end md:pb-2">
        <span
          aria-hidden="true"
          className={`${NUMERAL} block text-transparent`}
          style={{ WebkitTextStroke: "1.5px rgba(0,0,0,0.35)" }}
        >
          {step.num}
        </span>
        <motion.span
          aria-hidden="true"
          className={`${NUMERAL} absolute inset-0 text-cep-red md:flex md:items-end md:pb-2`}
          style={animate ? { opacity: fill } : { opacity: 1 }}
        >
          {step.num}
        </motion.span>
      </span>

      {/* Dot node on the rail: mobile absolute at the li's left edge (on the
          vertical rail); hidden in the md–xl 2-col band (no rail there);
          xl in-flow between numeral box and verb, centered in an h-3 row.
          Red overlay ignites + pulse-scales. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.3125rem] md:max-xl:hidden xl:static xl:flex xl:h-3 xl:items-center"
      >
        <span className="relative block size-2">
          <span className="absolute inset-0 rounded-full bg-cep-black/25" />
          <motion.span
            className="absolute inset-0 rounded-full bg-cep-red"
            style={animate ? { opacity: fill, scale: pulse } : { opacity: 1 }}
          />
        </span>
      </span>

      {/* Verb (Cyrillic → .cep-ru) + one sensory line, muted (0.8 floor)
          until reached. Body pl mirrors the mobile numeral box + gap so the
          text aligns under the verb (wave-1 F): numeral w-[2ch] of
          .cep-display @1.25rem measures exactly 1.25rem (self-hosted font,
          ch = 0.5em) + gap-x-3 0.75rem → 2rem = pl-8. NOTE: changing the
          mobile numeral size invalidates this offset. */}
      <motion.h3
        className="cep-ru relative text-[clamp(1.15rem,1.5vw,1.45rem)] text-cep-black md:mt-3"
        style={animate ? { opacity: ink } : { opacity: 1 }}
      >
        {step.verb}
        {/* Tablet journey cue (wave-2 E): the 768–1279 2×2 band has no rail
            and its verb/body opacity delta (0.85→1) is imperceptible, so a
            red underline scaling in with the step fill (same MotionValue as
            the rails) gives the band its sequential ЗАЯВКА→СОЗВОН→
            НАКРЫВАЕМ→УБИРАЕМ cue at zero height cost. Hidden on mobile and
            xl — those bands have real rails. */}
        <motion.span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 hidden h-[2px] w-full origin-left bg-cep-red md:max-xl:block xl:hidden"
          style={animate ? { scaleX: fill } : { scaleX: 1 }}
        />
      </motion.h3>
      {/* wave-2 C: mobile body 13→14px (leading 1.5 kept, desktop 15px). */}
      <motion.p
        className="cep-text w-full pl-8 text-[14px] leading-[1.5] text-cep-black/65 md:mt-2 md:w-auto md:pl-0 md:text-[15px]"
        style={{
          ...(animate ? { opacity: ink } : { opacity: 1 }),
          /* Cyrillic body fallback (wave-2 B): .cep-text opens with Neutra2
             Text (Latin-only) and its next stop, Karla (--font-sans), ships
             without a Cyrillic subset — this Russian copy silently rendered
             in Liberation Sans/Arial. Scoped fix mirroring .cep-ru: inline
             the site's Cyrillic-capable sans, var(--font-poppins) =
             Montserrat (loaded with the cyrillic subset). .cep-ru's chain
             also lists Neutra2 Display; deliberately dropped here so Latin-
             range glyphs (—, «») render in the same face instead of patching
             a display font into body copy. Inline style keeps globals.css
             and layout.tsx untouched (sitewide font changes are an owner
             decision). */
          fontFamily: "var(--font-poppins), var(--font-sans), Arial, sans-serif",
        }}
      >
        {step.body}
      </motion.p>
    </li>
  );
}

export default CepProcess;
