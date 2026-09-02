"use client";

/**
 * HaccBooking — Cycle 64 «СМЕТА-ЧЕК NILOV CATERING» (ребрендинг task 7-E:
 * Interfood → Nilov Catering во всех видимых текстах блока).
 * Объединённый блок: калькулятор → живой бумажный смета-чек на красной
 * панели → инлайн-форма заявки → успех (штамп + tear-off + конфетти).
 * Контакты-зона с бейджем «Отвечаем в любое время» (task 7-E: live-статус
 * Открыто/Закрыто и график офиса удалены) и ленивой Яндекс-картой — низ секции.
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
 *  - Math.random — только в useMemo (конфетти; Fix5: № заявки приходит
 *    из API, локального генератора больше нет);
 *  - карта — IntersectionObserver-гейт (rootMargin 400px) + loading="lazy";
 *  - бесконечные анимации: Fix5 V11 добавил ТРИ микро-CSS-анимации
 *    (печать-кольцо, 2 блика); task 7-E — ОДИН framer-motion-пульс точки
 *    бейджа «Отвечаем в любое время» (scale+opacity, 2.4s) — все transform-only,
 *    ≤2% элементов, гасятся prefers-reduced-motion (отступление от SPEC §4.5
 *    сознательное, по прямому запросу владельца «мало анимации»);
 *  - scroll-listener'ов нет вообще (IO + MutationObserver + rAF-коалесинг).
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
 *  - C6: обещание перезвона без часов — «Перезвоним сразу, как увидим заявку»
 *    (task 7-E: live-статус офиса удалён, отвечаем в любое время);
 *  - C7: «Мы перезвоним…», «{N} ₽/чел» / «≈… · высокий сезон ×1,15».
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
 *    бейдж: задача 7-E сняла live-статус — точка золотая, пульс 2.4s.
 *  NOTE: блокер мобильного критика «форма не принимает ввод» ОПРОВЕРГНУТ
 *  измерением (probe/input-check: fill+pressSequentially работают на 1440 и
 *  390) — логика инпутов в этом таске НЕ трогалась.
 *
 * Fix5 (cycle 65, прямые правки владельца — 15 пунктов):
 *  - V1 СЛАЙДЕР ШАГ 1: range больше не «шаг 5» — позиция 0..1000 мапится в
 *    гостей НЕЛИНЕЙНО (SLIDER_POS_ANCHORS): 10–50 гостей занимают 62% трека
 *    (владелец: «чаще всего заказывают на 10–50, больше 50 — намного реже»),
 *    50–100 → 18%, 100–200 → 10%, 200–500 → 10%. Стрелки клавиатуры = ±1.
 *  - V2 ВВОД ЧИСЛА: в строке ±-кнопок — редактируемое поле количества
 *    (inputMode numeric, коммит по Enter/blur, кламп в [min, 500]);
 *    ±5 заменены на ±1 (V1).
 *  - V3 ДЕФОЛТЫ: type=banquet, guests=30 (владелец: «изначально 30 и банкет»).
 *  - V4 ПЕРФ СЛАЙДЕРА (тормозил на мобиле): nuqs-URL больше НЕ пишется на
 *    каждый кадр драга — локальное зеркало guestsLocal + debounced-коммит в
 *    URL 500мс; заливка трека — transform: scaleX (compositor) вместо width
 *    (layout); itemized-строки чека перепечатываются от ДЕБАУНС-значения
 *    гостей (160мс) — во время драга PrintLine не ремоунтится кадрами.
 *  - V5 ЦИФРЫ НЕ СЛИПАЮТСЯ: колонки одометра width: 1ch → 0.66em + gap
 *    (в Prata нет tnum — «1» уже «0», глифы обрезались/слипались в 1ch).
 *  - V6 «ЕЩЁ РЕШАЮ»: карточка-пункт для тех, кто не выбрал формат — заявка
 *    без цены и формата: чек печатает «обсудим по звонку», итог «после
 *    подбора», в форме появляется необязательный комментарий; POST шлёт
 *    eventType: undefined + пометку «нужна помощь с подбором». Услуги
 *    НЕ перечисляем (владелец: «выбор и так большой»).
 *  - V7 CTA ВЕДЁТ К ФОРМЕ: «Оставить заявку» (панель + sticky-бар) всегда
 *    скроллит к #contact трёхтактно (0/300/700мс — пережимает grid-раскрытие
 *    0.5s) и подсвечивает форму однократной анимацией (hb-zone-flash).
 *  - V8 ШАПКА: дубль «смета-чек»/«Расчёт и заявка» устранён — остаётся
 *    ТОЛЬКО наклонный TiltedAccent; «Чек напечатается сразу.» — с новой
 *    строки (блок-строка в H2); lede без «справа» (на мобиле чек снизу)
 *    + упоминание пути «ещё выбираете».
 *  - V9 ДОВЕРИЕ БЕЗ ВРЕМЕНИ: «16 лет» → «Работаем с 2007 года» (всё, что
 *    стареет, — не пишем).
 *  - V10 АДРЕС/КАРТА: Полевая-Сабировская 45к1 (YANDEX_MAPS, media.ts;
 *    короткая ссылка владельца как внешняя ссылка; iframe-title обновлён).
 *  - V11 WOW/МОБИЛ: вращающаяся круговая печать на панели (hb-spin, CSS
 *    rotate, 18s); блик-свип по бумажной CTA и по заливке слайдера (CSS
 *    keyframes, transform-only); вход блоков — СКРОЛЛ-ДРАЙВ (CSS
 *    animation-timeline: view() — работает и на мобиле, @supports-гейт);
 *    приоткрытие thumb при нажатии; NONE из этого не требует JS.
 *    Отступление от «ноль бесконечных анимаций» (SPEC §4.5) — сознательное,
 *    по прямому запросу владельца («мало анимации»): 3 микроанимации,
 *    transform-only, ≤2% элементов, отключаются reduced-motion.
 *
 * FIX-7 (Cycle 70, миноры волны-2 критика W2-B):
 *  - M1: строка чека «Банкет → Полный банкет с обслуживанием» вылезала за
 *    overflow:hidden-клип на +43px (390×844, value w 254 при строке 276) —
 *    .hb-line__value больше не flex-shrink:0: коробка сжимается до
 *    min-content, длинное название формата ПЕРЕНОСИТСЯ по словам и
 *    выравнивается вправо (числа не страдают — пробелы в formatRUB
 *    неразрывные). Шрифт не тронут.
 *  - M2: датер калькулятора — нативный <input type="date"> заменён на
 *    Popover + shadcn-Calendar (react-day-picker v9, ГОТОВАЯ русская локаль
 *    из пакета «react-day-picker/locale»). Причина: Chromium раскрывает
 *    внутренние сегменты нативного date-инпута в AX-дереве как англ.
 *    задвоенные спин-кнопки «Month Month/Day Day/Year Year» (value 0) —
 *    разметка сайта на них не влияет (probe на чистой странице: lang/label/
 *    aria-label дают тот же дубль). Контракт даты НЕ меняется: value/onChange
 *    — тот же ISO «YYYY-MM-DD», форма шлёт дату как прежде; гидратация
 *    безопасна (контент поповера — только после открытия, триггер одинаков
 *    на SSR/клиенте) — детали в докблоке HbDateField.
 *
 * Контракты SPEC §2 — карта реализации:
 *  1. nuqs type/guests (parseAsString/parseAsInteger; Fix5: defaults
 *     banquet/30, guests — через локальное зеркало + debounced-коммит 500мс,
 *     внешние replaceState из hacc-menu подхватываются эффектом синхронизации);
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
 *  9. toast-канон «Перезвоним сразу, как увидим заявку» (task 7-E: часы
 *     офиса и live-статус удалены — заявки принимаем круглосуточно);
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
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { fireGoldConfetti } from "@/components/motion/gold-confetti";
import { ru as ruDayPickerLocale } from "react-day-picker/locale";

import { Magnetic } from "@/components/motion/magnetic";
import { TiltedAccent } from "@/components/catering/tilted-accent";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

/**
 * Канон сезона — ОДНА формулировка на весь блок (C1, task 9-fix2):
 * строка в чеке, сноска под чеком, подпись у даты. Никаких
 * «сезонный спрос» и «Сезон (май–сентябрь, декабрь)».
 */
