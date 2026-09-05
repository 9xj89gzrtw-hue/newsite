"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * TottHero — Talk of the Town (talkofthetownatlanta.com) hero graft (Cycle 30).
 *
 * Reproduces their Slider-Revolution full-bleed hero composition:
 *   - Full-viewport background VIDEO (their site uses a static photo — we
 *     upgrade to cinematic motion per the task brief: "вместо их фотки хедера
 *     вставить скопированную фотку с другого сайта в классном качестве или
 *     видео". Source: /media/mculinary/mculinary-hero.mp4 — already in-repo,
 *     1280×720 28s loop of real plated food (crostini with cream cheese,
 *     chutney, microgreens). Poster fallback: /media/hero-premium/hero-premium-6.jpg
 *     (Unsplash candlelit wedding dinner, deep bokeh).
 *   - Layered dark gradient overlay so the centered white wordmark reads.
 *   - 5px white border decorative frame inset (their SR7 border shape —
 *     `.tott-border-frame` utility).
 *   - TOP-LEFT script accent (Nothing You Could Do) — mirrors their hero
 *     top-left script overlay ("bacon & bluecheese tartlet"). Ours:
 *     "food as art" — the nilov catering brand tagline in their script font.
 *   - Centered stack: wordmark "nilov / catering." (Prata, two lines,
 *     gold dot) + subtitle
 *     "лучший кейтеринг Санкт-Петербурга" (Lato, tracked uppercase).
 *   - Scroll cue bottom-center (animated line + "SCROLL" eyebrow).
 *   - NO cities strip, NO long subhead (per task v2: лишняя информация
 *     и города там не нужны).
 *
 * Animation — 81-F1 (performance fixer, критик 81-W1-D): вход текста
 *   ЧИСТЫМ CSS (.hero-stagger / .hero-cue — keyframes hero-rise /
 *   hero-fade-in в globals.css), БЕЗ framer-вариантов и БЕЗ useMounted-гейта:
 *   прежде initial="hidden" шипил в SSR инлайн `opacity:0` на h1 (LCP-элемент)
 *   и красился только после полной гидрации (mobile LCP 10.5s → цель ~3s).
 *   Паттерн Shopify/DebugBear (ресёрч 81-R1/P1): LCP-текст виден в
 *   SSR-разметке, анимируется только transform (opacity вордмарка НЕ
 *   трогаем). Тайминги 1:1 с прежней хореографией: стаггер 0.14с от
 *   delayChildren 0.15 (nth-child 0.15/0.29/0.43), rise 0.85s easeOut,
 *   eyebrow fade 0.7s, scroll-cue fade 0.8s delay 1.3s. ВАЖНО: scroll-cue
 *   — обёртка (позиционирование -translate-x-1/2) + внутренний
 *   анимируемый узел: CSS-transform в keyframes ЗАМЕНЯЕТ computed transform
 *   (грабля §44 — позиционирующий translate живёт на обёртке).
 *   useReducedMotion остался ТОЛЬКО для видео-гейта (IO-эффект ниже);
 *   reduced-motion для hero-входа гейтится в CSS (animation: none).
 * The SiteHeader docks at the BOTTOM of this hero (100vh) via its own scroll
 * logic — see site-header.tsx. Hence `min-h-screen` so the bottom-docked nav
 * aligns to the hero's bottom edge.
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (hero section)
 */
const HERO_VIDEO = "/media/mculinary/mculinary-hero-720.mp4";
/* 81-W2F3 [критик H #3: hero-видео 1.5MB на мобиле + decode-таск 1410мс]:
   мобильная копия — 480×270, h264 Main, crf30, faststart, без звука,
   315KB (десктоп-720 = 1.49MB; источник 720→480 re-encode ffmpeg).
   Подмена источника — в IO-эффекте ДО первого play() (см. там). */
const HERO_VIDEO_MOBILE = "/media/mculinary/mculinary-hero-480.mp4";
const HERO_POSTER = "/media/hero-premium/hero-premium-6.jpg";
/* C71-P1 / K8-CRITICAL (Task 2): poster-атрибут видео тянул RAW jpg 595KB
   рядом с next/image-копией (~77KB webp) — двойная загрузка одного визуала.
   Новый постер — заранее оптимизированный sharp-webp 828px q82 (67KB,
   public/media/hero-premium/hero-premium-6-828.webp): виден долю секунды
   до старта видео на десктопе и остаётся статичным hero на mobile
   (видео там не играет — coarse-гейт эффекта выше). LCP-<Image> (z-0,
   next/image-оптимизация) НЕ тронут — он остаётся приоритетным кадром. */
const HERO_VIDEO_POSTER = "/media/hero-premium/hero-premium-6-828.webp";

/* ════════════ Cycle-72 — hero «чистый как картина» (прямое указание
   владельца, §1.3 «пользователь — лучший критик» + §1.6 «вкусовая правка
   юзера отменяет улучшения агента») ════════════

   Удалены ЦЕЛИКОМ (наследие Cycle-71 W3/F4):
   - ценовой якорь «фуршеты от … · банкеты от … · 2 400+ мероприятий…»;
   - CTA-пара «Смотреть меню» / «Рассчитать стоимость».
   Hero остаётся чистой кинематографичной «картиной»: вордмарк +
   script-подпись + eyebrow + scroll-cue. Цены по-прежнему на первом
   экране скролла НЕ ниже (первые ценники — сервис-секция/калькулятор),
   CTA живут в бургер-меню, хедере (после докинга) и теле страницы.
   Возврат eyebrow marginTop 2.5rem (F4 сжимал до 2rem под CTA-пару). */

export function TottHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* FIX-4 [F2, W1-D] §39 «живое видео без фриза: IO + preload="none"» —
   * preload="none": байты видео не запрашиваются, пока play() не вызван
   * IO-гейтом (rootMargin 100px — старт при появлении секции, pause при
   * уходе из вьюпорта — экономия трафика ниже фолда). poster-кадр
   * дедуплицирован с LCP-<Image> и gg-video-showcase.
   *
   * C72-FIX-2 (прямая просьба владельца: «на мобильном hero перестало
   * проигрываться видео, исправь»): C71-гейт «coarse-указатель ИЛИ
   * <768px → IO не создаётся, видео выкл навсегда» СНЯТ. Основание:
   * видео уже не 5.16MB, а 1.49MB (C71-P1 re-encode 720p/440kbps crf31
   * faststart), muted + playsInline допускают autoplay на iOS без жеста
   * юзера. Защиты, которые остались:
   * - saveData / соединение 2g (Network Information API) → постер:
   *   трафик владельца устройства дороже вау-эффекта;
   * - мобильный старт ждёт декода LCP-<img> (кап 2.5s) — видео не
   *   конкурирует с первым кадром страницы за канал;
   * - ретрай play() на первом касании — iOS Low Power Mode отклоняет
   *   autoplay, касание легализует старт;
   * - prefers-reduced-motion: IO не создаём — статичный постер (§39).
   */
  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    /* saveData/2g-гейт: «мобайл-ноль» теперь только для плохих сетей и
       режимов экономии, НЕ для всех мобильных (§41-правило переопределено
       владельцем — см. AGENTS.md §43). */
    type ConnInfo = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as Navigator & { connection?: ConnInfo }).connection;
    if (conn && (conn.saveData === true || /2g/.test(conn.effectiveType ?? ""))) return;

    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    /* 81-W2F3 [H #3]: мобильный источник видео. Ставим video.src ПРЯМО на
     * <video> (НЕ <source>.src): по HTML-спецификации установка/изменение
     * src-атрибута самого media-элемента ГАРАНТИРОВАННО перезапускает
     * алгоритм загрузки (load), а подмена дочернего <source>.src
     * пере-выбирается только пока networkState === NETWORK_EMPTY —
     * ненадёжно. При src-атрибуте на <video> дочерний <source> (720,
     * SSR-разметка не меняется) игнорируется — грузится только -480.
     * preload="none" держит байты обоих файлов до первого play(), а play()
     * вызывается только ниже по этому же эффекту (IO/тап) — то есть
     * ПОДМЕНА ВСЕГДА РАНЬШЕ play: сетевой перехват на мобиле видит ровно
     * один mp4 (-480), -720 не запрашивается вовсе. Десктоп — <source> 720. */
    if (isMobile) {
      video.src = HERO_VIDEO_MOBILE;
    }

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      // Muted-луп — разрешён всегда; отказ просто оставляет постер.
      void video.play().catch(() => {
        /* autoplay rejected (iOS Low Power Mode и т.п.) — постер
           остаётся, ретрай на первом касании ниже. */
      });
    };

    const playWhenReady = () => {
      if (!isMobile) {
        tryPlay();
        return;
      }
      const img = section.querySelector("img") as HTMLImageElement | null;
      if (!img || img.complete) {
        tryPlay();
        return;
      }
      /* Ждём LCP-кадр: видео не встаёт в очередь раньше первого экрана. */
      img.addEventListener("load", tryPlay, { once: true });
      window.setTimeout(tryPlay, 2500); /* кап: load может не прийти. */
    };

    /* iOS Low Power Mode: первый тап легализует muted-play. */
    const retryOnTouch = () => {
      tryPlay();
      window.removeEventListener("touchend", retryOnTouch);
      window.removeEventListener("touchstart", retryOnTouch);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          playWhenReady();
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    if (isMobile) {
      window.addEventListener("touchstart", retryOnTouch, { passive: true });
      window.addEventListener("touchend", retryOnTouch, { passive: true });
    }
    return () => {
      cancelled = true;
      io.disconnect();
      video.pause();
      window.removeEventListener("touchend", retryOnTouch);
      window.removeEventListener("touchstart", retryOnTouch);
    };
  }, [reduce]);

  /** FIX-4: React не сериализует атрибут `muted` в SSR-HTML (known
   *  React #10389) — пиним DOM-свойство на монте, чтобы muted-autoplay
   *  из IO-гейта никогда не отклонялся (как в gg-video-showcase). */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = true;
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-header-theme="transparent"
      aria-label="nilov catering — лучший кейтеринг Санкт-Петербурга"
      className="relative min-h-[100svh] w-full overflow-hidden bg-black"
      /* F4 / задача 2 (K1 MAJOR «first-paint крем-вспышка»): инлайновый
         SSR-гейт — тёмный espresso-фон секции сериализуется прямо в HTML,
         первый кадр под (ещё не загрузившимся) постером гарантированно
         тёмный = итоговому виду. Инлайн-стиль сильнее Tailwind-класса
         bg-black, поэтому класс оставлен как дублирующий фолбэк.
         САМА вспышка — двери прелоадера (preloader.tsx, крем-градиент
         from-cream to-parchment, чужой файл) — см. отчёт F4. */
      style={{ backgroundColor: "#0A0908" }}
    >
      {/* Background image — LCP priority (next/image). Sits at z-0 and acts
          as the video poster (the video overlays it once playing). */}
      <Image
        src={HERO_POSTER}
        alt="Лучший банкетный стол — кейтеринг nilov catering"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />

      {/* Background video — cinematic motion (replaces talkofthetown's static
          hero photo per task brief). Overlays the poster image (z-10) once it
          begins playing. object-cover fills viewport; muted + playsInline for
          autoplay + iOS compliance.
          FIX-4 [F2]: preload="none" + IO-гейт (см. эффект выше) — 5.16MB
          уходит из критического пути; poster = HERO_POSTER (дедуп с
          gg-video-showcase). autoPlay-атрибут убран — старт выдаёт IO,
          hero в вьюпорте с первой секунды, визуал не меняется.
          C71-P1 (Task 2+5): poster → HERO_VIDEO_POSTER (готовый 828w webp
          67KB вместо RAW jpg 595KB — двойная загрузка hero-кадра устранена,
          K8-CRITICAL); источник видео → re-encode 720p/440kbps crf31
          faststart (1.49MB вместо 5.16MB, новое имя = cache-bust; старый
          файл не удаляем — конвенция §28). */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] size-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={HERO_VIDEO_POSTER}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Layered overlays: center-weighted darkening so the white wordmark
          reads against any video frame, plus a bottom gradient so the
          bottom-docked nav (cream bg when scrolled) blends. */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/55 via-black/25 to-black/65"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.6)_100%)]"
        aria-hidden="true"
      />

      {/* 5px white border decorative frame — talkofthetown SR7 signature. */}
      <span className="tott-border-frame z-[3]" aria-hidden="true" />

      {/* CENTERED brand stack — per task v10: 3 lines, shifted DOWN for
          better optical balance (W1-FIX: translateY +40px — при +60px на
          1440×900 eyebrow «ЛУЧШИЙ КЕЙТЕРИНГ…» пересекался со scroll-cue
          «ЛИСТАЙТЕ»; +40 + bottom-12 (было bottom-28) дают зазор ≥8px), "food
          as art" made larger, and the eyebrow label wraps cleanly on mobile
          ("Лучший кейтеринг" / "Санкт-Петербурга") via an explicit <br> that
          only shows on small screens (hidden sm:inline).
          Composition:
            1. "nilov" / "catering." — massive high-contrast serif (Prata),
               two explicit lines (block spans — никогда не рвётся посреди
               слова, §1.5), gold dot after "catering"
            2. "food as art" — handwritten script (Nothing You Could Do),
               nestled tight below the wordmark (negative margin, signature)
            3. "ЛУЧШИЙ КЕЙТЕРИНГ" / "САНКТ-ПЕТЕРБУРГА" — small uppercase
               tracked sans-serif eyebrow (Lato via Karla Cyrillic fallback),
               wraps to 2 lines on mobile (break after "кейтеринг"), single
               line on sm+ screens. Generous editorial whitespace below the
               script pair.
          Text-shadow on white text for video-bg legibility. */}
      <div className="hero-stagger absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center [transform:translateY(40px)]">
        {/* Wordmark — Prata (high-contrast serif). Two stacked lines
            "nilov" / "catering." — вау-композиция: широкая строка
            "catering." (~4.1em) при 15vw занимает ~62vw — влезает и на
            мобиле, и на десктопе. Разрыв строк — осознанный (block-спаны
            по границе слов), mid-word перенос невозможен. Золотая точка
            после "catering" — фирменный акцент. Mobile floor 3.5rem
            держит иерархию над script-флор 2.25rem (task v11) и
            гарантирует, что "catering." не упирается в px-6-поля на
            320px-экранах. */}
        <h1
          /* Cycle 40 SEO fix: the visible wordmark alone carries no keywords;
             aria-label gives search engines «лучший кейтеринг
             Санкт-Петербурга» without changing the visual design. */
          aria-label="nilov catering — лучший кейтеринг Санкт-Петербурга"
          className="tott-display text-white"
          style={{
            fontSize: "clamp(3.5rem, 15vw, 10rem)",
            lineHeight: 0.93,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span className="block">nilov</span>
          <span className="block">
            catering<span style={{ color: "var(--gold)", marginLeft: "0.05em" }}>.</span>
          </span>
          {/* F4 / K3 SEO: визуально невидимое продолжение вордмарка — ключи
              «кейтеринг в Санкт-Петербурге» попадают в текстовое содержание
              H1 (Tailwind sr-only = clip-паттерн, см. stage-services.tsx).
              aria-label H1 уже несёт «лучший кейтеринг Санкт-Петербурга» —
              видимая часть «nilov catering» вложена в него (WCAG 2.5.3). */}
          <span className="sr-only"> — кейтеринг в Санкт-Петербурге</span>
        </h1>

        {/* Script tagline — Nothing You Could Do (Latin script font). Nestles tight
            under the wordmark (negative mt) for a signature/underline feel.
            Per user: "food as art" stays in English — латинский скрипт-акцент
            над латинским вордмарком «nilov catering» (food ↔ catering),
            фонетика и семантика читаются одинаково в обеих локáлях.
            Tilted -6° (rotate) for a handwritten signature gesture — mirrors
            gamma's tilted-accent device. The rotation lives on an inner
            <span> so the hero-rise CSS entry (translateY) on the outer <p>
            never touches it.
            Size kept smaller than the wordmark (floor 2.25rem vs 4rem) so the
            visual hierarchy holds on narrow screens. */}
        <p
          className="tott-script text-white/95"
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
            lineHeight: 1,
            /* W1-FIX: -0.5rem давал пересечение line-box'ов «catering.» и
               «food as art» на 8px @390×844 (замер критика); 0.25rem
               даёт 4px зазор. */
            marginTop: "0.25rem",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: "rotate(-6deg)",
              transformOrigin: "center",
            }}
          >
            food as art
          </span>
        </p>

        {/* Eyebrow label — Lato (sans-serif, .tott-body) ALL CAPS, small,
            wide letter-spacing. Per task v10: "сделай чтобы на мобильных
            версиях переносился лучший кейтеринг а следующая строга Санкт-
            Петербурга" — explicit <br className="sm:hidden"> after "кейтеринг"
            forces the wrap on mobile only; on sm+ screens the <br> is hidden
            so the label renders as one line. Generous editorial whitespace
            below the script pair (mt-10). padding-left optically centers
            the tracked label. */}
        <p
          className="tott-body text-white/85"
          style={{
            fontSize: "clamp(11px, 1.2vw, 14px)",
            lineHeight: 1.4,
            letterSpacing: "0.35em",
            fontWeight: 700,
            textTransform: "uppercase",
            /* Cycle-72: 2rem (F4-бюджет под CTA-пару) → 2.5rem — исходные
               «щедрые» редакционные отступы, CTA-пары больше нет. */
            marginTop: "2.5rem",
            paddingLeft: "0.35em",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Лучший кейтеринг
          <br className="sm:hidden" />
          {" "}Санкт-Петербурга
        </p>
      </div>

      {/* Scroll cue bottom-center (sits above the docked nav). W1-FIX:
          bottom-12 (was bottom-28) — at 1440×900 the cue overlapped the
          eyebrow label; measured gap after the fix ≥8px.
          81-F1: обёртка владеет ПОЗИЦИОНИРОВАНИЕМ (left-1/2
          -translate-x-1/2), внутренний .hero-cue узел — входом (opacity):
          CSS-transform в keyframes заменяет computed transform, поэтому
          позиционирующий translate обязан жить на РОДИТЕЛЕ (грабля §44).
          Линия — .hero-cue-line: пульс scaleY на собственном узле без
          других transform; reduced-motion → animation:none (CSS-гейт). */}
      <div
        className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="hero-cue flex flex-col items-center gap-2">
          <span className="tott-body text-[13px] font-bold uppercase tracking-[0.35em] text-white/85">
            Листайте
          </span>
          <span
            className="hero-cue-line block w-px bg-white/40"
            style={{ height: 54 }}
          />
        </div>
      </div>
    </section>
  );
}

export default TottHero;
