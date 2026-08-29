"use client";

/**
 * HaccBooking — Cycle 64 «СМЕТА-ЧЕК INTERFOOD».
 * Объединённый блок: калькулятор → живой бумажный смета-чек на красной
 * панели → инлайн-форма заявки → успех (штамп + tear-off + конфетти).
 * Контакты-зона с live-бейджем и ленивой Яндекс-картой — низ той же секции.
 *
 * Спецификация: research/c64/SPEC.md (12 контрактов §2 — соблюдены буквально,
 * см. карту контрактов в конце файла). Дизайн: research/c64/RESEARCH-DESIGN.md
 * («Смета-чек», one-screen booking cockpit).
 *
 * Архитектура перфа (юзер жаловался на тормоза — SPEC §4):
 *  - odometer гостей: ОДИН useSpring + per-digit useTransform (строки-em),
 *    ноль setState на кадр; итог — MotionValue<string> как child текста
 *    (textContent обновляется мимо React);
 *  - calcTotal — useMemo([typeId, guests, date]), addons = [] (юзер просил
 *    убрать секцию «Дополнительно»);
 *  - форма — изолированный React.memo-компонент: keystroke перерисовывает
 *    только форму, чек/контролы не трогает;
 *  - draft localStorage — дебаунс 300 мс (в contact.tsx был на каждый
 *    keystroke — perf-баг из RESEARCH-TECH §2.7);
 *  - Math.random — только в useMemo (конфетти) и useEffect (№ чека);
 *  - карта — IntersectionObserver-гейт (rootMargin 400px) + loading="lazy";
 *  - ноль бесконечных анимаций: ни одного repeat: Infinity в файле
 *    (live-точка бейджа — статичная, «пульс» убран сознательно);
 *  - scroll-listener'ов нет вообще (IO + MutationObserver только).
 *
 * Hydration (урок C62 §34): любые ветвления по useReducedMotion — через
 * mounted-гейт; SSR/первый клиентский рендер = статика, анимационные ветки
 * свапаются после монта с key-ремонтом (§35: initial не перевооружается).
 *
 * Fix1 (task 7-fix1, верификационные дефекты):
 *  - D1: entrance-наблюдение перенесено с бумаги на КОНТЕЙНЕР ПАНЕЛИ —
 *    у бумаги был собственный whileInView с clipPath-inset(…100%) в hidden,
 *    а clip-path с нулевой видимой областью хронически репортит
 *    IntersectionObserver isIntersecting=false (замер fix1-probe2: irH=0
 *    при bbox 422px) → вход не срабатывал никогда (пустая панель на мобиле).
 *    Теперь панель наблюдает (hidden: opacity+y), бумага наследует вариант;
 *  - D2: scroll-margin-top: 96px на #calculator/#contact (CSS) + двухтактный
 *    пере-якорь #contact после раскрытия формы (560ms + 1100ms, через lenis);
 *  - D3: sticky-bar живёт в DOM, скрытие — IO нижней полосы (rootMargin
 *    -140px, threshold 0.05, per-target Map §32) по зонам типов/CTA/контактов,
 *    показ/скрытие — transform+opacity (без mount-jump), hidden → inert;
 *  - D4: копирайт «Форма открыта слева» — адаптивный (md:hidden / hidden
 *    md:inline; на мобиле «Форма выше»);
 *  - D5: React.memo на TypeGrid / ReceiptLines / ContactsZone — смена
 *    гостей не перерисовывает типы, строки чека и контакты.
 *
 * Fix2 (task 9-fix2, правки волны-1 слепых критиков):
 *  - D1: aria-invalid поля красятся (красная рамка + #fff5f5) — валидация
 *    перестаёт быть «немой»;
 *  - D2: штамп «Заявка принята» ОДИН — на квитанции успеха (документ о
 *    приёме заявки); на чеке вместо штампа — текстовая строка
 *    «Заявка принята — квитанция {слева|выше}» (.hb-panel__next);
 *  - D3: фокус полей — ink/золото (канон сайта), красный только для ошибки;
 *  - D4: легенды «Шаг 1/2 из 2», узлы-цифры на нити-прогрессе;
 *  - D5: контраст подписей ink 63% (≥4.5:1), dim ведущих нулей 0.30;
 *  - Q1: кламп гостей и снизу, и СВЕРХУ (500) — на чтении URL и записи;
 *  - Q2: прошедшая дата — инлайн-подсказка + исключение из расчёта;
 *  - Q3: aria-valuetext слайдера «N гостей»;
 *  - C1: постоянная сноска сезона ДО ввода даты + единый канон
 *    «Высокий сезон: май–сентябрь и декабрь — ×1,15» (SEASON_CANON);
 *  - C2: ISO-даты → «19 сентября 2026 г.» (чек, сводка, успех);
 *  - C3: постоянная плашка у минимума гостей (не исчезает за 120 мс);
 *  - C4: полный список «Включено» (без slice(0,3));
 *  - C5: строка доверия «16 лет · 2 400+ событий» у контактов (факты §0);
 *  - C6: обещание перезвона согласовано с бейджем (закрыто → без «15 минут»);
 *  - C7: «9:00–19:00», «Мы перезвоним…», «{N} ₽/чел» / «≈… · высокий сезон ×1,15».
 *
 * Fix3 (task 11-fix3, правки волны-2: mobile + типографика):
 *  - M1: лифт sticky-бара над куки-баннером (--hbooking-cookie-h через
 *    MutationObserver) — слушатели снимаются после исчезновения баннера;
 *    добавлен плавный transition bottom 0.3s (бар съезжает вниз после accept);
 *  - M2: живая мини-сумма «≈ N ₽» под слайдером (строка ±5) — замыкает петлю
 *    «слайдер → цена» на обоих вьюпортах; БЕЗ aria-live (итог чека уже
 *    анонсируется, дубль спамил бы SR);
 *  - M3: карта — tap-to-activate: iframe pointer-events:none до активации,
 *    обёртка role="button" (клик/Enter/Space/фокус активирует), чип-аффорданс
 *    по центру; деактивации при blur/уходе курсора НЕТ (не мигать);
 *  - M4: ±5-кнопки ≥44px; мобильный кегль «от N ₽/чел» 13.5px;
 *  - M5: шаг 2 различим (подложка+рамка, узел «2»), шаг 1 после перехода
 *    приглушён (лейблы 0.55, поля редактируемые, возврат — кликом по легенде);
 *    «Далее» скроллит к шагу 2 и фокусирует согласие (lenis §33);
 *  - T1: дельта — фиксированный min-width слот в ch; итог остаётся Prata
 *    (±2px ширины — принятая подпись, см. комментарий у .hb-total__num);
 *  - T2: мобильный микрокегль чека ≥ 12.5/13.5/14px (только <768);
 *  - T3: единый формат телефона «+7 (911) 941-72-05» (formatPhoneDisplay);
 *  - T4: капс-шкала — 2 уровня (eyebrow 12.5/0.18em, label 11.5/0.14em);
 *  - T5: один красный на кнопку типа (канон соседей — red-deep, AA);
 *    бейдж: «Закрыто · откроется…» — пробел перед «·» восстановлен.
 *  NOTE: блокер мобильного критика «форма не принимает ввод» ОПРОВЕРГНУТ
 *  измерением (probe/input-check: fill+pressSequentially работают на 1440 и
 *  390) — логика инпутов в этом таске НЕ трогалась.
 *
 * Контракты SPEC §2 — карта реализации:
 *  1. nuqs type/guests (parseAsString/parseAsInteger, defaults buffet/50),
 *     кламп guests → minGuests — см. useQueryState + clamp-эффект;
 *  2. presetCalculator-совместимость — те же хуки nuqs читают
 *     history.replaceState из hacc-menu;
 *  3. pricing.ts не тронут; calcTotal(..., [], date); formatRUB везде;
 *  4. POST /api/lead + чтение error из 400-ответа в toast;
 *  5. PHONE_REGEX + normalizePhone — единый источник для поля и сабмита;
 *  6. draft «catering-lead-draft»: EMPTY ← draft ← URL (URL живёт в nuqs,
 *     сильнее по определению), запись дебаунс 300 мс;
 *  7. CustomEvent catering:calc-lead при успешном сабмите (addons: []) +
 *     слушатель catering:menu-select (строка И {typeId,guests} — оба шейпа);
 *  8. id="calculator" на секции, id="contact" на зоне формы;
 *  9. toast-канон «Перезвоним за 15 минут в рабочее время» (динамика C6
 *     fix2: офис ЗАКРЫТ → «Перезвоним в ближайшее рабочее время»); Office
 *     hours Europe/Moscow Пн–Пт 9–19, Сб 10–16, Вс закрыто;
 * 10. CONTACTS из lib/config.ts, карта YANDEX_MAPS.embedSrc, lazy;
 * 11. mounted-гейты, aria-live (троттлинг 700мс), aria-pressed, fieldset/
 *     legend, 44px+, фокус в первое поле, reduced-motion → статика,
 *     чекбокс 152-ФЗ со ссылкой /privacy;
 * 12. все цены — из pricing.ts (perGuest/minGuests/formatRUB), ноль ручных.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Magnetic } from "@/components/motion/magnetic";
import { TiltedAccent } from "@/components/catering/tilted-accent";
import { useMounted } from "@/hooks/use-mounted";
import { CONTACTS } from "@/lib/config";
import { YANDEX_MAPS } from "@/lib/media";
import {
  MENU_TYPES,
  calcTotal,
  formatRUB,
  type MenuType,
} from "@/lib/pricing";

import "./hacc-booking.css";

/* ------------------------------------------------------------------ config */

