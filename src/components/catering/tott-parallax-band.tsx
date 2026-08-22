"use client";

import Image from "next/image";
import { TottReveal } from "./tott-reveal";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

/**
 * TottParallaxBand — Talk of the Town (talkofthetownatlanta.com) parallax
 * quote band (Cycle 30). Their homepage uses 16× CSS-parallax sections
 * (`background-attachment: fixed`) — full-bleed photo backgrounds that stay
 * fixed while content scrolls over them. This component reproduces that
 * signature motion as an editorial pause between Act II and Act III of the
 * Interfood homepage.
 *
 * Composition:
 *   - Full-bleed background image (the talkofthetown "Olive Trees" parallax
 *     bg — downloaded from their wp-content uploads). Mounted via next/image
 *     + a `.tott-parallax` overlay div using `background-attachment: fixed`
 *     so the parallax is the CSS-native kind (their Avada approach), not JS.
 *   - Layered burgundy/ink gradient overlay (so the cream text reads).
 *   - Centered stack:
 *       • script accent "приятного аппетита" (Nothing You Could Do — their hero
 *         overlay script font; English because the face is Latin-only, here
 *         rendered via Marck Script in Marck-capable Cyrillic)
 *       • char-split headline "Еда — это ритуал." rendered with SplitTextReveal
 *         mode="chars" stagger={0.03} (the sondaven.com split-line per-char
 *         reveal — replaces the prior TottReveal variant="split" with the
 *         shared Wave-2 motion primitive; same RU Playfair serif, same delay).
 *       • supporting line + olive-divider eyebrow.
 *
 * Cycle 34 WOW graft (sondaven.com):
 *  - `data-theme-flip="cream"` ensures the html root `--background` returns to
 *    cream as soon as this band enters (resets the lingering espresso from
 *    the CepEditorialDivider above so the hand-off is smooth). The band
 *    itself stays on its own `bg-black` (intentional — the parallax photo
 *    needs a dark backdrop to read).
 *  - The parallax bg photo (next/image + .tott-parallax fixed-attachment
 *    layer together) reveals top→bottom via `ClipPathReveal direction="top"`
 *    on enter — opposite direction to the editorial divider above for
 *    variety. The existing CSS `background-attachment: fixed` parallax keeps
 *    playing inside the clipped container (composes on different elements).
 *
 * Reduced-motion: SplitTextReveal + ClipPathReveal render statically; the
 * `.tott-parallax` CSS falls back to `background-attachment: scroll` on
 * touch/reduced-motion (globals.css media query).
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (parallax sections)
 */
export function TottParallaxBand() {
  return (
    <section
      data-header-theme="dark"
      data-theme-flip="cream"
      aria-label="Еда как ритуал"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-black py-24"
    >
      {/*
        Parallax background — CSS background-attachment: fixed (their 16×
        Avada parallax pattern). The next/image sits behind as the LCP
        fallback; the .tott-parallax div drives the fixed-attachment motion.

        Both layers are wrapped in a single ClipPathReveal so the whole
        photo stack reveals top→bottom on enter. The wrapper div inside
        ClipPathReveal carries an explicit h-[70vh] so next/image `fill`
        (position:absolute) has a definite containing block — the inner
        motion.div's height is auto, so this in-flow wrapper establishes it.
        The existing `background-attachment: fixed` parallax keeps running
        inside the clipped container (composes on different elements: outer
        motion.div clips, inner motion.div scales 1.15→1.0, the .tott-parallax
        div keeps its own viewport-fixed background-position).
      */}
      <ClipPathReveal direction="top" duration={1.2} className="absolute inset-0">
        <div className="relative h-[70vh] w-full">
          <Image
            src="/media/talkofthetown/talkofthetown-bg-olive-trees.jpg"
            alt="Оливковые деревья — сезонные локальные продукты"
            fill
            sizes="100vw"
            className="absolute inset-0 z-0 object-cover"
          />
          <div
            className="tott-parallax absolute inset-0 z-[1]"
            style={{
              backgroundImage:
                "url('/media/talkofthetown/talkofthetown-bg-olive-trees.jpg')",
            }}
            aria-hidden="true"
          />
        </div>
      </ClipPathReveal>
      {/* Burgundy-ink gradient overlay — deepens edges so cream text reads. */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/45 to-black/75"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(139,31,28,0.25)_0%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* 5px cream border frame — their SR7 decorative border shape. */}
      <span className="tott-border-frame tott-border-frame--cream z-[3]" aria-hidden="true" />

      {/* Centered content. */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <TottReveal
          variant="fade-left"
          as="p"
          className="tott-script mb-4 text-tott-olive"
          text={undefined}
        >
          <span style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>приятного аппетита</span>
        </TottReveal>

        {/* Char-split headline — sondaven.com split-line per-char reveal.
            RU text in Playfair (Cyrillic-safe serif fallback). The shared
            SplitTextReveal primitive replaces the prior TottReveal
            variant="split" — same per-char animation, same delay (0.15s)
            so the headline lifts in after the script accent settles. */}
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
          <span style={{ color: "var(--tott-olive)" }}>Interfood · с 2009 года</span>
        </TottReveal>
      </div>
    </section>
  );
}

export default TottParallaxBand;
