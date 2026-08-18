# ANIMATION-PRESETS.md

> Готовые сниппеты анимаций под стек Motion + GSAP + Lenis. Копируй и адаптируй.
> Все пресеты уважают `prefers-reduced-motion`.

## 0. Связка Lenis ↔ GSAP ScrollTrigger

Уже настроена в `src/components/providers/lenis-provider.tsx`:
`lenis.on('scroll', ScrollTrigger.update)`. Дополнительно ничего делать не надо —
любой `ScrollTrigger` будет ехать синхронно со сглаженным скроллом.

---

## 1. Reveal — появление при скролле (Motion)

```tsx
import { Reveal } from "@/components/motion/reveal";

<Reveal delay={0.1} y={32}>
  <h2 className="font-serif text-4xl">Заголовок секции</h2>
</Reveal>
```

Внутри: `motion.div` с `whileInView`, ease `[0.22, 1, 0.36, 1]` (easeOutExpo-ish),
`viewport={{ once: true, margin: "-80px" }}`.

---

## 2. Staggered reveal — каскад элементов

```tsx
import { motion, useReducedMotion } from "motion/react";

const items = ["...", "...", "..."];
const reduce = useReducedMotion();

<ul>
  {items.map((item, i) => (
    <motion.li
      key={item}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {item}
    </motion.li>
  ))}
</ul>
```

---

## 3. ScrollScene — скролл-драйв сцена (GSAP ScrollTrigger)

```tsx
import { ScrollScene } from "@/components/motion/scroll-scene";

<ScrollScene
  from={{ y: 120, opacity: 0 }}
  to={{ y: 0, opacity: 1 }}
  start="top 80%"
  end="bottom 20%"
>
  <div className="parallax-card">...</div>
</ScrollScene>
```

`scrub: 0.6` — сцена привязана к прогрессу скролла с лёгким запаздыванием.

---

## 4. Parallax фоновое изображение (GSAP)

```tsx
"use client";
import { useRef, useEffect } from "react";

export function ParallaxBg({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: any;
    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.to(ref.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: { trigger: ref.current!.parentElement, scrub: true },
        });
      });
    })();
    return () => ctx?.revert();
  }, []);
  return <div ref={ref} className="h-[120%] -top-[10%] relative bg-cover" style={{ backgroundImage: `url(${src})` }} />;
}
```

---

## 5. Marquee — бесконечная лента (CSS)

```tsx
import { Marquee } from "@/components/motion/marquee";

<Marquee speed={30} pauseOnHover>
  {logos.map((l) => <img key={l.id} src={l.src} alt={l.alt} className="h-12" />)}
</Marquee>
```

Чистый CSS `transform: translateX`, дублированный контент для бесшовного цикла.

---

## 6. Hero video loop (Mux, autoplay muted)

```tsx
import { VideoPlayer } from "@/components/media/video-player";

<VideoPlayer
  source={{ provider: "mux", playbackId: "ABC123xyz", streamType: "on-demand" }}
  autoPlay
  loop
  controls={false}
  aspect="aspect-[21/9]"
  className="rounded-none border-0"
/>
```

`autoPlay` форсирует `muted` (политика браузеров). Постер — автоматически из
`muxPoster()`.

---

## 7. Magnetic button (Motion)

```tsx
"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 8. Page transition (Motion + App Router)

Через `template.tsx` (перезмаунчивается на каждой навигации):

```tsx
// src/app/template.tsx
"use client";
import { motion } from "motion/react";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {children}
    </motion.div>
  );
}
```

---

## 9. Reduced-motion.guard

Универсальная проверка (используется во всех пресетах):

```ts
const reduce = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Если `reduce === true` — рендерим финальное состояние без анимации.

---

## Тайминги и ease (стандарт проекта)

| Назначение | duration | ease |
|---|---|---|
| Micro (hover, tap) | 0.15–0.25s | `easeOut` |
| Reveal | 0.6–0.7s | `[0.22, 1, 0.36, 1]` |
| Stagger step | 0.08s | — |
| Page transition | 0.4s | `easeOut` |
| Scroll scrub | — | `scrub: 0.6` (GSAP) |
