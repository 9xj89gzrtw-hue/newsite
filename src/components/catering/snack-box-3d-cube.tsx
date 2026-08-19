"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * SnackBoxCube3D — CSS 3D rotating cube mockup.
 *
 * Phase 8 P2 wow-factor pattern (AGENTS.md §14 "SnackBox 3D-rotating cube mockup").
 * 6 cube faces use 6 different real catering photos scraped from reference
 * sites (concordecatering.ca + ridgewells.com + concept-catering.de — Phase 7).
 *
 * Cube auto-rotates continuously (rotateY 0→720 over 24s, linear, repeat forever).
 * On hover: rotation slows to half-speed (duration doubles to 48s).
 * Reduced-motion: cube is static (no rotation), shows front face only.
 *
 * transform-style: preserve-3d on container + each face transformed via
 * translateZ + rotateY. All GPU-composited (RULES §5 compliant — transform
 * and opacity only).
 */
const FACE_IMAGES = [
  { src: "/media/concorde-handhelds.jpg", alt: "Канапе и закуски ручной подачи — передняя грань", position: "front" },
  { src: "/media/ridgewells-scallops.jpg", alt: "Морские гребешки на гриле — задняя грань", position: "back" },
  { src: "/media/concorde-avo-toast.jpg", alt: "Тост с авокадо — правая грань", position: "right" },
  { src: "/media/ridgewells-veg-mosaic.jpg", alt: "Овощная мозаика — левая грань", position: "left" },
  { src: "/media/concorde-dessert.jpg", alt: "Десертное ассорти — верхняя грань", position: "top" },
  { src: "/media/concept-banquet-table.jpg", alt: "Банкетный стол — нижняя грань", position: "bottom" },
] as const;

// Cube edge length in px (cube is responsive via CSS clamp on container).
const CUBE_SIZE = 200;

// Position transforms for each face — translateZ half-cube + rotateY/X to
// orient each face correctly.
const FACE_TRANSFORMS: Record<string, string> = {
  front: `translateZ(${CUBE_SIZE / 2}px)`,
  back: `rotateY(180deg) translateZ(${CUBE_SIZE / 2}px)`,
  right: `rotateY(90deg) translateZ(${CUBE_SIZE / 2}px)`,
  left: `rotateY(-90deg) translateZ(${CUBE_SIZE / 2}px)`,
  top: `rotateX(90deg) translateZ(${CUBE_SIZE / 2}px)`,
  bottom: `rotateX(-90deg) translateZ(${CUBE_SIZE / 2}px)`,
};

export function SnackBoxCube3D() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[280px] w-full items-center justify-center"
      style={{ perspective: "800px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative"
        style={{
          width: CUBE_SIZE,
          height: CUBE_SIZE,
          transformStyle: "preserve-3d",
        }}
        // Auto-rotate rotateY 0 → 720 over 24s, repeat forever, linear.
        // Half-speed on hover by doubling duration to 48s.
        animate={
          prefersReducedMotion
            ? undefined
            : { rotateY: isHovered ? 360 : 720 }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                rotateY: {
                  duration: isHovered ? 48 : 24,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                },
              }
        }
      >
        {FACE_IMAGES.map((face) => (
          <div
            key={face.position}
            className="absolute inset-0 overflow-hidden border border-gold/30 bg-ink shadow-lg"
            style={{
              transform: FACE_TRANSFORMS[face.position],
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <Image
              src={face.src}
              alt={face.alt}
              fill
              sizes={`${CUBE_SIZE}px`}
              className="object-cover"
              priority={face.position === "front"}
            />
            {/* Slight gradient overlay for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-tr from-ink/30 via-transparent to-gold/10"
            />
          </div>
        ))}
      </motion.div>

      {/* Caption */}
      <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center font-mono text-[10px] uppercase tracking-wider text-ink/70">
        {isHovered ? "Вращение замедлено" : "Шесть блюд в одном кубе"}
      </p>
    </div>
  );
}