/** Editorial easing — канон репо (cep-process/hacc-menu/back-to-top). */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * D1 (task 7-fix1): entrance-наблюдение живёт ТОЛЬКО на контейнере панели.
 * Раньше у бумаги был собственный whileInView с hidden-стейтом
 * clipPath: inset(0% 0% 100% 0%) — clip-path с нулевой видимой областью
 * ХРОНИЧЕСКИ репортит IntersectionObserver isIntersecting=false
 * (замер fix1-probe2.mjs: intersectionRect.height=0 при bbox 422px,
 * элемент целиком во вьюпорте) → наблюдатель никогда не срабатывал →
 * «пустая красная панель» на мобиле. Теперь панель наблюдает (её hidden —
 * opacity+y, коробка цела), а бумага наследует вариант-лейбл — собственного
 * IO у неё нет, deadlock невозможен. SSR/no-JS: initial={false} → статика.
 */
const HB_PANEL_VARIANTS: Variants = {
  "hb-hidden": { opacity: 0, y: 32 },
  "hb-show": { opacity: 1, y: 0 },
};

const HB_PAPER_VARIANTS: Variants = {
  "hb-hidden": { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.5 },
  "hb-show": {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: { duration: 0.7, ease: EASE, delay: 0.1 },
  },
};

/** Ключ draft — ЕДИН с прежним contact.tsx (чужие черновики подхватываются). */
const DRAFT_KEY = "catering-lead-draft";

/**
 * Русский телефон-regex — ЕДИН с прежним contact.tsx (SPEC §2.5).
 * Прогоняется по строке, очищенной от всего кроме +/цифр.
 */
const PHONE_REGEX = /^(\+7|7|8)?\d{10}$/;

/**
 * Cycle 40 (перенос из contact.tsx без изменений): «9991234567» — самый
 * частый ввод; сервер отклонял 400. Нормализуем все принятые шейпы к
 * каноническому +7XXXXXXXXXX перед POST.
 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "+7" + digits;
  if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
  return raw.trim();
}

/**
 * T3 (task 11-fix3): единый формат ОТОБРАЖЕНИЯ телефона в блоке —
 * «+7 (911) 941-72-05» (скобки). Данные CONTACTS не трогаем (site-level,
 * их читают футер/шапка) — формат применяется только к отображению здесь.
 * Нераспознанные строки возвращаются как есть (fail-open).
 */
function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "");
  /* Wave-4: 10 цифр («9991234567») = самый частый ввод — тоже форматируем. */
  const bare10 = d.length === 10 ? `7${d}` : null;
  const digits = d.length === 11 && d.startsWith("8") ? `7${d.slice(1)}` : bare10 ?? d;
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  return raw;
}

/** Часы офиса — ЕДИНЫ с OfficeHours contact.tsx (SPEC §2.9; C7: диапазон без пробелов). */
const OFFICE_HOURS = {
  weekdays: "Пн–Пт: 9:00–19:00",
  saturday: "Сб: 10:00–16:00",
  sunday: "Вс: закрыто",
};

/**
 * Канон сезона — ОДНА формулировка на весь блок (C1, task 9-fix2):
 * строка в чеке, сноска под чеком, подпись у даты. Никаких
 * «сезонный спрос» и «Сезон (май–сентябрь, декабрь)».
 */
const SEASON_LABEL = "Высокий сезон: май–сентябрь и декабрь";
const SEASON_CANON = `${SEASON_LABEL} — ×1,15`;

/** Тики слайдера гостей — как в calculator.tsx (вехи, не линейная шкала). */
const SLIDER_TICKS = [25, 50, 100, 200, 500];
const GUESTS_MAX = 500;

/** Конфетти — цвета бренда (ea-red/cep-red/cream/ink/gold), без неона. */
const CONFETTI_COLORS = ["#E71D3A", "#FF360A", "#F7F5F5", "#1F2937", "#D4A373"];

/** Катушка цифр odometer: 0–9 и дополнительный 0 на хвост 9→0. */
const ODO_GLYPHS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/** «от 20 гостей»: 21/101 → «гостя», остальное → «гостей» (канон hacc-menu). */
function guestsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  return mod10 === 1 && mod100 !== 11 ? "гостя" : "гостей";
}

/** ISO-дата «сегодня» для min у date-инпута (локальная, не UTC). */
function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * «2026-09-19» → «19 сентября 2026 г.» (C2, task 9-fix2): ISO остаётся
 * только в value инпута и машинных полях, в человеческом тексте — нигде.
 */
function formatHumanDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/* ---------------------------------------------------- odometer математика */

/**
 * Позиции катушек (в em) для 3 разрядов. Каскад честного одометра:
 * младший разряд едет непрерывно; разряд i «перематывается» 9→0 только
 * пока НИЖНИЙ отображаемый разряд находится за 9 (тогда позиция i уходит
 * в хвостовой 0-глиф). Проверено на 99 / 99.5 / 100 / 500.
 */
function odometerPositions(v: number): [number, number, number] {
  const p0 = ((v % 10) + 10) % 10;
  const p1 = (Math.floor(v / 10) % 10) + Math.max(0, p0 - 9);
  const p2 = (Math.floor(v / 100) % 10) + Math.max(0, p1 - 9);
  return [p0, p1, p2];
}

/* =========================================================== ОДОМЕТР ГОСТЕЙ */

/**
 * Катушки цифр гостей. Один useSpring на значение; каждая колонка —
 * useTransform строки `-N em`. НОЛЬ setState на кадр (SPEC §4.1).
 * Ведущие нули приглушаются (opacity-трансформ от того же спринга).
 */
function OdometerGuests({ value, animate }: { value: number; animate: boolean }) {
  const spring = useSpring(value, { stiffness: 170, damping: 24, mass: 0.9 });

  useEffect(() => {
    if (animate) spring.set(value);
    else spring.jump(value);
  }, [value, spring, animate]);

  return (
    <span className="hb-odo" role="img" aria-label={`${value} ${guestsLabel(value)}`}>
      {/* DOM-порядок = визуальный слева→направо: СОТНИ, десятки, единицы.
          Живой баг (пойман пробой 145 → «541», 500 → «005»): map [0,1,2]
          рендерил колонку ЕДИНИЦ левее сотен; dim-пороги в OdometerColumn
          при этом уже предполагали сотни-слева (index 0: dim при v<100 —
          ведущий ноль гаснет первым). Реверс map чинит и порядок, и dim. */}
      {([2, 1, 0] as const).map((i) => (
        <OdometerColumn key={i} index={i} spring={spring} />
      ))}
    </span>
  );
}

