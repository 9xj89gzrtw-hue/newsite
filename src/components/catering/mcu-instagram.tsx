import Image from "next/image";
import { Instagram } from "lucide-react";
import { MCU_INSTAGRAM_TILES } from "@/lib/mculinary-media";

/**
 * McuInstagram — mculinary-style Instagram feed grid.
 *
 * Navy section with a heading row ("@nilov_catering" + "Подписаться" link)
 * and a 6-column-desktop / 3-column-mobile grid of 12 square Instagram tiles
 * with hover-zoom (mirrors mculinary.com §13 Instagram CTA + Smash Balloon
 * feed — see MCULINARY-ANALYSIS.md §5 §7 wow #10, §8 assets).
 *
 * All hovers are pure CSS (`.mcu-insta-cell` scale + brightness). No JS
 * animation, so this is a Server Component. Respects prefers-reduced-motion
 * via the reduced-motion media query in globals.css.
 *
 * @see /docs/reference-library/mculinary/MCULINARY-ANALYSIS.md §5 §7 §8
 */

export function McuInstagram() {
  return (
    <section
      className="mcu-section-navy py-24"
      aria-label="Мы в Instagram"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mcu-eyebrow mb-2 flex items-center gap-2 text-[var(--mcu-gold-light)]">
              <Instagram className="h-4 w-4" aria-hidden="true" />
              МЫ В СОЦСЕТЯХ
            </p>
            <h2 className="mcu-h2 text-white">@nilov_catering</h2>
          </div>
          {/*
            `text-white` on `.mcu-eyebrow-link` is visually correct: the link
            inherits white from `.mcu-section-navy` (color: #FFFFFF) because
            `.mcu-eyebrow-link { color: currentColor }` resolves to the
            inherited value. The Tailwind class is layered and would not
            override currentColor, but the end color is white either way.
          */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mcu-eyebrow-link text-white"
          >
            Подписаться <span className="mcu-arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div className="mcu-insta-grid">
          {MCU_INSTAGRAM_TILES.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mcu-insta-cell block"
            >
              <Image
                src={src}
                alt={`Публикация ${i + 1} в Instagram`}
                fill
                sizes="(max-width:768px) 33vw, 16vw"
                className="object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default McuInstagram;