const SEASON_LABEL = "Высокий сезон: май–сентябрь и декабрь";
const SEASON_CANON = `${SEASON_LABEL} — ×1,15`;

/** Тики слайдера гостей — вехи; позиции считаются НЕЛИНЕЙНО (sliderPos). */
const SLIDER_TICKS = [25, 50, 100, 200, 500];
const GUESTS_MAX = 500;
/** Нижняя граница для «Ещё решаю» (без формата — считаем от 10). */
const GUESTS_ABS_MIN = 10;

/**
 * Fix5 V1: НЕЛИНЕЙНАЯ шкала слайдера — чаще всего заказывают на 10–50 гостей,
 * поэтому первые 62% трека отдаются диапазону [min…50], дальше редкие зоны:
 * [50…100] → 18%, [100…200] → 10%, [200…500] → 10%. Влево-вправо маппинг
 * взаимно обратный (одно и то же дерево отрезков).
 */
const SLIDER_POS_ANCHORS = [0, 0.62, 0.8, 0.9, 1] as const;

function sliderPos(guests: number, min: number): number {
  const g = Math.min(GUESTS_MAX, Math.max(min, guests));
  const stops = [min, 50, 100, 200, GUESTS_MAX];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (g <= stops[i + 1]) {
      const t = (g - stops[i]) / (stops[i + 1] - stops[i]);
      return SLIDER_POS_ANCHORS[i] + t * (SLIDER_POS_ANCHORS[i + 1] - SLIDER_POS_ANCHORS[i]);
    }
  }
  return 1;
}

function guestsFromPos(p: number, min: number): number {
  const v = Math.min(1, Math.max(0, p));
  const stops = [min, 50, 100, 200, GUESTS_MAX];
  for (let i = 0; i < SLIDER_POS_ANCHORS.length - 1; i += 1) {
    if (v <= SLIDER_POS_ANCHORS[i + 1]) {
      const t =
        (v - SLIDER_POS_ANCHORS[i]) / (SLIDER_POS_ANCHORS[i + 1] - SLIDER_POS_ANCHORS[i]);
      return Math.round(stops[i] + t * (stops[i + 1] - stops[i]));
    }
  }
  return GUESTS_MAX;
}

/** id псевдо-типа «Ещё решаю» — НЕ в MENU_TYPES (без цен, Fix5 V6). */
const UNDECIDED_ID = "undecided";

/** Конфетти — цвета бренда (ea-red/cep-red/cream/ink/gold), без неона. */
const CONFETTI_COLORS = ["#E71D3A", "#FF360A", "#F7F5F5", "#1F2937", "#D4A373"];

/** Fix5 V11: текст круговой печати (шаг угла = 360/длине текста — любой
 *  длины; task 7-E: interfood → nilov catering). */
const HB_SPIN_TEXT = "смета-чек · nilov catering · с 2007 года ·";

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

/** FIX-7: Date → «YYYY-MM-DD» (локальная, как todayIso) — язык обмена
 *  между календарём и state `date` (контракт даты не меняется). */