function OdometerColumn({
  index,
  spring,
}: {
  index: 0 | 1 | 2;
  spring: MotionValue<number>;
}) {
  // Кламп отображаемого значения в [0, 999] — против подлёта пружины.
  const pos = useTransform(spring, (raw) => {
    const v = Math.min(999, Math.max(0, raw));
    return `-${odometerPositions(v)[index]}em`;
  });
  // Ведущий ноль приглушается: сотни при v<100, десятки при v<10.
  // D5 (task 9-fix2): dim 0.30 — читается как часть числа, но явно вторичен
  // (0.18 критик приняла за бледный итог).
  const dim = useTransform(spring, (raw) => {
    const threshold = index === 2 ? 100 : index === 1 ? 10 : 0;
    return raw < threshold ? 0.3 : 1;
  });

  return (
    <motion.span className="hb-odo__col" style={{ opacity: dim }} aria-hidden="true">
      <motion.span className="hb-odo__strip" style={{ y: pos }}>
        {ODO_GLYPHS.map((g, gi) => (
          <span key={gi} className="hb-odo__glyph">
            {g}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

/* =============================================================== ИТОГ ЧЕКА */

/**
 * Итог сметы: useSpring → formatRUB как MotionValue-child — React не
 * ререндерится вообще, обновляется только textContent (SPEC §4.1).
 */
function MotionTotal({ value, className }: { value: number; className?: string }) {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  useEffect(() => {
    // SPEC §3.4: reduced-motion → статика. jump = мгновенный перескок без кадров.
    if (mounted && reduce) spring.jump(value);
    else spring.set(value);
  }, [value, spring, mounted, reduce]);
  /* D5 (7-fix1): spring может остановиться на restDelta (±1₽ от цели после
     округления) — на хвосте анимации (<0.6₽ до цели) досыпаем до ТОЧНОГО
     значения из pricing.ts (скачок <0.6₽ визуально неотличим после formatRUB). */
  useMotionValueEvent(spring, "change", (v) => {
    if (v !== value && Math.abs(v - value) < 0.6) spring.jump(value);
  });
  const text = useTransform(spring, (v) => formatRUB(Math.round(v)));
  return <motion.span className={className}>{text}</motion.span>;
}

/** Дельта «+12 400 ₽» — вспыхивает ОДИН раз на изменение итога (P3). */
function TotalDelta({ total, animate }: { total: number; animate: boolean }) {
  const prevRef = useRef(total);
  const [flash, setFlash] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    if (prevRef.current === total) return;
    const d = total - prevRef.current;
    prevRef.current = total;
    if (!animate || d === 0) return;
    setFlash({
      text: `${d > 0 ? "+" : "−"}${formatRUB(Math.abs(d))}`,
      key: Date.now(),
    });
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [total, animate]);

  return (
    <span className="hb-delta-slot" aria-hidden="true">
      <AnimatePresence>
        {flash && (
          <motion.span
            key={flash.key}
            className="hb-delta"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut", times: [0, 0.2, 0.6, 1] }}
          >
            {flash.text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ======================================================== LIVE-БЕЙДЖ ЧАСОВ */

function useOfficeStatus() {
  const [status, setStatus] = useState<{ open: boolean; nextLabel: string }>({
    open: false,
    nextLabel: "",
  });

  useEffect(() => {
    const compute = () => {
      /* Weekday парсим в en-US («sat»/«wed»): ru-RU отдаёт «сб»/«ср», которые
         НИКОГДА не совпадали с проверками ниже — бейдж всегда показывал
         «Закрыто» даже в среду днём (живой баг, вскрылся при заводе
         динамики C6 task 9-fix2; лейблы остаются русскими). */
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Moscow",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = fmt.formatToParts(new Date());
      const wd = (parts.find((p) => p.type === "weekday")?.value ?? "").toLowerCase();
      const hr = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const min = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const time = hr * 60 + min;
      if (["mon", "tue", "wed", "thu", "fri"].includes(wd)) {
        const open = time >= 9 * 60 && time < 19 * 60;
        setStatus({
          open,
          nextLabel: open ? "до 19:00" : time < 9 * 60 ? "откроется в 9:00" : "откроется в пн в 9:00",
        });
      } else if (wd === "sat") {
        const open = time >= 10 * 60 && time < 16 * 60;
        setStatus({
          open,
          nextLabel: open ? "до 16:00" : time < 10 * 60 ? "откроется в 10:00" : "откроется в пн в 9:00",
        });
      } else {
        setStatus({ open: false, nextLabel: "откроется в пн в 9:00" });
      }
    };
    compute();
    const id = setInterval(compute, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return status;
}

/** Бейдж «Открыто/Закрыто» (Europe/Moscow, интервал 60с). Точка статичная —
 *  бесконечные pulse-анимации в этом файле запрещены (SPEC §4.5). */
function OpenBadge() {
  const status = useOfficeStatus();
  return (
    <span
      className={`hb-badge ${status.open ? "hb-badge--open" : "hb-badge--closed"}`}
      role="status"
      title={status.nextLabel || undefined}
    >
      <span className="hb-badge__dot" aria-hidden="true" />
      {/* T5 (task 11-fix3): middot с пробелами ВНУТРИ текстового узла —
          раньше «Закрыто» + «· …» клеились без пробела (innerText читал
          «Закрыто· откроется…»). Точка-статус отделена flex-gap обёртки. */}
      <span>
        {status.open ? "Открыто" : "Закрыто"}
        {status.nextLabel ? ` · ${status.nextLabel}` : ""}
      </span>
    </span>
  );
}

/* ================================================================ КОНТАКТЫ */

type ContactItem = {
  sub: string;
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
  highlight?: boolean;
};

function useContactItems(): ContactItem[] {
  return useMemo(
    () => [
      {
        sub: "Телефон",
        label: formatPhoneDisplay(CONTACTS.phone),
        href: CONTACTS.phoneHref,
        icon: Phone,
        highlight: true,
      },
      {
        sub: "WhatsApp",
        label: formatPhoneDisplay(CONTACTS.whatsapp),
        href: CONTACTS.whatsappHref,
        icon: MessageCircle,
        external: true,
      },
      {
        sub: "Telegram",
        label: formatPhoneDisplay(CONTACTS.telegram),
        href: CONTACTS.telegramHref,
        icon: Send,
        external: true,
      },
      {
        sub: "Instagram",
        label: CONTACTS.instagram,
        href: CONTACTS.instagramHref,
        icon: Instagram,
        external: true,
      },
      {
        sub: "Email",
        label: CONTACTS.email,
        href: `mailto:${CONTACTS.email}`,
        icon: Mail,
      },
      {
        sub: "Адрес",
        label: YANDEX_MAPS.address,
        href: YANDEX_MAPS.href,
        icon: MapPin,
        external: true,
      },
    ],
    [],
  );
}

/** Крупная контакт-строка (desktop ≥768). Hover — красное подчёркивание. */
function ContactRow({ item }: { item: ContactItem }) {
  const Icon = item.icon;
  return (
    <a
      className={`hb-clink ${item.highlight ? "hb-clink--hl" : ""}`}
      href={item.href}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${item.sub}: ${item.label}${item.external ? " (откроется в новой вкладке)" : ""}`}
    >
      <span className="hb-clink__icon" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <span className="hb-clink__body">
        <span className="hb-clink__sub">{item.sub}</span>
        <span className="hb-clink__value">{item.label}</span>
      </span>
      <ArrowRight className="hb-clink__arrow" aria-hidden="true" />
    </a>
  );
}

/** Тикер контактов (mobile <768) — чистая декорация, aria-hidden целиком;
 *  настоящие ссылки — в карточках под ним. Пауза на hover (CSS). */
function ContactTicker({ items }: { items: ContactItem[] }) {
  return (
    <div className="hb-ticker" aria-hidden="true">
      <div className="hb-ticker__inner">
        {[0, 1].map((dup) => (
          <div className="hb-ticker__track" data-dup={dup} key={dup}>
            {items.map((it) => (
              <span key={`${dup}-${it.sub}`} className="hb-ticker__item">
                <it.icon className="size-4" aria-hidden="true" />
                {it.sub} — {it.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Яндекс-карта — гейт IntersectionObserver (rootMargin 400px) + native lazy.
 * M3 (task 11-fix3): стандартный tap-to-activate — до активации iframe
 * pointer-events:none (свайп над картой скроллит страницу, а не панорамирует
 * карту), поверх — чип «Нажмите, чтобы активировать карту». Активация: клик
 * по обёртке / Enter / Space / фокус обёртки (tabIndex=0, role="button" до
 * активации). src НЕ перезагружается — меняется только pointer-events.
 * Деактивации при blur/уходе курсора НЕТ (не мигать).
 */
function LazyMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  const activate = useCallback(() => setActive(true), []);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!active && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setActive(true);
    }
  };

  return (
    <div
      ref={ref}
      className="hb-map"
      data-active={active ? "true" : "false"}
      {...(!active
        ? {
            role: "button" as const,
            tabIndex: 0 as const,
            "aria-label": "Нажмите, чтобы активировать интерактивную карту",
          }
        : {})}
      onClick={activate}
      onKeyDown={onKeyDown}
      onFocus={activate}
    >
      {near ? (
        <>
          <iframe
            src={YANDEX_MAPS.embedSrc}
            title="Interfood Catering на карте — Санкт-Петербург, ул. Большая Морская, 18"
            className="hb-map__iframe"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            role="img"
            tabIndex={active ? 0 : -1}
            allowFullScreen
          />
          {/* Чип-аффорданс — только визуал (семантику даёт обёртка); сам
              pointer-events:none — не мешает ни клику активации, ни свайпу. */}
          {!active && (
            <span className="hb-map__hint" aria-hidden="true">
              <MapPin className="size-4" />
              Нажмите, чтобы активировать карту
            </span>
          )}
        </>
      ) : (
        <div className="hb-map__ph" aria-hidden="true">
          <MapPin className="size-6" />
          <span>{YANDEX_MAPS.address}</span>
        </div>
      )}
    </div>
  );
}

/** Контакты-зона: бейдж + крупные ссылки (desktop) / тикер + карточки
 *  (mobile) + ленивая карта. Реквизиты/соцсети футера НЕ дублируются
 *  (SPEC §2.10) — только быстрые CTA-контакты, часы и карта.
 *  D5 (task 7-fix1): React.memo с единственным stable-ref пропом —
 *  смена гостей/типа не перерисовывает зону контактов вовсе. */
const ContactsZone = memo(function ContactsZone({ hideRef }: { hideRef?: Ref<HTMLDivElement> }) {
  const items = useContactItems();

  return (
    <div ref={hideRef} data-hb-hide="contacts" className="hb-contacts mt-16 md:mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="ea-eyebrow">Контакты</span>
          <h3 className="hb-contacts__title">Быстрее всего — позвонить.</h3>
        </div>
        <OpenBadge />
      </div>

      <p className="hb-contacts__hours">
        <Clock className="size-4" aria-hidden="true" />
        {OFFICE_HOURS.weekdays} · {OFFICE_HOURS.saturday} · {OFFICE_HOURS.sunday}
      </p>

      {/* C5 (task 9-fix2): строка доверия — ТОЛЬКО факты из AGENTS §0
          (16 лет, 2 400+ событий); никаких ОГРН/ИНН/отзывов — их нет в данных. */}
      <p className="hb-trust">16 лет в Санкт-Петербурге · 2 400+ событий</p>

      {/* Desktop: крупные строки */}
      <div className="hb-contacts__rows">
        {items.map((it) => (
          <ContactRow key={it.sub} item={it} />
        ))}
      </div>

      {/* Mobile: тикер + карточки 2-col */}
      <ContactTicker items={items} />
      <div className="hb-contacts__cards">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <a
              key={it.sub}
              className="hb-ccard"
              href={it.href}
              {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={`${it.sub}: ${it.label}`}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="hb-ccard__body">
                <span className="hb-ccard__sub">{it.sub}</span>
                <span className="hb-ccard__value">{it.label}</span>
              </span>
            </a>
          );
        })}
      </div>

      <LazyMap />
    </div>
  );
});

/* ==================================================================== ФОРМА */

type FormStatus = "idle" | "loading" | "success" | "error";

/**
 * Изолированная форма заявки (React.memo): keystroke перерисовывает ТОЛЬКО
 * форму — чек и контролы не трогаются (SPEC §4.4).
 *
 * Draft: восстановление полей контактов на маунте (EMPTY ← draft), запись —
 * дебаунс 300 мс. type/guests живут в nuqs родителя → URL всегда сильнее
 * draft (порядок EMPTY ← draft ← URL из SPEC §2.6 соблюдён по построению).
 * Согласие в draft НЕ сохраняется — согласие обязано быть явным действием.
 */
const LeadForm = memo(function LeadForm({
  typeId,
  guests,
  dateHuman,
  total,
  toastPromise,
  onSuccess,
}: {
  typeId: string;
  guests: number;
  /** Валидная дата в человеческом формате («19 сентября 2026 г.») или "" (C2). */
  dateHuman: string;
  total: number;
  /** Обещание перезвона для тоста — динамическое от офиса (C6, task 9-fix2). */
  toastPromise: string;
  onSuccess: (leadId: string | number | undefined) => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  /** M5 (task 11-fix3): контейнер шага 2 — цель скролла после «Далее». */
  const step2Ref = useRef<HTMLDivElement>(null);

  /* --- draft restore (один раз на маунт) --- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Partial<{
        name: string;
        phone: string;
        email: string;
        preferredTime: string;
      }>;
      if (typeof d.name === "string") setName(d.name);
      if (typeof d.phone === "string") setPhone(d.phone);
      if (typeof d.email === "string") setEmail(d.email);
      if (typeof d.preferredTime === "string") setPreferredTime(d.preferredTime);
    } catch {
      // non-critical
    }
  }, []);

  /* --- draft save — ДЕБАУНС 300 мс (SPEC §2.6; в старом коде был каждый
         keystroke — perf-баг). Пустая форма не пишется. --- */
  useEffect(() => {
    if (!name && !phone && !email && !preferredTime) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ name, phone, email, preferredTime }),
        );
      } catch {
        // non-critical
      }
    }, 300);
    return () => clearTimeout(t);
  }, [name, phone, email, preferredTime]);

  const phoneDigits = phone.replace(/[^+0-9]/g, "");
  const phoneValid = PHONE_REGEX.test(phoneDigits);
  const nameValid = name.trim().length > 1;

  const goNext = () => {
    const nextErrors = { name: !nameValid, phone: !phoneValid };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) return;
    setStep(1);
  };

  /* M5a (task 11-fix3): после перехода — плавный скролл к шагу 2 + фокус на
     чекбокс согласия (§33: Lenis перебивает программные скроллы — идём через
     window.__lenis; если шаг 2 уже целиком в кадре — только фокус).
     620 мс = запас на вход AnimatePresence (0.3 s). */
  useEffect(() => {
    if (step !== 1) return;
    const t = window.setTimeout(() => {
      const el = step2Ref.current;
      if (!el || !el.isConnected) return;
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        const lenis = (window as unknown as { __lenis?: { scrollTo?: (t: Element, o?: object) => void } }).__lenis;
        if (typeof lenis?.scrollTo === "function") lenis.scrollTo(el, { offset: -16 });
        else el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      document.getElementById("hb-consent")?.focus({ preventScroll: true });
    }, 620);
    return () => window.clearTimeout(t);
  }, [step]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: normalizePhone(phone),
          email: email || undefined,
          eventType: typeId || undefined,
          guests,
          message:
            [
              dateHuman && `Желаемая дата: ${dateHuman}`,
              preferredTime && `Желаемое время звонка: ${preferredTime}`,
              `Расчёт с сайта: ~${formatRUB(total)}`,
            ]
              .filter(Boolean)
              .join("\n") || undefined,
          consentAccepted: true,
        }),
      });

      if (!res.ok) {
        // SPEC §2.4: текст ошибки из 400-ответа читаем и показываем.
        let serverError = "";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) serverError = data.error;
        } catch {
          // тело не JSON — покажем дефолт
        }
        toast.error(serverError || "Не удалось отправить заявку. Позвоните нам напрямую.");
        setStatus("idle");
        return;
      }

      const data = (await res.json().catch(() => null)) as { id?: string | number } | null;
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // non-critical
      }
      toast.success(`Заявка принята! ${toastPromise}.`);
      onSuccess(data?.id);
    } catch (err) {
      if (err instanceof TypeError) {
        toast.error("Нет связи с сервером. Проверьте интернет-соединение и попробуйте ещё раз.");
      } else {
        toast.error("Не удалось отправить. Позвоните нам напрямую.");
      }
      setStatus("idle");
    }
  };

  const menuType = MENU_TYPES.find((m) => m.id === typeId) ?? MENU_TYPES[0];

  /* D3 (task 9-fix2): focus-хвосты (красные утилиты Tailwind) сняты —
     фокус поля теперь ink/золото из CSS; красный — ТОЛЬКО aria-invalid. */
  const field =
    "hb-input w-full rounded-xl border border-border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-all placeholder:text-ink/35";

  return (
    <form
      className="hb-form"
      onSubmit={submit}
      aria-label="Форма заявки на кейтеринг"
      noValidate
    >
      {/* Нить-прогресс: тонкая красная «строчка» слева (не визард-полоса).
          D4 (task 9-fix2): два узла с цифрами шагов — активный залит красным. */}
      <span className="hb-form__thread" aria-hidden="true">
        <motion.span
          className="hb-form__thread-fill"
          initial={false}
          animate={{ scaleY: step === 0 ? 0.5 : 1 }}
          transition={{ duration: 0.45, ease: EASE }}
        />
        <span className={`hb-form__node hb-form__node--1 ${step === 0 ? "hb-form__node--on" : ""}`}>
          1
        </span>
        <span className={`hb-form__node hb-form__node--2 ${step === 1 ? "hb-form__node--on" : ""}`}>
          2
        </span>
      </span>

      {/* M5 (task 11-fix3): шаг 1 ПОСЛЕ перехода НЕ прячется (контекст важен) —
          приглушается (лейблы 0.55, поля редактируемые), возврат — кликом
          по легенде. Шаг 2 — различимая подложка (hb-form__fieldset--panel). */}
      <fieldset
        className={`hb-form__fieldset ${step === 1 ? "hb-form__fieldset--dim" : ""}`}
      >
        <legend className="hb-form__legend">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="hb-form__legend-btn"
              aria-label="Вернуться к шагу 1 — Контакты"
            >
              Шаг 1 из 2 — Контакты
            </button>
          ) : (
            "Шаг 1 из 2 — Контакты"
          )}
        </legend>

              <div className="hb-field">
                <label htmlFor="hb-name" className="hb-label">
                  Имя <span aria-hidden="true" className="text-[var(--ea-red)]">*</span>
                </label>
                <input
                  id="hb-name"
                  ref={nameRef}
                  className={field}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Как к вам обращаться"
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={errors.name ? "hb-name-err" : undefined}
                  required
                />
                {errors.name && (
                  <p id="hb-name-err" className="hb-err" role="alert">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    Введите имя — хотя бы два символа
                  </p>
                )}
              </div>

              <div className="hb-field">
                <label htmlFor="hb-phone" className="hb-label">
                  Телефон <span aria-hidden="true" className="text-[var(--ea-red)]">*</span>
                </label>
                <input
                  id="hb-phone"
                  className={field}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => {
                    setErrors((er) => ({ ...er, phone: phone ? !phoneValid : false }));
                    /* Wave-4 (product-critic MINOR): маска при blur — display-only
                       формат «+7 (999) 123-45-67» для валидного ввода. normalizePhone
                       на сабмите работает с любым форматом, драфт не ломаем. */
                    if (phoneValid) setPhone((p) => formatPhoneDisplay(p));
                  }}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+7 (999) 123-45-67"
                  aria-invalid={errors.phone ? "true" : undefined}
                  aria-describedby={errors.phone ? "hb-phone-err" : undefined}
                  required
                />
                {errors.phone && (
                  <p id="hb-phone-err" className="hb-err" role="alert">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    Нужен телефон в формате +7…, 8… или 10 цифр
                  </p>
                )}
              </div>

              <div className="hb-field">
                <label htmlFor="hb-email" className="hb-label">
                  Email <span className="hb-label__opt">— необязательно</span>
                </label>
                <input
                  id="hb-email"
                  className={field}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="Пришлём смету письмом"
                />
              </div>

              <div className="hb-field">
                <label htmlFor="hb-time" className="hb-label">
                  Желаемое время звонка <span className="hb-label__opt">— необязательно</span>
                </label>
                <input
                  id="hb-time"
                  className={field}
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="Например: вечером после 18:00"
                />
              </div>

              {/* Кнопка «Далее» живёт только на шаге 1 (после перехода
                  шаг 1 приглушён, возврат — по легенде, M5). */}
              {step === 0 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="hb-btn hb-btn--red mt-1 min-h-[48px] w-full"
                >
                  Далее — к отправке
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              )}
      </fieldset>

      {/* Шаг 2 — появляется ПОД приглушённым шагом 1 (M5): тонкая рамка +
          фоновая подложка, узел «2» на нити зажигается (JSX выше). */}
      <AnimatePresence initial={false}>
        {step === 1 && (
          <motion.div
            key="send"
            ref={step2Ref}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <fieldset className="hb-form__fieldset hb-form__fieldset--panel">
              <legend className="hb-form__legend">Шаг 2 из 2 — Отправить</legend>

              {/* Мини-сводка расчёта */}
              <dl className="hb-summary">
                <div className="hb-summary__row">
                  <dt>Формат</dt>
                  <dd>{menuType.label}</dd>
                </div>
                <div className="hb-summary__row">
                  <dt>Гостей</dt>
                  <dd>{guests}</dd>
                </div>
                {dateHuman && (
                  <div className="hb-summary__row">
                    <dt>Дата</dt>
                    <dd>{dateHuman}</dd>
                  </div>
                )}
                <div className="hb-summary__row">
                  <dt>Имя</dt>
                  <dd>{name}</dd>
                </div>
                <div className="hb-summary__row">
                  <dt>Телефон</dt>
                  {/* T3 (task 11-fix3): единый формат отображения с контактами */}
                  <dd>{formatPhoneDisplay(normalizePhone(phone))}</dd>
                </div>
                <div className="hb-summary__row hb-summary__row--total">
                  <dt>Расчёт</dt>
                  <dd>~{formatRUB(total)}</dd>
                </div>
              </dl>

              {/* Согласие 152-ФЗ — обязательно, ссылка /privacy */}
              <label className="hb-consent" htmlFor="hb-consent">
                <input
                  id="hb-consent"
                  type="checkbox"
                  className="hb-consent__box"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  Соглашаюсь с обработкой персональных данных на условиях{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hb-consent__link">
                    политики конфиденциальности
                  </a>{" "}
                  (152-ФЗ).
                </span>
              </label>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="hb-btn hb-btn--ghost min-h-[48px] shrink-0"
                  aria-label="Вернуться к контактам"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Назад
                </button>
                <Magnetic strength={0.2} className="grow">
                  <button
                    type="submit"
                    disabled={status === "loading" || !consent}
                    className="hb-btn hb-btn--red min-h-[48px] w-full justify-center disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Отправляем…
                      </>
                    ) : (
                      <>
                        Отправить заявку
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </Magnetic>
              </div>

              {/* Подсказка, почему кнопка ещё не активна (канон C38) */}
              {!consent && status === "idle" && (
                <p className="hb-hint" role="status">
                  Подтвердите согласие — и кнопка оживёт
                </p>
              )}

              <p className="hb-safe">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Данные защищены · обрабатываются по 152-ФЗ
              </p>
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
});

/* ============================================================== КОНФЕТТИ */

/** Однократный залп 30 частиц в цветах бренда. Math.random — в useMemo
 *  (SPEC §4.6); reduced-motion → не рендерится вовсе (гейт в родителе). */
function ConfettiBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        dur: 1.1 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 140,
        rot: (Math.random() - 0.5) * 300,
        w: 7 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );

  return (
    <div className="hb-confetti" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="hb-confetti__chip"
          style={{ left: `${p.left}%`, backgroundColor: p.color, width: p.w, height: p.w * 0.42 }}
          initial={{ y: -24, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 340, x: p.drift, rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn", times: [0, 0.7, 1] }}
        />
      ))}
    </div>
  );
}

/* ============================================================ УСПЕХ (201) */

/**
 * Квитанция успеха: № заявки из API, ЕДИНСТВЕННЫЙ штамп «Заявка принята»
 * (D2, task 9-fix2: печать ставится на ДОКУМЕНТ о приёме заявки; на
 * смете-чеке вместо штампа — текстовая строка .hb-panel__next рядом),
 * Marck Script-строка (динамическое обещание C6), дата события
 * по-человечески (C2), однократное конфетти.
 */
function SuccessPanel({
  leadId,
  menuType,
  guests,
  total,
  dateHuman,
  promiseLine,
  onReset,
  settled,
}: {
  leadId: string | number | undefined;
  menuType: MenuType;
  guests: number;
  total: number;
  dateHuman: string;
  promiseLine: string;
  onReset: () => void;
  settled: boolean;
}) {
  return (
    <div className="hb-success">
      {settled && <ConfettiBurst />}
      <div className="hb-success__paper">
        {/* D2 (task 9-fix2): единственный штамп блока — здесь, на квитанции.
            Компонент маунтится ТОЛЬКО после interact-сабмита (settled уже
            устойчив) — §35 «initial не перевооружается» неприменим. */}
        <motion.span
          className="hb-stamp"
          initial={settled ? { scale: 1.5, opacity: 0, filter: "blur(8px)", rotate: -16 } : false}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", rotate: -12 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "backOut" }}
        >
          Заявка принята
        </motion.span>
        <p className="hb-success__no">
          Номер заявки: <b>{leadId != null ? `№ ${leadId}` : "принята"}</b>
        </p>
        {/* C6+C7 (task 9-fix2): динамическое обещание, с заглавной. */}
        <p className="hb-success__script">{promiseLine}</p>

        {/* Wave-4 (product-critic MINOR): часы работы рядом с обещанием перезвона —
            юзер знает, КОГДА ждать звонка (C6-канон, один источник OFFICE_HOURS). */}
        <p className="hb-success__hours">Часы работы: {OFFICE_HOURS.weekdays} · {OFFICE_HOURS.saturday}</p>

        <div className="hb-success__meta">
          {menuType.label} · {guests} {guestsLabel(guests)}
          {dateHuman ? ` · ${dateHuman}` : ""} · ~{formatRUB(total)}
        </div>

        <button type="button" onClick={onReset} className="hb-btn hb-btn--ghost min-h-[44px]">
          Отправить ещё одну заявку
        </button>
      </div>
    </div>
  );
}

/* ==================================================== МОБИЛЬНЫЙ STICKY-BAR */

/**
 * Sticky bottom-bar (mobile <768): живой итог + CTA. Показ/скрытие —
 * плавные (transform+opacity, D3 task 7-fix1): бар живёт в DOM, состояние —
 * data-visible + inert (скрытый бар не фокусируется и не кликается).
 * Лифт над куки-баннером — через CSS-var --hbooking-cookie-h,
 * которую этот компонент меряет MutationObserver-ом (баннер unmount-ится).
 * BackToTop (bottom-6 left-6) лифтится правилом :has(.hb-bar[data-visible="true"])
 * из hacc-booking.css.
 */
function StickyBar({
  total,
  guests,
  visible,
  onCta,
}: {
  total: number;
  guests: number;
  visible: boolean;
  onCta: () => void;
}) {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let seenBanner = false;
    let mo: MutationObserver | null = null;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };
    const measure = () => {
      const banner = document.querySelector('[data-component="ea-cookie-banner"]');
      const h = banner ? banner.getBoundingClientRect().height : 0;
      if (banner) seenBanner = true;
      root.style.setProperty("--hbooking-cookie-h", `${Math.round(h)}px`);
      /* M1 (task 11-fix3): баннер исчез (accept/unmount) — лифт больше не
         нужен, снимаем слушатели (паттерн §33: MutationObserver живёт ровно
         столько, сколько нужен; застывшие lift-переменные = живой баг C61). */
      if (!banner && seenBanner && mo) {
        mo.disconnect();
        mo = null;
        window.removeEventListener("resize", schedule);
      }
    };
    measure();
    mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      mo?.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      root.style.setProperty("--hbooking-cookie-h", "0px");
    };
  }, []);

  return (
    <div
      className="hb-bar md:hidden"
      role="region"
      aria-label="Быстрая заявка"
      data-visible={visible}
      inert={!visible}
    >
      <p className="hb-bar__total">
        <span className="hb-bar__total-label">Итого</span>
        <b>~{formatRUB(total)}</b>
        <span className="hb-bar__guests">
          {guests} {guestsLabel(guests)}
        </span>
      </p>
      <button type="button" onClick={onCta} className="hb-bar__cta">
        Оставить заявку
      </button>
    </div>
  );
}

/* ================================================= ТИПЫ + СТРОКИ ЧЕКА (memo) */

/**
 * Сетка типов события — React.memo (task 7-fix1 D5): не зависит от
 * guests/date, перерисовывается ТОЛЬКО при смене типа (props: typeId +
 * stable onSelect). Разметка/aria/layoutId — прежние (SPEC §2.11, §3.1).
 */
const TypeGrid = memo(function TypeGrid({
  typeId,
  onSelect,
  settled,
}: {
  typeId: string;
  onSelect: (id: string) => void;
  settled: boolean;
}) {
  return (
    <div className="hb-types" role="group">
      {MENU_TYPES.map((m) => {
        const selected = m.id === typeId;
        return (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            aria-pressed={selected}
            whileTap={settled ? { scale: 0.985 } : undefined}
            className={`hb-type ${selected ? "hb-type--on" : ""}`}
          >
            <span className="hb-type__main">
              <span className="hb-type__label">{m.label}</span>
              <span className="hb-type__short">{m.short}</span>
            </span>
            <span className="hb-type__price">
              от {formatRUB(m.perGuest)}
              {m.priceUnit ?? "/чел"}
            </span>
            {selected && (
              <motion.span
                layoutId="hb-type-underline"
                className="hb-type__underline"
                initial={false}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
});

/**
 * X2 (task 13-fix4): строка чека с эффектом ТЕРМОПЕЧАТИ.
 *
 * Печатается слева-направо: clip-path inset(0% 100% 0% 0%) → inset(0% 0% 0% 0%),
 * 260мс, стаггер 55мс по индексу строки. Запускается на:
 *  (а) первом появлении чека во вьюпорте (active: settled && панель вошла —
 *      onViewportEnter панели);
 *  (б) смене значения строки — remount по key = `sig|printing` (значение строки
 *      входит в key; AnimatePresence не нужен — старая строка мгновенно
 *      уступает новой, новая печатается).
 *
 * Границы:
 *  - только clip-path (никаких layout-анимаций, layout не трогаем);
 *  - SSR/no-JS: initial={false} → строка видима сразу (§34 mounted-гейт);
 *  - reduced-motion: settled=false → печать никогда не включается;
 *  - ИТОГО печатается НЕ здесь (свой useSpring, MotionTotal).
 */
function PrintLine({
  as = "div",
  sig,
  index,
  active,
  settled,
  delayBase = 0,
  className,
  children,
}: {
  as?: "div" | "p";
  /** Сигнатура значения строки — её смена перезапускает печать. */
  sig: string;
  /** Индекс для стаггера 55мс. */
  index: number;
  /** Панель чека уже вошла во вьюпорт (и settled). */
  active: boolean;
  settled: boolean;
  /** База задержки (первый залп после входа — ждёт раскрутку бумаги). */
  delayBase?: number;
  className?: string;
  children: ReactNode;
}) {
  const printing = active && settled;
  const Comp = as === "p" ? motion.p : motion.div;
  return (
    <Comp
      key={`print|${sig}|${printing}`}
      className={className}
      initial={printing ? { clipPath: "inset(0% 100% 0% 0%)" } : false}
      animate={printing ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: 0.26, ease: EASE, delay: delayBase + index * 0.055 }}
    >
      {children}
    </Comp>
  );
}

/**
 * Itemized-строки чека — React.memo (task 7-fix1 D5): перерисовываются
 * только при смене типа/гостей/сезона (все производные typeId+guests+date).
 *
 * X2 (task 13-fix4): itemized-строки/«включено»/дата печатаются термопечатью
 * (PrintLine); строка сезона сохраняет СВОЙ вход/выход по высоте (AnimatePresence,
 * схлопывание подвала) — поверх добавлен clip-принт. Первый залп — с базой 0.2s,
 * чтобы печать началась по уже раскрывшейся бумаге (HB_PAPER_VARIANTS 0.1+0.7s).
 */
const ReceiptLines = memo(function ReceiptLines({
  type,
  guests,
  perGuest,
  subtotal,
  season,
  settled,
  active,
}: {
  type: MenuType;
  guests: number;
  perGuest: number;
  subtotal: number;
  season: number;
  settled: boolean;
  /** Чек вошёл во вьюпорт (печать активна). */
  active: boolean;
}) {
  const [entranceDone, setEntranceDone] = useState(false);
  useEffect(() => {
    if (!active || entranceDone) return;
    const t = window.setTimeout(() => setEntranceDone(true), 1100);
    return () => window.clearTimeout(t);
  }, [active, entranceDone]);
  const delayBase = entranceDone ? 0 : 0.2;

  return (
    <>
      {/* Строка типа: смена типа = мгновенная замена + печать новой (X2).
          Бывший x-shift-морф (P3) заменён печатью — он и читался критиком
          как «fade-перерисовка». */}
      <PrintLine
        sig={type.id}
        index={0}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line"
      >
        <span className="hb-line__label">{type.label}</span>
        <span className="hb-line__value">{type.short}</span>
      </PrintLine>

      {/* Строка гостей × цена → подытог: печатается на каждом изменении
          гостей/цены/суммы (сигнатура = отображаемые строки). */}
      <PrintLine
        sig={`${guests}·${formatRUB(perGuest)}·${formatRUB(subtotal)}`}
        index={1}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line"
      >
        <span className="hb-line__label">
          {guests} {guestsLabel(guests)} × {formatRUB(perGuest)}
        </span>
        <span className="hb-line__value">{formatRUB(subtotal)}</span>
      </PrintLine>

      {/* ЧЕСТНАЯ строка сезона — только когда множитель > 1.
          C1 (task 9-fix2): формулировка — единый канон SEASON_LABEL.
          X2: вход = свой height-раскров + clip-принт; выход — прежний. */}
      <AnimatePresence initial={false}>
        {season > 1 && (
          <motion.div
            key="season"
            className="hb-line hb-line--season"
            initial={
              settled
                ? { opacity: 0, height: 0, clipPath: "inset(0% 100% 0% 0%)" }
                : { opacity: 0, height: 0 }
            }
            animate={
              settled
                ? { opacity: 1, height: "auto", clipPath: "inset(0% 0% 0% 0%)" }
                : { opacity: 1, height: "auto" }
            }
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span className="hb-line__label">{SEASON_LABEL}</span>
            <span className="hb-line__value">×1,15</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C4 (task 9-fix2): ПОЛНЫЙ список «Включено» — без slice(0,3),
          «Доставка в пределах КАД» больше не теряется; высота естественная. */}
      <PrintLine
        sig={type.included.join("·")}
        index={3}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line hb-line--included"
      >
        <span>Включено: {type.included.join(" · ")}</span>
      </PrintLine>
    </>
  );
});

/* ============================================================ ГЛАВНЫЙ БЛОК */

type Stage = "calc" | "form" | "success";

export function HaccBooking() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  /** mounted-гейт (C62): SSR/первый клиентский рендер = статика. */
  const settled = mounted && !reduce;
  /** Статус офиса для динамического обещания перезвона (C6, task 9-fix2).
   *  Бейдж в контактах держит СВОЙ экземпляр хука — канон бейджа не тронут. */
  const office = useOfficeStatus();

  /* --- КОНТРАКТ 1: nuqs type/guests — те же парсеры, что в calculator.tsx,
         поэтому presetCalculator (history.replaceState) из hacc-menu
         подхватывается без изменений (Контракт 2). --- */
  const [typeId, setTypeId] = useQueryState("type", parseAsString.withDefault("buffet"));
  const [guests, setGuests] = useQueryState("guests", parseAsInteger.withDefault(50));
  const [date, setDate] = useState("");
  const [stage, setStage] = useState<Stage>("calc");
  const [leadId, setLeadId] = useState<string | number | undefined>(undefined);
  /** X2 (task 13-fix4): чек вошёл во вьюпорт — с этого момента строки
   *  «печатаются» (PrintLine); до того — статика (SSR/no-JS/reduce §34). */
  const [paperInView, setPaperInView] = useState(false);
  const [near, setNear] = useState(false);
  const [zonesUnder, setZonesUnder] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  /* D3 (task 7-fix1): зоны, в нижней полосе вьюпорта (~140px) которых
     sticky-bar скрывается: селектор типов, CTA чека, зона контактов. */
  const typesZoneRef = useRef<HTMLFieldSetElement>(null);
  const ctaZoneRef = useRef<HTMLDivElement>(null);
  const contactsZoneRef = useRef<HTMLDivElement>(null);

  const current = MENU_TYPES.find((m) => m.id === typeId) ?? MENU_TYPES[0];
  /* Q1 (task 9-fix2): кламп ДВУСТОРОННИЙ — URL ?guests=600 больше не даёт
     aria-valuenow=600 > aria-valuemax=500 и чек «на 600 гостей». */
  const guestsClamped = Math.min(GUESTS_MAX, Math.max(guests, current.minGuests));

  const minToday = useMemo(() => todayIso(), []);

  /* Q2 (task 9-fix2): прошедшая дата, введённая вручную, больше не «молчит» —
     под полем появляется подсказка, а из расчёта дата исключается
     (seasonMultiplier прошлой даты не должен менять итог). */
  const dateInvalid = Boolean(date) && date < minToday;
  const dateValid = dateInvalid ? "" : date;
  const humanDate = useMemo(() => formatHumanDate(dateValid), [dateValid]);

  /* КОНТРАКТ 3: addons = [] — секцию «Дополнительно» юзер просил убрать. */
  const result = useMemo(
    () => calcTotal(typeId, guests, [], dateValid),
    [typeId, guests, dateValid],
  );

  /* Кламп гостей к диапазону формата (Cycle 38 + Q1 task 9-fix2: и сверху).
     setGuests пишет в nuqs → URL нормализуется автоматически. */
  useEffect(() => {
    if (guests > GUESTS_MAX) setGuests(GUESTS_MAX);
    else if (guests < current.minGuests) setGuests(current.minGuests);
  }, [current.minGuests, guests, setGuests]);

  /* C6 (task 9-fix2): динамическое обещание перезвона — согласовано с бейджем
     (офис ЗАКРЫТ → без «за 15 минут»). mounted-гейт: SSR/первый рендер =
     канон, свап на «закрытую» версию — только после монта. */
  const officeClosed = mounted && !office.open;
  const ctaPromise = officeClosed
    ? "Оставьте заявку — перезвоним в ближайшее рабочее время"
    : "Перезвоним за 15 минут в рабочее время";
  const toastPromise = officeClosed
    ? "Перезвоним в ближайшее рабочее время"
    : "Перезвоним за 15 минут в рабочее время";
  const scriptPromise = officeClosed
    ? "Мы перезвоним в ближайшее рабочее время"
    : "Мы перезвоним за 15 минут в рабочее время";

  /* КОНТРАКТ 7 (слушатель): catering:menu-select. menu.tsx шлёт detail=string
     (typeId); спящие компоненты могут прислать {typeId, guests} — понимаем оба. */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = typeof detail === "string" ? detail : detail?.typeId;
      const g = typeof detail === "object" && detail ? detail.guests : undefined;
      if (typeof id === "string" && MENU_TYPES.some((m) => m.id === id)) setTypeId(id);
      if (typeof g === "number" && Number.isFinite(g) && g >= 1) {
        // Q1 (task 9-fix2): кламп сверху и на входе извне.
        setGuests(Math.min(GUESTS_MAX, g));
      }
    };
    window.addEventListener("catering:menu-select", handler);
    return () => window.removeEventListener("catering:menu-select", handler);
  }, [setTypeId, setGuests]);

  /* Sticky-bar виден только у секции (один IO, без scroll-listener'ов). */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setNear(e.isIntersecting);
      },
      { rootMargin: "140px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* D3 (task 7-fix1): ОДИН IO на три зоны (типы / CTA чека / контакты),
     rootMargin съедает низ вьюпорта на высоту бара с запасом (~140px).
     §32 (урок C60): entries приходят только по ИЗМЕНИВШИМСЯ таргетам —
     держим per-target state в Map и агрегируем по всем. threshold 0.05 —
     гистерезис: зона должна сдвинуться на ≥5% своей высоты, чтобы
     состояние перещёлкнулось (без мигания на границе). */
  useEffect(() => {
    const els = [typesZoneRef.current, ctaZoneRef.current, contactsZoneRef.current].filter(
      (el): el is NonNullable<(typeof els)[number]> => !!el,
    );
    if (!els.length) return;
    const state = new Map<HTMLElement, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) state.set(e.target as HTMLElement, e.isIntersecting);
        setZonesUnder([...state.values()].some(Boolean));
      },
      { rootMargin: "0px 0px -140px 0px", threshold: 0.05 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Плавный скролл к зоне формы через window.__lenis (грабля §2/§33:
      bare smooth-scroll Lenis перебивает; if/else — не ?? с side-effect). */
  const scrollToZone = useCallback(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo?: (t: Element, o?: object) => void } }).__lenis;
    if (typeof lenis?.scrollTo === "function") {
      lenis.scrollTo(el, { offset: -16 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* КОНТРАКТ 8: на #contact смотрят шапка/футер/privacy/offer — открываем
     форму при любом хэше (зона всегда в DOM, поэтому якорь валиден).
     D2 (task 7-fix1): нативный прыжок ненадёжен дважды — Chrome сажает
     якорь на 0-height зону ДО раскрытия, а Lenis может «дотянуть» мимо
     (§33). Поэтому: CSS scroll-margin-top: 96px на оба якоря (правит
     нативный прыжок) + ДВУХТАКТНЫЙ пере-якорь после раскрытия формы:
     ~560ms (после grid-транзишна 0.5s) и ~1100ms (после lenis-сеттла),
     оба через window.__lenis. Оба такта идемотентентны. */
  useEffect(() => {
    const timers: number[] = [];
    const openFromHash = () => {
      if (window.location.hash !== "#contact") return;
      setStage((s) => {
        if (s !== "calc") return s;
        return "form";
      });
      timers.push(window.setTimeout(scrollToZone, 560));
      timers.push(window.setTimeout(scrollToZone, 1100));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [scrollToZone]);

  /** Хендофф: чек сжимается, форма раскрывается, фокус — в первое поле. */
  const openForm = useCallback(
    (andScroll: boolean) => {
      setStage((s) => {
        if (s !== "calc") return s;
        return "form";
      });
      if (andScroll) scrollToZone();
      const delay = settled ? 480 : 0;
      window.setTimeout(() => {
        document.getElementById("hb-name")?.focus({ preventScroll: true });
      }, delay);
    },
    [scrollToZone, settled],
  );

  /** КОНТРАКТ 7 (диспетчер): catering:calc-lead при УСПЕШНОМ сабмите. */
  const handleSuccess = useCallback(
    (id: string | number | undefined) => {
      setLeadId(id);
      setStage("success");
      window.dispatchEvent(
        new CustomEvent("catering:calc-lead", {
          detail: {
            typeId,
            guests: guestsClamped,
            date: dateValid,
            total: result.total,
            addons: [] as string[],
          },
        }),
      );
    },
    [typeId, guestsClamped, dateValid, result.total],
  );

  const resetToCalc = useCallback(() => setStage("calc"), []);

  /** D5 (task 7-fix1): stable-колбек для memo-сетке типов (TypeGrid). */
  const handleTypeSelect = useCallback((id: string) => setTypeId(id), [setTypeId]);

  /* aria-live итога — троттлинг 700 мс (SPEC §2.11), обновляется только
     «на восстановление» после остановки изменений, не на каждый кадр. */
  const [srTotal, setSrTotal] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSrTotal(
        `Итого примерно ${formatRUB(result.total)} за ${guestsClamped} ${guestsLabel(guestsClamped)}`,
      );
    }, 700);
    return () => clearTimeout(t);
  }, [result.total, guestsClamped]);

  /* D3 (task 7-fix1): бар показан ТОЛЬКО между блоками — у секции,
     при закрытой форме и когда нижняя полоса вьюпорта свободна от зон
     типов/CTA/контактов. Сам бар живёт в DOM (плавный transform+opacity). */
  const barVisible = mounted && near && stage === "calc" && !zonesUnder;

  return (
    <section
      ref={sectionRef}
      id="calculator"
      data-header-theme="light"
      aria-labelledby="hbooking-heading"
      data-stage={stage}
      className="hbooking ea-section ea-section--cream section-light relative"
    >
      <div className="ea-container ea-container--wide">
        {/* ── Шапка секции — канон соседних блоков (hacc-menu/cep-process):
               TiltedAccent (Marck Script −6°) + ea-eyebrow + ea-section-h2 ── */}
        <div className="hb-head">
          <TiltedAccent text="смета-чек" size="clamp(1.1rem, 1.8vw, 1.55rem)" />
          <span className="ea-eyebrow">Расчёт и заявка</span>
          <h2 id="hbooking-heading" className="ea-section-h2">
            {"Соберите банкет. "}
            <i className="ea-italic-fragment">Чек напечатается сразу.</i>
          </h2>
          <p className="hb-lede">
            Выберите формат и гостей — справа печатается предварительная смета.
            Оставьте заявку, и мы перезвоним за 15 минут в рабочее время.
          </p>
        </div>

        {/* ── Сцена: контролы 7 / красная панель 5 ── */}
        <div className="hb-grid">
          {/* ═══ ЛЕВО: собери банкет ═══ */}
          <div className="hb-left">
            {/* 1 · Тип события — типографические кнопки.
                D3: fieldset — наблюдаемая зона нижней полосы (data-hb-hide).
                D5: сетка — memo-компонент TypeGrid. */}
            <fieldset className="hb-block" ref={typesZoneRef} data-hb-hide="types">
              <legend className="hb-label-caps">Тип события</legend>
              <TypeGrid typeId={current.id} onSelect={handleTypeSelect} settled={settled} />
            </fieldset>

            {/* 2 · Гости — odometer + слайдер */}
            <div className="hb-block">
              <span className="hb-label-caps">Гости</span>
              <div className="hb-guests">
                <OdometerGuests value={guestsClamped} animate={settled} />
                <span className="hb-guests__word" aria-hidden="true">
                  {guestsLabel(guestsClamped)}
                </span>
              </div>

              <div className="hb-slider">
                {/* Заливка трека + тики. X3 (task 13-fix4): тики — НАСТОЯЩИЕ
                    пресет-кнопки (раньше span в aria-hidden-рейле — клик не
                    работал): aria-label «Установить N гостей», кламп при клике,
                    Enter/Tab нативно. aria-hidden перенесён на декоративную
                    заливку (фокусабельные кнопки внутри aria-hidden = нарушение). */}
                <div className="hb-slider__rail">
                  <motion.span
                    className="hb-slider__fill"
                    aria-hidden="true"
                    initial={false}
                    animate={{
                      width: `${((guestsClamped - current.minGuests) / (GUESTS_MAX - current.minGuests)) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  {[current.minGuests, ...SLIDER_TICKS.filter((t) => t > current.minGuests)].map(
                    (tick) => (
                      <button
                        key={tick}
                        type="button"
                        className={`hb-slider__tick ${guestsClamped >= tick ? "hb-slider__tick--on" : ""}`}
                        style={{
                          left: `${((tick - current.minGuests) / (GUESTS_MAX - current.minGuests)) * 100}%`,
                        }}
                        onClick={() =>
                          setGuests(Math.min(GUESTS_MAX, Math.max(current.minGuests, tick)))
                        }
                        aria-label={`Установить ${tick} ${guestsLabel(tick)}`}
                      >
                        {tick}
                      </button>
                    ),
                  )}
                </div>
                <input
                  type="range"
                  min={current.minGuests}
                  max={GUESTS_MAX}
                  step={5}
                  value={guestsClamped}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  aria-valuenow={guestsClamped}
                  aria-valuemin={current.minGuests}
                  aria-valuemax={GUESTS_MAX}
                  aria-valuetext={`${guestsClamped} ${guestsLabel(guestsClamped)}`}
                  aria-label="Количество гостей"
                  className="hb-slider__input"
                />
                <div className="hb-slider__adjust">
                  {/* M2 (task 11-fix3): живая мини-сумма рядом со слайдером —
                      меняется мгновенно той же useMemo-цифрой (result.total),
                      без спринга; БЕЗ aria-live (итог чека уже анонсируется
                      с троттлингом 700 мс — дубль спамил бы SR). */}
                  <span className="hb-slider__total">≈ {formatRUB(result.total)}</span>
                  <span className="hb-slider__btns">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(current.minGuests, g - 5))}
                      className="hb-step-btn"
                      aria-label="Меньше на пять гостей"
                    >
                      <Minus className="size-4" aria-hidden="true" /> −5
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(GUESTS_MAX, g + 5))}
                      className="hb-step-btn"
                      aria-label="Больше на пять гостей"
                    >
                      +5 <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              </div>

              {/* C3 (task 9-fix2): ПОСТОЯННАЯ плашка у минимума — раньше сообщение
                  жило <120 мс (кламп-эффект гасил условие в том же кадре). Теперь
                  живёт, ПОКА гость стоит на минимуме формата; спокойный тон. */}
              {guestsClamped === current.minGuests && (
                <p className="hb-minnote" role="status">
                  Минимум для «{current.label}» — {current.minGuests} {guestsLabel(current.minGuests)}:{" "}
                  посчитаем от него
                </p>
              )}
            </div>

            {/* 3 · Дата — необязательно */}
            <div className="hb-block" role="group" aria-label="Дата мероприятия (необязательно)">
              <label htmlFor="hb-date" className="hb-label-caps">
                Дата события <span className="hb-label-caps__opt">— необязательно, уточним по звонку</span>
              </label>
              <div className="hb-date">
                <CalendarDays className="hb-date__icon size-4" aria-hidden="true" />
                <input
                  id="hb-date"
                  type="date"
                  min={minToday}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="hb-date__input"
                  aria-invalid={dateInvalid ? "true" : undefined}
                  aria-describedby={dateInvalid ? "hb-date-err" : undefined}
                />
              </div>
              {/* Q2 (task 9-fix2): прошедшая дата — инлайн-подсказка (polite). */}
              {dateInvalid && (
                <p id="hb-date-err" className="hb-err" aria-live="polite">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  Дата уже прошла — выберите будущую
                </p>
              )}
              {date && result.season > 1 && (
                <p className="hb-minwarn mt-2">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {SEASON_CANON}
                </p>
              )}
            </div>

            {/* ═══ ЗОНА ФОРМЫ — КОНТРАКТ 8: id="contact". Живёт в DOM всегда
                   (якоря шапки/футера/privacy/offer валидны); раскрытие —
                   grid-rows 0fr→1fr; closed → inert (фокус не проваливается). */}
            <div id="contact" className="hb-zone" data-open={stage !== "calc"}>
              <div className="hb-zone__inner">
                <div className="hb-zone__body" inert={stage === "calc"}>
                  {stage === "success" ? (
                    <SuccessPanel
                      leadId={leadId}
                      menuType={current}
                      guests={guestsClamped}
                      total={result.total}
                      dateHuman={humanDate}
                      promiseLine={scriptPromise}
                      onReset={resetToCalc}
                      settled={settled}
                    />
                  ) : (
                    <LeadForm
                      typeId={current.id}
                      guests={guestsClamped}
                      dateHuman={humanDate}
                      total={result.total}
                      toastPromise={toastPromise}
                      onSuccess={handleSuccess}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ПРАВО: красная панель со сметой-чеком ═══ */}
          <div className="hb-right">
            {/* D1 (task 7-fix1): наблюдатель — только на панели (variants с
                лейблами); бумага наследует лейбл, собственного IO у неё нет.
                viewport amount 0.01 + margin "0px 0px -10% 0px" — вход
                срабатывает рано и на высокой панели тоже. */}
            <motion.div
              key={settled ? "panel-a" : "panel-s"}
              className="hb-panel lg:sticky lg:top-24"
              initial={settled ? "hb-hidden" : false}
              whileInView={settled ? "hb-show" : undefined}
              onViewportEnter={() => setPaperInView(true)}
              viewport={{ once: true, amount: 0.01, margin: "0px 0px -10% 0px" }}
              variants={HB_PANEL_VARIANTS}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="hb-panel__caps">
                {/* X1 (task 13-fix4): после успеха шапка панели гасится —
                    «ЗАЯВКА ПРИНЯТА · № id». Штамп остаётся ОДИН — на квитанции
                    (урок волны-1 D2: не дублировать печать). */}
                {stage === "success" ? (
                  leadId != null ? `Заявка принята · № ${leadId}` : "Заявка принята"
                ) : (
                  <>
                    Предварительная смета
                    <span aria-hidden="true"> · Interfood</span>
                  </>
                )}
              </p>

              {/* Чек: вход-«раскатка» наследуется от панели (D1 fix1).
                  D2 (task 9-fix2): штампа на чеке БОЛЬШЕ НЕТ (он един — на
                  квитанции успеха), поэтому и «удар штампа»-шейк снят —
                  бумагу трясло под печать, которой здесь больше нет. */}
              <motion.div className="hb-paper" variants={HB_PAPER_VARIANTS} data-stage={stage}>
                {/* Шапка чека */}
                <div className="hb-paper__head">
                  <span className="hb-paper__brand">Смета-чек</span>
                  <span className="hb-paper__type">
                    {current.label} · {guestsClamped} {guestsLabel(guestsClamped)}
                  </span>
                </div>

                <span className="hb-perfo" aria-hidden="true" />

                {/* Itemized-строки — схлопываются в компакт (grid-rows).
                    D5: содержимое — memo-компонент ReceiptLines. */}
                <div className="hb-lines" aria-hidden={stage !== "calc"}>
                  <div className="hb-lines__clip">
                    <ReceiptLines
                      type={current}
                      guests={guestsClamped}
                      perGuest={result.perGuest}
                      subtotal={result.subtotal}
                      season={result.season}
                      settled={settled}
                      active={paperInView}
                    />
                  </div>
                </div>

                <span className="hb-perfo" aria-hidden="true" />

                {/* Итог — всегда видим (и в компакте) */}
                <div className="hb-total">
                  <span className="hb-total__label">Итого</span>
                  <span className="hb-total__value">
                    <MotionTotal value={result.total} className="hb-total__num" />
                    <TotalDelta total={result.total} animate={settled} />
                  </span>
                </div>
                <p className="hb-total__per">
                  {/* C7 (task 9-fix2): без сезона — точная базовая цена из данных;
                      с сезоном — «≈» + честный множитель. «₽/чел» без пробелов. */}
                  {result.season > 1
                    ? `≈${formatRUB(Math.round(result.perGuest * result.season))}/чел · высокий сезон ×1,15 · ${guestsClamped} ${guestsLabel(guestsClamped)}`
                    : `${formatRUB(result.perGuest)}/чел · ${guestsClamped} ${guestsLabel(guestsClamped)}`}
                </p>

                {/* Подвал чека — честность минимума + сезон + дата (схлопывается) */}
                <div className="hb-lines" aria-hidden={stage !== "calc"}>
                  <div className="hb-lines__clip">
                    <span className="hb-perfo" aria-hidden="true" />
                    <p className="hb-note">
                      Меньше {current.minGuests} {guestsLabel(current.minGuests)}? Посчитаем
                      индивидуально — позвоните или оставьте заявку.
                    </p>
                    {/* C1 (task 9-fix2): ПОСТОЯННАЯ сноска сезона — видна ДО ввода
                        необязательной даты (ожидания больше не занижаются на −15%).
                        Когда сезон уже в расчёте строкой выше — не дублируем. */}
                    {result.season <= 1 && (
                      <p className="hb-note hb-note--season">
                        {SEASON_CANON}
                        {!date ? ". Выберите дату, чтобы увидеть её в расчёте." : ""}
                      </p>
                    )}
                    {/* C2 (task 9-fix2): дата — по-человечески; прошедшая (невалидная)
                        в чек не попадает — она объясняется подсказкой у поля. */}
                    {/* X2 (task 13-fix4): дата события печатается термопечатью
                        при появлении и каждой смене значения. */}
                    {dateValid && (
                      <PrintLine
                        as="p"
                        sig={humanDate}
                        index={0}
                        active={paperInView}
                        settled={settled}
                        className="hb-note"
                      >
                        Дата события: {humanDate}
                      </PrintLine>
                    )}
                  </div>
                </div>

                {/* Отрывной хвост — падает один раз при успехе */}
                <AnimatePresence>
                  {stage === "success" && settled && (
                    <motion.span
                      key="tearoff"
                      className="hb-tearoff"
                      initial={{ y: 0, rotate: 0, opacity: 1 }}
                      animate={{ y: 110, rotate: 6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeIn" }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* CTA-зона панели. D3: зона — наблюдаемая нижней полосы
                  (data-hb-hide). X1 (task 13-fix4): в success панель ГАСНЕТ —
                  красная CTA размонтируется (ноль красных кнопок после успеха,
                  «Отправить заявку» больше не зовёт к дублю), вместо неё —
                  приглушённая строка-ссылка reset. В form зона схлопывается
                  (aria-hidden + inert — фокус не проваливается). */}
              <div
                className="hb-cta-zone"
                aria-hidden={stage === "form"}
                inert={stage === "form"}
                ref={ctaZoneRef}
                data-hb-hide="cta"
              >
                <div className="hb-cta-zone__clip">
                  {stage === "success" ? (
                    <p className="hb-again-row">
                      <button type="button" onClick={resetToCalc} className="hb-panel__again">
                        Отправить ещё одну заявку
                      </button>
                    </p>
                  ) : (
                    <>
                      <Magnetic strength={0.25} className="mt-5 block">
                        <button
                          type="button"
                          onClick={() => openForm(false)}
                          data-cursor="inquiry"
                          className="hb-btn hb-btn--paper min-h-[52px] w-full justify-center"
                        >
                          Оставить заявку
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                      </Magnetic>
                      <p className="hb-cta-note">{ctaPromise}</p>
                    </>
                  )}
                </div>
              </div>

              {stage !== "calc" && (
                <p className="hb-panel__next" role="status">
                  {stage === "form" ? (
                    <>
                      {/* D4 (task 7-fix1): на мобиле форма открывается ВЫШЕ
                          чека, не слева — адаптивный копирайт через CSS. */}
                      <span className="md:hidden">Форма выше — расчёт уже внутри</span>
                      <span className="hidden md:inline">Форма открыта слева — расчёт уже внутри</span>
                    </>
                  ) : (
                    <>
                      <span className="md:hidden">Заявка принята — квитанция выше</span>
                      <span className="hidden md:inline">Заявка принята — квитанция слева</span>
                    </>
                  )}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Контакты-зона (низ секции). D3: корень — наблюдаемая зона. ── */}
        <ContactsZone hideRef={contactsZoneRef} />
      </div>

      {/* sr-only live-регион итога (троттлинг) — КОНТРАКТ 11 */}
      <div className="sr-only" aria-live="polite">
        {srTotal}
      </div>

      {/* Mobile sticky-bar: D3 (task 7-fix1) — бар живёт в DOM (после
          маунта), показ/скрытие — data-visible (плавный transform+opacity),
          скрыт при открытой форме/успехе/вне секции/над зонами интерактива. */}
      {mounted && (
        <StickyBar
          total={result.total}
          guests={guestsClamped}
          visible={barVisible}
          onCta={() => openForm(true)}
        />
      )}
    </section>
  );
}

export default HaccBooking;
