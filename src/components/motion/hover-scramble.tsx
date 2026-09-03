"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * HoverScramble — C78 «декодер»: на pointerenter текст нав-ссылки
 * прокручивается кириллическим шумом и оседает слева-направо (~520мс).
 *
 * Гейты: (pointer: fine) — тачу скрамбл не показываем (палец не hover);
 * prefers-reduced-motion → текст не трогаем. Ширина на время перебора
 * ЛОКАЛИЗУЕТСЯ (offsetWidth в inline-width) — подмена глифов не дёргает
 * строку навигации; на оседании lock снимается.
 *
 * A11y: родительская <a> несёт aria-label с итоговым текстом, этот спан —
 * aria-hidden (паттерн ScrambleText из c71).
 *
 * Perf: один setInterval 42мс, живёт ≤560мс на один hover; строки ≤12
 * символов (нав-меню) — textContent-перезапись дешевле одного layout-ти.
 */
const CYR_POOL = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ·—×";

export function HoverScramble({
  text,
  className,
  style,
  pool = CYR_POOL,
  stepMs = 42,
  settleMs = 520,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Алфавит шума. По умолчанию — кириллица капсом под нав-меню. */
  pool?: string;
  stepMs?: number;
  settleMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    // Гейт: НЕ-coarse (не «fine») — headless-автоматизация рапортует
    // (pointer: none) (worklog-грабли цикла 43): инверсия даёт паритет
    // автотестам/клавиатуре; тач = coarse = скип.
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    let locked = false;

    const unlock = () => {
      if (locked) {
        el.style.width = "";
        locked = false;
      }
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
      unlock();
      el.textContent = text;
    };

    const onEnter = () => {
      if (timer || coarseMq.matches || reduceMq.matches) return;
      locked = true;
      el.style.width = `${el.getBoundingClientRect().width}px`;
      const t0 = performance.now();
      timer = window.setInterval(() => {
        const t = (performance.now() - t0) / settleMs;
        if (t >= 1) {
          stop();
          return;
        }
        const settled = Math.floor(t * text.length);
        let out = text.slice(0, settled);
        for (let i = settled; i < text.length; i++) {
          const ch = text[i];
          out += ch === " " ? " " : pool[(Math.random() * pool.length) | 0];
        }
        el.textContent = out;
      }, stepMs);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", stop);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", stop);
      stop();
    };
  }, [text, pool, stepMs, settleMs]);

  return (
    <span ref={ref} className={className} style={style} aria-hidden="true">
      {text}
    </span>
  );
}

export default HoverScramble;