function toIsoDate(d: Date): string {
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
 * Fix5 V4: дебаунс значения (не setState на кадр). Используется для
 * itemized-строк чека — во время драга слайдера PrintLine НЕ ремоунтится
 * кадрами, перепечатка запускается через 160 мс после остановки значения.
 */
function useDebouncedValue<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

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

/* ============================================== БЕЙДЖ «В ЛЮБОЕ ВРЕМЯ» */

/**
 * Task 7-E: бейдж «Отвечаем в любое время». Live-статус «Открыто/Закрыто»
 * и график офиса удалены по требованию владельца: заявки читаем круглосуточно,
 * обещание перезвона — «сразу, как увидим заявку», без привязки к часам.
 * Точка — золотая (var(--gold)), мягко пульсирует: scale 1↔1.25 + opacity,
 * 2.4s, transform-only, framer-motion. Отступление от «ноль бесконечных
 * анимаций в TSX» (SPEC §4.5) — сознательное, по прямому запросу владельца;
 * prefers-reduced-motion — статичная точка. SSR/первый рендер — статика
 * (§34: анимационные ветки свапаются после монта).
 */
function AnytimeBadge() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const pulse = mounted && !reduce;
  return (
    <span className="hb-badge">
      <motion.span
        className="hb-badge__dot"
        style={{
          background: "var(--gold)",
          boxShadow: "0 0 0 3px color-mix(in srgb, var(--gold) 24%, transparent)",
        }}
        aria-hidden="true"
        animate={pulse ? { scale: [1, 1.25, 1], opacity: [1, 0.75, 1] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span>Отвечаем в любое время</span>
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

/**
 * Task 7-E: типографические глифы MAX / VK — у мессенджеров нет
 * lucide-пиктограмм, поэтому буквы рисуются SVG-текстом в тот же слот,
 * что иконки соседей (размер приходит className-ом size-4/size-5,
 * viewBox масштабирует текст пропорционально). Наследует текущий
 * font-family — тот же типографический тон, что подписи строк.
 */
function MessengerGlyph({
  text,
  fontSize,
  className,
}: {
  text: string;
  fontSize: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" role="presentation">
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="800"
        letterSpacing="0.5"
        fill="currentColor"
      >
        {text}
      </text>
    </svg>
  );
}

function MaxGlyph({ className }: { className?: string }) {
  return <MessengerGlyph text="MAX" fontSize={9.5} className={className} />;
}

function VkGlyph({ className }: { className?: string }) {
  return <MessengerGlyph text="VK" fontSize={11.5} className={className} />;
}

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
        /* Task 7-E: MAX — мессенджер из CONTACTS (агент A, config.ts). */
        sub: "MAX",
        label: CONTACTS.max,
        href: CONTACTS.maxHref,
        icon: MaxGlyph,
        external: true,
      },
      {
        /* Task 7-E: VK — рядом с мессенджерами (был только в футере). */
        sub: "VK",
        label: CONTACTS.vk,
        href: CONTACTS.vkHref,
        icon: VkGlyph,
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
            title="Nilov Catering на карте — Санкт-Петербург, ул. Полевая-Сабировская, 45к1"
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

/** Контакты-зона: бейдж «Отвечаем в любое время» + крупные ссылки (desktop)
 *  / тикер + карточки (mobile) + ленивая карта. Реквизиты/соцсети футера
 *  НЕ дублируются (SPEC §2.10) — только быстрые CTA-контакты, мессенджеры
 *  (WA/TG/MAX/VK, task 7-E) и карта.
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
        <AnytimeBadge />
      </div>

      {/* Task 7-E: график офиса удалён — бейдж «Отвечаем в любое время»
          заменяет live-статус и часы. */}

      {/* C5 (task 9-fix2) + Fix5 V9: строка доверия — только ВНЕВРЕМЕННЫЕ факты
          (владелец: «всё, что со временем устаревает, лучше не писать») —
          «с 2007 года» вместо «16 лет». */}
      <p className="hb-trust">Работаем в Санкт-Петербурге с 2007 года · 2 400+ событий</p>

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
  dateIso,
  total,
  undecided,
  toastPromise,
  onSuccess,
}: {
  typeId: string;
  guests: number;
  /** Валидная дата в человеческом формате («19 сентября 2026 г.») или "" (C2). */
  dateHuman: string;
  /** ISO-дата для машинного события catering:calc-lead (может быть ""). */
  dateIso: string;
  /** 0 для undecided (V6) — строка «Расчёт с сайта» в POST не пишется. */
  total: number;
  /** Fix5 V6: формат ещё не выбран — без цены, с необязательным комментарием. */
  undecided: boolean;
  /** Обещание перезвона для тоста — без привязки к часам (task 7-E). */
  toastPromise: string;
  onSuccess: (
    id: string | number | undefined,
    detail: { typeId: string; guests: number; dateIso: string; total: number },
  ) => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  /** Fix5 V6: комментарий для «Ещё решаю» — свободный текст о событии. */
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  /** FIX-1 (task 2, критик B MINOR — двойной POST /api/lead, 34 мс):
   *  гейт `status === "loading"` — это React-state: два submit-события в
   *  одном окне ре-рендера читают ОДИНАКОВЫЙ стейл "idle" и ОБА идут в
   *  fetch → на сервере дубли-заявки. Ref-лок — синхронный: check-and-set
   *  в том же тике, второй вход игнорируется ещё до fetch. Снимается
   *  ТОЛЬКО по завершению (ошибка сети / не-ок ответ); на успехе НЕ
   *  снимается — форма размонтируется (stage→success, новый цикл = новый
   *  ref=false), а если вдруг не размонтируется — дубль всё равно
   *  невозможен. Чтение/запись — только в обработчике события, не в
   *  рендере (React Compiler §37 это разрешает). */
  const submitInFlightRef = useRef(false);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  /** C71-FIX (Task 2, audit A1 MINOR): фокус на первое невалидное поле —
   *  телефон, если имя валидно (см. goNext). */
  const phoneRef = useRef<HTMLInputElement>(null);
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
        comment: string;
      }>;
      if (typeof d.name === "string") setName(d.name);
      if (typeof d.phone === "string") setPhone(d.phone);
      if (typeof d.email === "string") setEmail(d.email);
      if (typeof d.preferredTime === "string") setPreferredTime(d.preferredTime);
      if (typeof d.comment === "string") setComment(d.comment);
    } catch {
      // non-critical
    }
  }, []);

  /* --- draft save — ДЕБАУНС 300 мс (SPEC §2.6; в старом коде был каждый
         keystroke — perf-баг). Пустая форма УДАЛЯЕТ черновик (W3-MINOR:
         раньше пустая форма скипала запись — юзер, стёрший текст, после
         reload получал его обратно из устаревшего draft). --- */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (!name && !phone && !email && !preferredTime && !comment) {
          window.localStorage.removeItem(DRAFT_KEY);
          return;
        }
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ name, phone, email, preferredTime, comment }),
        );
      } catch {
        // non-critical
      }
    }, 300);
    return () => clearTimeout(t);
  }, [name, phone, email, preferredTime, comment]);

  const phoneDigits = phone.replace(/[^+0-9]/g, "");
  const phoneValid = PHONE_REGEX.test(phoneDigits);
  const nameValid = name.trim().length > 1;

  const goNext = () => {
    const nextErrors = { name: !nameValid, phone: !phoneValid };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) {
      /* C71-FIX (Task 2, audit A1 MINOR): без этого пользователь видел
       * красную рамку/текст ошибки, но фокус оставался на кнопке «Далее»
       * — невалидное поле приходилось искать глазами. Переносим фокус на
       * ПЕРВОЕ невалидное (имя → телефон); focus() подскроллит поле в
       * кадр, role="alert" у .hb-err озвучит причину. */
      (nextErrors.name ? nameRef.current : phoneRef.current)?.focus();
      return;
    }
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
    /* C71 (Task 1-c2 integration): захват формы ДО await — synthetic event
     * currentTarget обнуляется после асинхронного ожидания (React-грабля);
     * нужен как точка разлёта золотого салюта при успехе. */
    const formEl = e.currentTarget as HTMLElement;
    if (status === "loading") return;
    /* FIX-1 task 2: синхронный лок — переживает стейл-стейт (см. реф выше). */
    if (submitInFlightRef.current) return;
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    submitInFlightRef.current = true;
    setStatus("loading");
    try {
      /* K4-F1 (Task 5): таймаут 15с —fetch без AbortSignal мог висеть
       * бесконечно (мёртвый upstream/потеря сети на середине): кнопка
       * «Отправляем…» и submitInFlightRef оставались залочены навсегда.
       * AbortSignal.timeout отвергает промис DOMException(name=
       * "TimeoutError") — он уходит в catch ниже (НЕ TypeError),
       * там отдельный тост и штатный ресет состояния. */
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          name,
          phone: normalizePhone(phone),
          email: email || undefined,
          // Fix5 V6: «Ещё решаю» шлётся БЕЗ формата (eventType undefined) —
          // тип подберём по звонку.
          eventType: undecided ? undefined : typeId || undefined,
          guests,
          message:
            [
              undecided && "Формат ещё не выбран — нужна помощь с подбором",
              dateHuman && `Желаемая дата: ${dateHuman}`,
              preferredTime && `Желаемое время звонка: ${preferredTime}`,
              !undecided && total > 0 && `Расчёт с сайта: ~${formatRUB(total)}`,
              comment && `Комментарий: ${comment}`,
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
        submitInFlightRef.current = false;
        return;
      }

      const data = (await res.json().catch(() => null)) as { id?: string | number } | null;
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // non-critical
      }
      toast.success(`Заявка принята! ${toastPromise}.`);
      /* C71 (Task 1-c2): золотой салют из формы — эмоциональная точка
       * конверсии (reduce-motion → noop внутри утилиты, анти-спам ≤2). */
      fireGoldConfetti(formEl);
      /* КОНТРАКТ 7: снимок расчёта — из пропсов формы. LeadForm —
         React.memo, и он НЕ пересобирается на кадрах драга только
         потому, что handleSuccess — стабильная ссылка (useCallback с
         пустыми зависимостями в родителе, §28), а остальные пропсы —
         дебаунс-значения. React Compiler в проекте НЕ включён —
         стабильность достигается вручную (было: комментарий врал про
         «компилятор сохраняет memo»). */
      onSuccess(data?.id, {
        // typeId-пропс уже нормализован родителем (undecided → "undecided")
        typeId,
        guests,
        dateIso,
        total,
      });
    } catch (err) {
      /* K4-F1 (Task 5): прерванный по таймауту fetch — отдельная причина
       * с честным текстом «сервер не отвечает»; статус и лок ниже
       * разблокируют повторную отправку. */
      if (err instanceof DOMException && err.name === "TimeoutError") {
        toast.error("Сервер не отвечает — попробуйте ещё раз или позвоните нам напрямую.");
      } else if (err instanceof TypeError) {
        toast.error("Нет связи с сервером. Проверьте интернет-соединение и попробуйте ещё раз.");
      } else {
        toast.error("Не удалось отправить. Позвоните нам напрямую.");
      }
      setStatus("idle");
      submitInFlightRef.current = false;
    }
  };

  const menuType = MENU_TYPES.find((m) => m.id === typeId) ?? MENU_TYPES[0];
  /* Fix5 V6: формат в сводке — для undecided показываем честное «Подберём вместе». */
  const formatLabel = undecided ? "Подберём вместе" : menuType.label;

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
                  ref={phoneRef}
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

              {/* Fix5 V6: комментарий виден ТОЛЬКО в режиме «Ещё решаю» —
                  свободный текст о событии (услуги не перечисляем). */}
              {undecided && (
                <div className="hb-field">
                  <label htmlFor="hb-comment" className="hb-label">
                    О событии <span className="hb-label__opt">— необязательно</span>
                  </label>
                  <textarea
                    id="hb-comment"
                    className={`${field} resize-y min-h-[72px]`}
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Пара слов — что за событие и что уже знаете"
                  />
                </div>
              )}

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

              {/* Мини-сводка расчёта (Fix5 V6: без «Расчёта» у undecided) */}
              <dl className="hb-summary">
                <div className="hb-summary__row">
                  <dt>Формат</dt>
                  <dd>{formatLabel}</dd>
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
                {!undecided && (
                  <div className="hb-summary__row hb-summary__row--total">
                    <dt>Расчёт</dt>
                    <dd>~{formatRUB(total)}</dd>
                  </div>
                )}
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
 * Fix5 V6: мета — готовая строка metaLine (у undecided — без цены).
 */
function SuccessPanel({
  leadId,
  metaLine,
  promiseLine,
  onReset,
  settled,
}: {
  leadId: string | number | undefined;
  metaLine: string;
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

        <div className="hb-success__meta">{metaLine}</div>

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
  /** null для «Ещё решаю» (Fix5 V6) — вместо цены показываем «после подбора». */
  total: number | null;
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
        {/* Fix5 V6: у undecided цены нет — честный текст вместо «~0 ₽». */}
        <b>{total != null ? `~${formatRUB(total)}` : "после подбора"}</b>
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
 * Fix5 V6: последняя карточка «Ещё решаю» — псевдо-тип без цены: заявка
 * без расчёта и формата (нужен тем, кто выбирает между услугами; сами
 * услуги не перечисляем — выбор и так большой).
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
      <motion.button
        type="button"
        onClick={() => onSelect(UNDECIDED_ID)}
        aria-pressed={typeId === UNDECIDED_ID}
        whileTap={settled ? { scale: 0.985 } : undefined}
        className={`hb-type hb-type--idea ${typeId === UNDECIDED_ID ? "hb-type--on" : ""}`}
      >
        <span className="hb-type__main">
          <span className="hb-type__label">Ещё решаю</span>
          <span className="hb-type__short">Подскажем формат — заявка без расчёта</span>
        </span>
        <span className="hb-type__price">без цены · формат обсудим</span>
        {typeId === UNDECIDED_ID && (
          <motion.span
            layoutId="hb-type-underline"
            className="hb-type__underline"
            initial={false}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            aria-hidden="true"
          />
        )}
      </motion.button>
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

/**
 * Fix5 V6: строки чека для режима «Ещё решаю» — заявка без цены и формата.
 * Термопечать та же (PrintLine), но сигнатуры не меняются от драга слайдера
 * (гости печатаются при остановке — как в основном чеке, через debounce
 * в родителе не нужно: строк всего две, ремоунт дешёвый).
 */
const UndecidedLines = memo(function UndecidedLines({
  guests,
  settled,
  active,
}: {
  guests: number;
  settled: boolean;
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
      <PrintLine
        sig="undecided-format"
        index={0}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line"
      >
        <span className="hb-line__label">Формат события</span>
        <span className="hb-line__value">обсудим по звонку</span>
      </PrintLine>
      <PrintLine
        sig={`undecided-${guests}`}
        index={1}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line"
      >
        <span className="hb-line__label">Гостей</span>
        <span className="hb-line__value">{guests}</span>
      </PrintLine>
      <PrintLine
        sig="undecided-included"
        index={3}
        active={active}
        settled={settled}
        delayBase={delayBase}
        className="hb-line hb-line--included"
      >
        <span>Меню и сервис подберём под вашу задачу — расскажите о событии в заявке</span>
      </PrintLine>
    </>
  );
});

/* ================================================== FIX-7 (W2-B M2): ДАТЕР */

/**
 * Поле даты калькулятора — Popover + shadcn-Calendar с ГОТОВОЙ русской
 * локалью react-day-picker («react-day-picker/locale» → ru: дни «19 сентября
 * 2026 г., суббота», стрелки «Перейти к следующему месяцу», неделя с ПН).
 *
 * ЗАЧЕМ ЗАМЕНА нативного <input type="date">: Chromium раскрывает ВНУТРЕННИЕ
 * сегменты нативного поля в AX-дереве как англ. задвоенные спин-кнопки
 * «Month Month / Day Day / Year Year» (value 0 до ввода) + кнопку
 * «Show date picker» — на русском сайте это MINOR-дефект W2-B. Замер-проба
 * на ЧИСТОЙ странице (tmp-fix7/date-test.html): дубль живёт в UA shadow DOM
 * и НЕ управляется разметкой (lang="ru", <label>, aria-label — без эффекта),
 * скрыть отдельные спин-кнопки aria-hidden невозможно. Единственный способ
 * дать скринридеру внятные русские имена — свой пикер; react-day-picker v9
 * уже в deps, датапикер-календарь (ui/calendar.tsx) добавлен во владение
 * FIX-7 (используется как есть, без правок).
 *
 * ПОЛУЧАЕМ БОНУСОМ:
 *  - клавиатурную навигацию сетки (стрелки/Home/End/PgUp/PgDn — RDP v9);
 *  - фокус возвращается на триггер после выбора — SR перечитывает имя
 *    кнопки с новой датой (петля обратной связи);
 *  - iOS-зум-гейт снят: кнопка не триггерит авто-зум Safari (поле <16px
 *    зумило; поле теперь 1rem, но это визуальная преемственность, не гейт).
 *
 * КОНТРАКТ ДАТЫ НЕ МЕНЯЕТСЯ (§34: датапикеры — источник гидрационных мин;
 * все изменения даты проверяются сабмит-тестом):
 *  - value/onChange — тот же ISO «YYYY-MM-DD» (state `date` родителя,
 *    форма собирает дату из него как прежде — сообщение «Желаемая дата: …»);
 *  - прошедшие дни disabled от minIso (minToday из эффекта: до маунта «» —
 *    SSR/клиент идентичны, паттерн W3-FIX выше по файлу);
 *  - дата необязательна; повторный клик по выбранному дню — сброс
 *    (у нативного поля был крестик — семантика сохранена).
 *
 * ГИДРАТАЦИЯ: триггер рендерится одинаково на SSR/клиенте («Выберите дату»,
 * min-атрибутов нет), контент поповера монтируется ТОЛЬКО при открытии
 * (клиентское состояние open) — гидрационной поверхности нет вовсе.
 * Имя кнопки — aria-labelledby «лейбл + значение»: видимый лейбл входит
 * в accname (WCAG 2.5.3 Label in Name), значение даты озвучивается при
 * каждом возврате фокуса.
 */
function HbDateField({
  value,
  minIso,
  invalid,
  onChange,
}: {
  /** ISO «YYYY-MM-DD» | "" (не выбрана). */
  value: string;
  /** Нижняя граница (сегодня, ISO) | "" до маунта — SSR-безопасно. */
  minIso: string;
  invalid?: boolean;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => (value ? new Date(`${value}T00:00:00`) : undefined),
    [value],
  );
  const minDate = useMemo(
    () => (minIso ? new Date(`${minIso}T00:00:00`) : undefined),
    [minIso],
  );
  const handleSelect = useCallback(
    (d: Date | undefined) => {
      onChange(d ? toIsoDate(d) : "");
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id="hb-date"
          className="hb-date__trigger"
          aria-labelledby="hb-date-label hb-date-val"
          /* aria-invalid НЕ вешаем: на role=button он не поддерживается
             (jsx-a11y/role-supports-aria-props); ошибка озвучивается
             подсказкой hb-date-err (aria-live=polite) через describedby. */
          aria-describedby={invalid ? "hb-date-err" : undefined}
        >
          <CalendarDays className="hb-date__icon size-4" aria-hidden="true" />
          <span
            id="hb-date-val"
            className="hb-date__val"
            data-empty={value ? "false" : "true"}
          >
            {value ? formatHumanDate(value) : "Выберите дату"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="hb-date__pop"
        align="start"
        aria-label="Календарь даты события"
      >
        <Calendar
          mode="single"
          locale={ruDayPickerLocale}
          selected={selected}
          onSelect={handleSelect}
          disabled={minDate ? { before: minDate } : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* ============================================================ ГЛАВНЫЙ БЛОК */

type Stage = "calc" | "form" | "success";

export function HaccBooking() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  /** mounted-гейт (C62): SSR/первый клиентский рендер = статика. */
  const settled = mounted && !reduce;

  /* --- КОНТРАКТ 1: nuqs type/guests — те же парсеры, что в calculator.tsx,
         поэтому presetCalculator (history.replaceState) из hacc-menu
         подхватывается без изменений (Контракт 2).
         Fix5 V3: дефолты владельца — банкет / 30 гостей.
         Fix5 V4 (перф): guests живёт в ЛОКАЛЬНОМ зеркале — URL (nuqs)
         пишется дебаунсом 500 мс, а не на каждый кадр драга. --- */
  const [typeId, setTypeId] = useQueryState("type", parseAsString.withDefault("banquet"));
  const [guestsParam, setGuestsParam] = useQueryState("guests", parseAsInteger.withDefault(30));
  const [guestsLocal, setGuestsLocal] = useState(guestsParam);
  /** Последнее значение, ГАРАНТИРОВАННО отражённое в URL (или взятое из него). */
  const guestsSyncRef = useRef(guestsParam);
  /** Fix5 V2: драфт поля ручного ввода гостей (null = показываем значение). */
  const [guestsDraft, setGuestsDraft] = useState<string | null>(null);
  /* Fix5 V4 (перф): коалесинг драга слайдера в кадры — пачка pointermove
     между кадрами даёт ОДИН setState вместо N (на тач-экранах события
     приходят чаще кадров — именно это и читалось как «тормозит»). */
  const guestsRafRef = useRef(0);
  const guestsPendingRef = useRef<number | null>(null);
  const setGuestsFrame = useCallback((next: number) => {
    guestsPendingRef.current = next;
    if (guestsRafRef.current) return;
    guestsRafRef.current = requestAnimationFrame(() => {
      guestsRafRef.current = 0;
      if (guestsPendingRef.current != null) {
        setGuestsLocal(guestsPendingRef.current);
        guestsPendingRef.current = null;
      }
    });
  }, []);
  useEffect(
    () => () => {
      if (guestsRafRef.current) cancelAnimationFrame(guestsRafRef.current);
    },
    [],
  );
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
  /** Fix5 V6: «Ещё решаю» — псевдо-тип без цены/формата. */
  const isUndecided = typeId === UNDECIDED_ID;
  /** Эффективный минимум: у undecided — общий минимум 10 (не 30 банкета). */
  const effMin = isUndecided ? GUESTS_ABS_MIN : current.minGuests;
  /* Q1 (task 9-fix2): кламп ДВУСТОРОННИЙ — URL ?guests=600 больше не даёт
     aria-valuenow=600 > aria-valuemax=500 и чек «на 600 гостей».
     Fix5 V4: кламп применяется к локальному зеркалу (URL пишется дебаунсом). */
  const guestsClamped = Math.min(GUESTS_MAX, Math.max(guestsLocal, effMin));

  /* W3-FIX (hydration-risk): todayIso() читает new Date() — на SSR (UTC) и
   * первом клиентском рендере (МСК) даты расходятся с 00:00 до 03:00 по
   * Москве, и min-атрибут date-инпута даёт hydration-mismatch. Схема:
   * SSR/первый клиентский рендер — пустая строка (min не рендерится),
   * реальное «сегодня» ставится в useEffect ПОСЛЕ маунта — билд
   * server/client идентичен, ограничение прошлых дат появляется сразу после
   * гидрации. dateInvalid до маунта = false (согласованно на обеих сторонах). */
  const [minToday, setMinToday] = useState("");
  useEffect(() => {
    setMinToday(todayIso());
  }, []);

  /* Q2 (task 9-fix2): прошедшая дата, введённая вручную, больше не «молчит» —
     под полем появляется подсказка, а из расчёта дата исключается
     (seasonMultiplier прошлой даты не должен менять итог). */
  const dateInvalid = Boolean(date) && date < minToday;
  const dateValid = dateInvalid ? "" : date;
  const humanDate = useMemo(() => formatHumanDate(dateValid), [dateValid]);

  /* КОНТРАКТ 3: addons = [] — секцию «Дополнительно» юзер просил убрать.
     Fix5 V6: у undecided расчёта НЕТ (result = null) — цены нигде не рендерятся. */
  const result = useMemo(
    () => (isUndecided ? null : calcTotal(typeId, guestsClamped, [], dateValid)),
    [isUndecided, typeId, guestsClamped, dateValid],
  );

  /* Fix5 V4: itemized-строки чека печатаются от ДЕБАУНС-значения гостей
     (160 мс после остановки драга) — PrintLine не ремоунтится каждый кадр.
     Живой итог (MotionTotal) и мини-сумма считаются от МГНОВЕННОГО значения. */
  const receiptGuests = useDebouncedValue(guestsClamped, 160);
  const receiptResult = useMemo(
    () => (isUndecided ? null : calcTotal(typeId, receiptGuests, [], dateValid)),
    [isUndecided, typeId, receiptGuests, dateValid],
  );

  /* Fix5 V4 (перф): три эффекта вместо старого кламп-эффекта с записью в URL.
     (1) внешний URL (presetCalculator / menu-select / share-ссылка) → зеркало;
     (2) кламп зеркала в [effMin, 500];
     (3) debounced-коммит зеркала в URL (nuqs) — не чаще раза в 500 мс.
     Известный компромисс (critic F6, принят): внешний пресет ВО ВРЕМЯ драга
     перекрывается следующим кадром драга (sync-эффект, потом rAF драга) —
     редкий, самозаживляющий случай; в обратную сторону (драг во время
     пресета) драг честно побеждает — юзер источник истины. */
  useEffect(() => {
    if (guestsParam !== guestsSyncRef.current) {
      guestsSyncRef.current = guestsParam;
      setGuestsLocal(guestsParam);
    }
  }, [guestsParam]);

  useEffect(() => {
    if (guestsLocal > GUESTS_MAX) setGuestsLocal(GUESTS_MAX);
    else if (guestsLocal < effMin) setGuestsLocal(effMin);
  }, [effMin, guestsLocal]);

  useEffect(() => {
    if (guestsLocal === guestsSyncRef.current) return;
    const t = window.setTimeout(() => {
      guestsSyncRef.current = guestsLocal;
      void setGuestsParam(guestsLocal);
    }, 500);
    return () => window.clearTimeout(t);
  }, [guestsLocal, setGuestsParam]);

  /* Task 7-E: обещание перезвона — без привязки к часам офиса (бейдж
     «Отвечаем в любое время»); один тон на CTA-нот, тост и квитанцию. */
  const ctaPromise = "Перезвоним сразу, как увидим заявку";
  const toastPromise = "Перезвоним сразу, как увидим заявку";
  const scriptPromise = "Мы перезвоним сразу, как увидим заявку";

  /* КОНТРАКТ 7 (слушатель): catering:menu-select. menu.tsx шлёт detail=string
     (typeId); спящие компоненты могут прислать {typeId, guests} — понимаем оба. */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = typeof detail === "string" ? detail : detail?.typeId;
      const g = typeof detail === "object" && detail ? detail.guests : undefined;
      if (typeof id === "string" && MENU_TYPES.some((m) => m.id === id)) setTypeId(id);
      if (typeof g === "number" && Number.isFinite(g) && g >= 1) {
        // Q1 (task 9-fix2): кламп сверху; Fix5 V4 — пишем в зеркало,
        // URL догонит debounced-коммитом (не гнать nuqs на каждый кадр).
        setGuestsLocal(Math.min(GUESTS_MAX, g));
      }
    };
    window.addEventListener("catering:menu-select", handler);
    return () => window.removeEventListener("catering:menu-select", handler);
  }, [setTypeId]);

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

  /* D3 (task 7-fix1): ОДИН IO на три зоны (типы / CTA чека / контакты).
     Fix5 (critic MAJOR-2, cycle 65): раньше rootMargin «-140px снизу» давал
     ОБРАТНУЮ семантику — бар прятался, когда зона была ГДЕ УГОДНО выше
     нижней полосы (виден в 1 из 9 позиций), и мигал над заголовком контактов
     при входе зоны. Теперь root — сама НИЖНЯЯ ПОЛОСА (~17% вьюпорта через
     процентный rootMargin — переживает resize без пересчёта в px): бар виден
     ВСЮду, кроме момента, когда интерактив реально входит в полосу под баром. */
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
      { rootMargin: "-83% 0px 0px 0px", threshold: 0 },
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

  /** Хендофф: чек сжимается, форма раскрывается, фокус — в первое поле.
      Fix5 V7: CTA ВСЕГДА ведёт к форме (владелец: «не перекидывает на форму,
      на мобиле можно не заметить, что форма появилась сверху») — трёхтактный
      скролл (0/300/700мс переживает grid-раскрытие 0.5s + lenis-сеттл) и
      однократная подсветка зоны (hb-zone-flash в CSS по data-open). */
  const openForm = useCallback(() => {
    setStage((s) => {
      if (s !== "calc") return s;
      return "form";
    });
    scrollToZone();
    window.setTimeout(scrollToZone, 300);
    window.setTimeout(scrollToZone, 700);
    const delay = settled ? 780 : 0;
    window.setTimeout(() => {
      document.getElementById("hb-name")?.focus({ preventScroll: true });
    }, delay);
  }, [scrollToZone, settled]);

  /** КОНТРАКТ 7 (диспетчер): catering:calc-lead при УСПЕШНОМ сабмите.
      Fix5 V4 (перф) + React Compiler: колбек ПОЛНОСТЬЮ стабильный — снимок
      расчёта строит сама форма из СВОИХ пропсов (LeadForm onSuccess-вызов;
      пропсы формы — дебаунс-значения, на момент сабмита устоявшиеся).
      Никаких ref-читов внутри замыкания — компилятор сохраняет memo. */
  const handleSuccess = useCallback(
    (
      id: string | number | undefined,
      detail: { typeId: string; guests: number; dateIso: string; total: number },
    ) => {
      setLeadId(id);
      setStage("success");
      window.dispatchEvent(
        new CustomEvent("catering:calc-lead", {
          detail: {
            typeId: detail.typeId,
            guests: detail.guests,
            date: detail.dateIso,
            total: detail.total,
            addons: [] as string[],
          },
        }),
      );
    },
    [],
  );

  /* FIX-1 (task 1+3, волна-1 критик B MAJOR/NIT): раньше ресет писал
     stage="calc" — «Отправить ещё одну заявку» убивал форму: зона
     схлопывалась (grid 0fr), .hb-zone__body получал inert=true (вся форма
     выпадала из a11y-дерева), поднявшаяся .hb-contacts перекрывала поле
     ТЕЛЕФОН («covered by», fill не менял value), восстановление — только
     полным reload. Ресет обязан открывать РАБОЧУЮ форму:
     - stage "form" — зона раскрыта (data-open), inert снят, CTA-зона
       панели сворачивается (aria-hidden+inert, как при обычном открытии
       формы) — путь ровно тот же, что у openForm, только без скролла
       (юзер уже у зоны);
     - LeadForm монтируется заново (success его размонтировал): шаг 1,
       пустые поля — draft удалён при 201, подтягиваться нечему;
     - дата сбрасывается к дефолту (NIT: имя/телефон чистились, дата
       переживала ресет — дата живёт в родителе, вне формы);
     - leadId затирается — квитанция прошлого цикла не подтекает;
     - фокус — в первое поле (кнопка ресета только что размонтировалась,
       иначе фокус падает на body; mounted-гейт §34 не нужен — фокус
       ставится только по пользовательскому клику). */
  const resetToForm = useCallback(() => {
    setLeadId(undefined);
    setDate("");
    setStage("form");
    /* LeadForm монтируется следующим коммитом — таймер 120 мс даёт
       React закрепить DOM (скролл не трогаем: сцена уже перед глазами). */
    window.setTimeout(() => {
      document.getElementById("hb-name")?.focus({ preventScroll: true });
    }, 120);
  }, []);

  /** D5 (task 7-fix1): stable-колбек для memo-сетке типов (TypeGrid). */
  const handleTypeSelect = useCallback((id: string) => setTypeId(id), [setTypeId]);

  /* aria-live итога — троттлинг 700 мс (SPEC §2.11), обновляется только
     «на восстановление» после остановки изменений, не на каждый кадр.
     Fix5 V6: у undecided — голосовая сводка без цены. */
  const [srTotal, setSrTotal] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSrTotal(
        isUndecided
          ? `Заявка без расчёта — формат обсудим по звонку, ${guestsClamped} ${guestsLabel(guestsClamped)}`
          : `Итого примерно ${formatRUB(result!.total)} за ${guestsClamped} ${guestsLabel(guestsClamped)}`,
      );
    }, 700);
    return () => clearTimeout(t);
  }, [isUndecided, result, guestsClamped]);

  /** Fix5 V6: мета квитанции успеха — одна строка (у undecided — без цены). */
  const successMeta = isUndecided
    ? `Формат обсудим · ${guestsClamped} ${guestsLabel(guestsClamped)}${humanDate ? ` · ${humanDate}` : ""}`
    : `${current.label} · ${guestsClamped} ${guestsLabel(guestsClamped)}${humanDate ? ` · ${humanDate}` : ""} · ~${formatRUB(result!.total)}`;

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
        {/* ── Шапка секции. Fix5 V8: дубль «смета-чек»/«Расчёт и заявка»
               устранён — остаётся ТОЛЬКО наклонный TiltedAccent; вторая строка
               H2 — с новой строки (блок-строка .hb-h2-line). ── */}
        <div className="hb-head">
          <TiltedAccent text="смета-чек" size="clamp(1.1rem, 1.8vw, 1.55rem)" />
          <h2 id="hbooking-heading" className="ea-section-h2">
            {"Соберите банкет. "}
            <i className="ea-italic-fragment hb-h2-line">Чек напечатается сразу.</i>
          </h2>
          <p className="hb-lede">
            Выберите формат и гостей — смета-чек напечатается рядом.
            Ещё выбираете формат? Оставьте заявку — подберём и посчитаем вместе.
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
              {/* Fix5 V6: typeId передаём как есть — карточка «Ещё решаю»
                  тоже подсвечивается; неизвестный id из URL по-прежнему
                  фолбэчится на первый формат (current). */}
              <TypeGrid
                typeId={typeId === UNDECIDED_ID ? UNDECIDED_ID : current.id}
                onSelect={handleTypeSelect}
                settled={settled}
              />
            </fieldset>

            {/* 2 · Гости — odometer + слайдер. Fix5 V1/V2/V4: нелинейная шкала
                (10–50 = 62% трека), шаг 1, ввод числа с клавиатуры, ±1,
                заливка scaleX (compositor), URL — дебаунсом. */}
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
                    пресет-кнопки; Fix5 V1: позиции — по НЕЛИНЕЙНОЙ карте
                    sliderPos(). Заливка — scaleX от springs (transform-only,
                    без layout — правка тормозов V4). */}
                <div className="hb-slider__rail">
                  <motion.span
                    className="hb-slider__fill"
                    aria-hidden="true"
                    style={{ width: "100%", transformOrigin: "left center" }}
                    initial={false}
                    animate={{ scaleX: sliderPos(guestsClamped, effMin) }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                  {[effMin, ...SLIDER_TICKS.filter((t) => t > effMin)].map((tick) => (
                    <button
                      key={tick}
                      type="button"
                      className={`hb-slider__tick ${guestsClamped >= tick ? "hb-slider__tick--on" : ""}`}
                      style={{ left: `${sliderPos(tick, effMin) * 100}%` }}
                      onClick={() => setGuestsLocal(Math.min(GUESTS_MAX, Math.max(effMin, tick)))}
                      aria-label={`Установить ${tick} ${guestsLabel(tick)}`}
                    >
                      {tick}
                    </button>
                  ))}
                </div>
                {/* Нелинейный range: value = позиция 0..1000, гости — из карты.
                    Стрелки клавиатуры перехвачены: ±1 гость (не микрошаг карты). */}
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={1}
                  value={Math.round(sliderPos(guestsClamped, effMin) * 1000)}
                  onChange={(e) => setGuestsFrame(guestsFromPos(Number(e.target.value) / 1000, effMin))}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                      e.preventDefault();
                      setGuestsLocal((g) => Math.min(GUESTS_MAX, Math.max(effMin, g) + 1));
                    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      setGuestsLocal((g) => Math.max(effMin, g - 1));
                    }
                  }}
                  aria-valuenow={guestsClamped}
                  aria-valuemin={effMin}
                  aria-valuemax={GUESTS_MAX}
                  aria-valuetext={`${guestsClamped} ${guestsLabel(guestsClamped)}`}
                  aria-label="Количество гостей"
                  className="hb-slider__input"
                />
                <div className="hb-slider__adjust">
                  {/* M2 (task 11-fix3): живая мини-сумма рядом со слайдером;
                      Fix5 V6: у undecided цены нет — короткое «после подбора»
                      (длинный текст не должен выталкивать +1 за экран, V-fit). */}
                  <span className="hb-slider__total">
                    {isUndecided ? "после подбора" : `≈ ${formatRUB(result!.total)}`}
                  </span>
                  {/* Fix5 V2: ввод числа + шаг ±1 (владелец: «не по 5, а по одному
                      и чтобы можно было напечатать количество»). Драфт-строка
                      живёт, пока поле в фокусе; коммит — Enter/blur, кламп в
                      [effMin, 500]; вне фокуса показывается текущее значение. */}
                  <span className="hb-slider__edit">
                    <button
                      type="button"
                      onClick={() => setGuestsLocal((g) => Math.max(effMin, Math.min(GUESTS_MAX, g) - 1))}
                      className="hb-step-btn"
                      aria-label="Меньше на одного гостя"
                    >
                      <Minus className="size-4" aria-hidden="true" /> 1
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className="hb-guests-input"
                      value={guestsDraft ?? String(guestsClamped)}
                      onFocus={() => setGuestsDraft(String(guestsClamped))}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                        setGuestsDraft(digits);
                      }}
                      onBlur={() => {
                        if (guestsDraft != null && guestsDraft !== "") {
                          const n = Number(guestsDraft);
                          if (Number.isFinite(n) && n > 0) {
                            setGuestsLocal(Math.min(GUESTS_MAX, Math.max(effMin, n)));
                          }
                        }
                        setGuestsDraft(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      aria-label="Количество гостей — введите число"
                    />
                    <button
                      type="button"
                      onClick={() => setGuestsLocal((g) => Math.min(GUESTS_MAX, Math.max(effMin, g) + 1))}
                      className="hb-step-btn"
                      aria-label="Больше на одного гостя"
                    >
                      1 <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              </div>

              {/* C3 (task 9-fix2): ПОСТОЯННАЯ плашка у минимума — раньше сообщение
                  жило <120 мс (кламп-эффект гасил условие в том же кадре). Теперь
                  живёт, ПОКА гость стоит на минимуме; Fix5 V6: у undecided — свой
                  текст (минимум формата неприменим). */}
              {isUndecided ? (
                guestsClamped === GUESTS_ABS_MIN && (
                  <p className="hb-minnote" role="status">
                    Формат ещё не выбран — считаем от 10 {guestsLabel(GUESTS_ABS_MIN)}; вилку цен
                    покажем по звонку
                  </p>
                )
              ) : (
                guestsClamped === current.minGuests && (
                  <p className="hb-minnote" role="status">
                    Минимум для «{current.label}» — {current.minGuests} {guestsLabel(current.minGuests)}:{" "}
                    посчитаем от него
                  </p>
                )
              )}
            </div>

            {/* 3 · Дата — необязательно */}
            <div className="hb-block" role="group" aria-label="Дата мероприятия (необязательно)">
              {/* FIX-7: label остаётся настоящим <label> (клик по нему
                  открывает пикер — htmlFor указывает на кнопку-поле),
                  id добавлен для aria-labelledby триггера (имя кнопки =
                  «лейбл + значение даты», WCAG 2.5.3 Label in Name). */}
              <label htmlFor="hb-date" id="hb-date-label" className="hb-label-caps">
                Дата события <span className="hb-label-caps__opt">— необязательно, уточним по звонку</span>
              </label>
              <div className="hb-date">
                {/* FIX-7: нативный date-инпут → HbDateField (Popover +
                    react-day-picker, ru-локаль) — почему: докблок компонента.
                    Контракт: value/minIso/onChange — те же ISO-строки, что
                    были у инпута; invalid — прежняя aria-invalid-логика Q2. */}
                <HbDateField
                  value={date}
                  minIso={minToday}
                  invalid={dateInvalid}
                  onChange={setDate}
                />
              </div>
              {/* Q2 (task 9-fix2): прошедшая дата — инлайн-подсказка (polite). */}
              {dateInvalid && (
                <p id="hb-date-err" className="hb-err" aria-live="polite">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  Дата уже прошла — выберите будущую
                </p>
              )}
              {date && !isUndecided && result!.season > 1 && (
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
                      metaLine={successMeta}
                      promiseLine={scriptPromise}
                      onReset={resetToForm}
                      settled={settled}
                    />
                  ) : (
                    <LeadForm
                      typeId={typeId === UNDECIDED_ID ? UNDECIDED_ID : current.id}
                      /* Fix5 V4 (перф): форме отдаём ДЕБАУНС-значения — иначе
                         memo формы ломалось на каждом кадре драга слайдера
                         (гости в сводке settlement'ся через 160 мс — не видно). */
                      guests={receiptGuests}
                      dateHuman={humanDate}
                      dateIso={dateValid}
                      total={receiptResult?.total ?? 0}
                      undecided={isUndecided}
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
              {/* Fix5 V11: вращающаяся круговая печать на панели — wow-акцент,
                  работает и на мобиле. Техника «char-ring»: 37 абсолютных <i>
                  с rotate(i·step) вокруг центра — рендерится одинаково во всех
                  браузерах (SVG textPath+textLength в Chrome плывёт). CSS-rotate
                  18s, reduced-motion отключает вращение. */}
              <span className="hb-spin" aria-hidden="true">
                <span className="hb-spin__ring">
                  {HB_SPIN_TEXT.split("").map((ch, i) => (
                    <i
                      key={i}
                      style={{
                        transform: `translate(-50%, -50%) rotate(${(i * 360) / HB_SPIN_TEXT.length}deg) translateY(calc(-1 * var(--hb-spin-r)))`,
                      }}
                    >
                      {ch}
                    </i>
                  ))}
                </span>
                <span className="hb-spin__core">
                  <ReceiptText className="size-5" />
                </span>
              </span>

              <p className="hb-panel__caps">
                {/* X1 (task 13-fix4): после успеха шапка панели гасится —
                    «ЗАЯВКА ПРИНЯТА · № id». Штамп остаётся ОДИН — на квитанции
                    (урок волны-1 D2: не дублировать печать). */}
                {stage === "success" ? (
                  leadId != null ? `Заявка принята · № ${leadId}` : "Заявка принята"
                ) : (
                  <>
                    Предварительная смета
                    <span aria-hidden="true"> · Nilov Catering</span>
                  </>
                )}
              </p>

              {/* Чек: вход-«раскатка» наследуется от панели (D1 fix1).
                  D2 (task 9-fix2): штампа на чеке БОЛЬШЕ НЕТ (он един — на
                  квитанции успеха), поэтому и «удар штампа»-шейк снят —
                  бумагу трясло под печать, которой здесь больше нет. */}
              <motion.div className="hb-paper" variants={HB_PAPER_VARIANTS} data-stage={stage}>
                {/* Шапка чека (Fix5 V6: у undecided — без формата) */}
                <div className="hb-paper__head">
                  <span className="hb-paper__brand">Смета-чек</span>
                  <span className="hb-paper__type">
                    {isUndecided
                      ? `Формат обсудим · ${guestsClamped} ${guestsLabel(guestsClamped)}`
                      : `${current.label} · ${guestsClamped} ${guestsLabel(guestsClamped)}`}
                  </span>
                </div>

                <span className="hb-perfo" aria-hidden="true" />

                {/* Itemized-строки — схлопываются в компакт (grid-rows).
                    D5: содержимое — memo-компонент ReceiptLines (от ДЕБАУНС-
                    значения гостей — Fix5 V4); Fix5 V6: у undecided — свой
                    набор строк без цен. */}
                <div className="hb-lines" aria-hidden={stage !== "calc"}>
                  <div className="hb-lines__clip">
                    {isUndecided ? (
                      <UndecidedLines
                        guests={guestsClamped}
                        settled={settled}
                        active={paperInView}
                      />
                    ) : (
                      <ReceiptLines
                        type={current}
                        guests={receiptGuests}
                        perGuest={receiptResult!.perGuest}
                        subtotal={receiptResult!.subtotal}
                        season={receiptResult!.season}
                        settled={settled}
                        active={paperInView}
                      />
                    )}
                  </div>
                </div>

                <span className="hb-perfo" aria-hidden="true" />

                {/* Итог — всегда видим (и в компакте); Fix5 V6: у undecided —
                    честное «после подбора» вместо числа. */}
                <div className="hb-total">
                  <span className="hb-total__label">{isUndecided ? "Смета" : "Итого"}</span>
                  <span className="hb-total__value">
                    {isUndecided ? (
                      <span className="hb-total__later">после подбора</span>
                    ) : (
                      <>
                        <MotionTotal value={result!.total} className="hb-total__num" />
                        {/* Fix5 V4 (перф): дельта вспыхивает от ДЕБАУНС-итога —
                            один раз после остановки, а не на каждом шаге драга. */}
                        <TotalDelta total={receiptResult!.total} animate={settled} />
                      </>
                    )}
                  </span>
                </div>
                {isUndecided ? (
                  <p className="hb-total__per">
                    Формат ещё не выбран — цена появится после короткого разговора
                  </p>
                ) : (
                  <p className="hb-total__per">
                    {/* C7 (task 9-fix2): без сезона — точная базовая цена из данных;
                        с сезоном — «≈» + честный множитель. «₽/чел» без пробелов. */}
                    {result!.season > 1
                      ? `≈${formatRUB(Math.round(result!.perGuest * result!.season))}/чел · высокий сезон ×1,15 · ${guestsClamped} ${guestsLabel(guestsClamped)}`
                      : `${formatRUB(result!.perGuest)}/чел · ${guestsClamped} ${guestsLabel(guestsClamped)}`}
                  </p>
                )}

                {/* Подвал чека — честность минимума + сезон + дата (схлопывается) */}
                <div className="hb-lines" aria-hidden={stage !== "calc"}>
                  <div className="hb-lines__clip">
                    <span className="hb-perfo" aria-hidden="true" />
                    {isUndecided ? (
                      <p className="hb-note">
                        Ещё выбираете формат? Оставьте заявку — перезвоним, зададим пару
                        вопросов и соберём предложение под вашу задачу.
                      </p>
                    ) : (
                      <>
                        <p className="hb-note">
                          Меньше {current.minGuests} {guestsLabel(current.minGuests)}? Посчитаем
                          индивидуально — позвоните или оставьте заявку.
                        </p>
                        {/* C1 (task 9-fix2): ПОСТОЯННАЯ сноска сезона — видна ДО ввода
                            необязательной даты (ожидания больше не занижаются на −15%).
                            Когда сезон уже в расчёте строкой выше — не дублируем. */}
                        {result!.season <= 1 && (
                          <p className="hb-note hb-note--season">
                            {SEASON_CANON}
                            {!date ? ". Выберите дату, чтобы увидеть её в расчёте." : ""}
                          </p>
                        )}
                      </>
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
                      <button type="button" onClick={resetToForm} className="hb-panel__again">
                        Отправить ещё одну заявку
                      </button>
                    </p>
                  ) : (
                    <>
                      <Magnetic strength={0.25} className="mt-5 block">
                        <button
                          type="button"
                          onClick={openForm}
                          data-cursor="заявка"
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
          total={result?.total ?? null}
          guests={guestsClamped}
          visible={barVisible}
          onCta={openForm}
        />
      )}
    </section>
  );
}

export default HaccBooking;
