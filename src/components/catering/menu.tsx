"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Download, Loader2, Check, ChevronDown, Sparkles, Leaf, Wheat, Vegan, Star } from "lucide-react";
import { Reveal } from "./reveal";
import { Toggle } from "@/components/ui/toggle";
import { MENU_TYPES, formatRUB, type MenuType, type Dish } from "@/lib/pricing";
import { generateMenuPdf } from "@/lib/pdf-client";
import { toast } from "sonner";

/**
 * Dietary tags derived from dish name via heuristic text matching.
 * Tags: "veg" (vegetarian), "vegan", "gf" (gluten-free), "halal".
 * Returns the set of dietary tags a dish satisfies.
 */
function getDietaryTags(name: string): string[] {
  const lower = name.toLowerCase();
  // Fish / seafood (counts as non-veg/non-vegan)
  const fishRe = /(salmon|shrimp|halibut|tuna|octopus|scallop|seafood|caviar|mussel|oyster|crab|dorado|seabass|carpaccio|trout|sturgeon|fish|eel|char|herring)/i;
  // Meat (mammal + bird, no fish)
  const meatRe = /(pork|beef|chicken|lamb|tongue|ham|bacon|prosciutto|parma|roast|meat|kebab|stroganoff|cutlet|salami|pate|meatball|sausage|chorizo|duck|goose|stew|hot dog|bratwurst|medallion|steak|brisket|rib)/i;
  // Gluten sources
  const glutenRe = /(bruschetta|croissant|muffin|eclair|cake|burger|flatbread|bread|crouton|tartlet|shortbread|biscuit|donut|pie|baguette|ciabatta|pancake|crêpe|wrap|pita)/i;
  // Pork explicitly
  const porkRe = /(pork|bacon|ham|prosciutto|salami|sausage|chorizo|pancetta)/i;
  // Dairy (milk, cheese, cream, butter)
  const dairyRe = /(cheese|ricotta|mozzarella|parmesan|brie|blue cheese|feta|mascarpone|cheddar|cream|butter|sour cream|yogurt|bechamel|milk)/i;
  // Eggs
  const eggRe = /(egg|quail egg)/i;
  // Honey
  const honeyRe = /(honey)/i;

  const hasFish = fishRe.test(lower);
  const hasMeat = meatRe.test(lower) || hasFish;
  const hasGluten = glutenRe.test(lower);
  const hasPork = porkRe.test(lower);
  const hasDairy = dairyRe.test(lower);
  const hasEgg = eggRe.test(lower);
  const hasHoney = honeyRe.test(lower);

  const tags: string[] = [];
  if (!hasMeat) tags.push("veg");
  if (!hasMeat && !hasDairy && !hasEgg && !hasHoney && !hasFish) tags.push("vegan");
  if (!hasGluten) tags.push("gf");
  if (!hasPork) tags.push("halal");
  return tags;
}

/** All dietary chip definitions shown to the user. */
const DIETARY_CHIPS = [
  { id: "veg", label: "Без мяса", icon: Leaf },
  { id: "vegan", label: "Веган", icon: Vegan },
  { id: "gf", label: "Без глютена", icon: Wheat },
  { id: "halal", label: "Халяль", icon: Star },
] as const;

/**
 * Signature dishes for the spotlight block — one or more per menu type.
 * Each shows a chef note + price badge. Cycles every 8s.
 */
const SIGNATURE_DISHES: Record<string, Array<{
  name: string;
  chefNote: string;
  price: string;
  image: string;
}>> = {
  buffet: [
    {
      name: "Ассорти морских канапе",
      chefNote: "Краб, лосось и сливочный сыр — маленькие укусы холодного моря.",
      price: "от 2400 ₽ / чел",
      image: "/media/concorde-handhelds.jpg",
    },
    {
      name: "Скаллоп с цветной капустой",
      chefNote: "Три скаллопа, фиолетовая цветная капуста и микрогрин — текстура в каждом кусочке.",
      price: "от 2400 ₽ / чел",
      image: "/media/ridgewells-scallops.jpg",
    },
  ],
  banquet: [
    {
      name: "Мясное ассорти и паштеты",
      chefNote: "Паштеты, домашние сыровяленные meats и фирменные закуски — для праздничного банкета.",
      price: "от 3200 ₽ / чел",
      image: "/media/concorde-boardroom.webp",
    },
    {
      name: "Банкет в шатре",
      chefNote: "Полное обслуживание, текстиль и флористика — атмосфера праздничного вечера.",
      price: "от 3200 ₽ / чел",
      image: "/media/ridgewells-gala.jpg",
    },
  ],
  "snack-box": [
    {
      name: "Канапе с сёмгой и сливочным сыром",
      chefNote: "Кусочек, в котором помещается весь праздник.",
      price: "400 ₽ / шт",
      image: "/media/menu-snack-box.jpg",
    },
    {
      name: "Ассорти мини-сэндвичей",
      chefNote: "Краб, лосось и овощи в миниатюрных роллах — петербургский характер в каждом кусочке.",
      price: "400 ₽ / шт",
      image: "/media/concorde-handhelds.jpg",
    },
  ],
  "coffee-break": [
    {
      name: "Капучино 100% арабика",
      chefNote: "Бразильские зёрна, молоко взбито до 65°C — бариста-станция прямо на площадке.",
      price: "от 1200 ₽ / чел",
      image: "/media/menu-coffee-break.jpg",
    },
    {
      name: "Сырная доска",
      chefNote: "Бри, пармезан, голубой сыр и мёд — медленная пауза между сессиями.",
      price: "от 1200 ₽ / чел",
      image: "/media/menu-coffee-break.jpg",
    },
  ],
  vegetarian: [
    {
      name: "Овощное рагу в тыкве",
      chefNote: "Нут, карри и сезонные овощи — сытное блюдо для медленного наслаждения.",
      price: "от 1800 ₽ / чел",
      image: "/media/ridgewells-veg-mosaic.jpg",
    },
    {
      name: "Веганский шоколадный мусс",
      chefNote: "Бельгийский шоколад и ягоды — десерт без продуктов животного происхождения.",
      price: "от 1800 ₽ / чел",
      image: "/media/concorde-dessert.jpg",
    },
  ],
  bbq: [
    {
      name: "Адана-кебаб на углях",
      chefNote: "Баранина с кмином и кориандром — дым и специи на открытом огне.",
      price: "от 2000 ₽ / чел",
      image: "/media/event-08.jpg",
    },
    {
      name: "Авторские колбаски на гриле",
      chefNote: "Классические колбаски на углях — простой и настоящий рецепт для барбекю на природе.",
      price: "от 1200 ₽ / чел",
      image: "/media/event-08.jpg",
    },
  ],
  "office-lunch": [
    {
      name: "Домашний чили кон карне",
      chefNote: "Томёный, домашний — обед, после которого вторая половина дня идёт легче.",
      price: "от 900 ₽ / порция",
      image: "/media/menu-office-lunch.jpg",
    },
    {
      name: "Куриный киев",
      chefNote: "Сочное куриное бедро с травяным маслом внутри — классика не зря стала классикой.",
      price: "от 900 ₽ / порция",
      image: "/media/menu-office-lunch.jpg",
    },
  ],
};

/**
 * Map menu type IDs to their thumbnail images
 */
const MENU_TYPE_IMAGES: Record<string, string> = {
  buffet: "/media/concorde-handhelds.jpg",
  banquet: "/media/concorde-boardroom.webp",
  "snack-box": "/media/menu-snack-box.jpg",
  "coffee-break": "/media/concorde-avo-toast.jpg",
  vegetarian: "/media/ridgewells-veg-mosaic.jpg",
  bbq: "/media/event-06.jpg",
  "office-lunch": "/media/concept-banquet-table.jpg",
};

/**
 * FeaturedSpotlight — 80vh band between tabs and packages.
 * Shows ONE signature dish for the active menu type with a huge photo,
 * chef note (italic Playfair Display) and price badge.
 * Cycles every 8s through multiple signature dishes of the same type,
 * or instantly when the menu tab changes.
 */
function FeaturedSpotlight({
  activeMenuId,
  prefersReducedMotion = false,
}: {
  activeMenuId: string;
  prefersReducedMotion?: boolean;
}) {
  const dishes = SIGNATURE_DISHES[activeMenuId] ?? SIGNATURE_DISHES.buffet;
  const [idx, setIdx] = useState(0);

  // Reset index when active menu changes.
  useEffect(() => {
    setIdx(0);
  }, [activeMenuId]);

  // Cycle through signature dishes every 8s (skip if reduced motion).
  useEffect(() => {
    if (prefersReducedMotion || dishes.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % dishes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [dishes.length, prefersReducedMotion]);

  const dish = dishes[idx] ?? dishes[0];
  const nextDishIdx = (idx + 1) % dishes.length;

  return (
    <div
      aria-label="Фирменное блюдо"
      className="relative mt-12 h-[60vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border-line/60 bg-ink shadow-2xl shadow-ink/20 md:h-[80vh] md:min-h-[540px]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeMenuId}-${idx}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-gold backdrop-blur-md"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Sparkles className="size-3" />
            Фирменное блюдо · {idx + 1} из {dishes.length}
          </motion.span>

          <AnimatePresence mode="wait">
            <motion.h3
              key={`name-${activeMenuId}-${idx}`}
              className="mt-4 font-display text-3xl text-white md:text-5xl lg:text-6xl"
              style={{ lineHeight: 1.05 }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {dish.name}
            </motion.h3>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`note-${activeMenuId}-${idx}`}
              className="mt-5 max-w-xl font-display text-base italic leading-relaxed text-cream/85 md:text-xl"
              style={{ fontFamily: "var(--font-serif), 'Playfair Display', Georgia, serif" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              «{dish.chefNote}»
              <span className="mt-2 block font-sans text-[11px] not-italic uppercase tracking-[0.25em] text-gold/80">
                — шеф-пова́р
              </span>
            </motion.p>
          </AnimatePresence>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-2.5 font-mono text-xs font-bold text-white shadow-lg shadow-gold/25"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.45,
                duration: prefersReducedMotion ? 0.2 : 0.55,
                type: "spring",
                bounce: 0.4,
              }}
            >
              <Sparkles className="size-3" />
              {dish.price}
            </motion.span>

            {dishes.length > 1 && (
              <div className="flex items-center gap-2" role="group" aria-label="Фирменные блюда">
                {dishes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={i === idx}
                    aria-label={`Блюдо ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center px-1"
                  >
                    <span className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === idx
                        ? "w-10 bg-gold"
                        : "w-3 bg-cream/30 hover:bg-cream/60"
                    }`} />
                  </button>
                ))}
                {!prefersReducedMotion && (
                  <button
                    type="button"
                    onClick={() => setIdx(nextDishIdx)}
                    className="ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-4 py-2 text-[11px] uppercase tracking-wider text-cream/80 transition-colors hover:bg-cream/15 hover:text-cream"
                    aria-label="Следующее блюдо"
                  >
                    Дальше
                    <ArrowUpRight className="size-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Menu section — LIGHT THEME with elegant visual cards and enhanced package display
 * Inspired by Wolfgang Puck Catering, Pinch Food Design, and MyRadish
 */
export function Menu() {
  const [active, setActive] = useState(MENU_TYPES[0].id);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [dietary, setDietary] = useState<string[]>([]);
  const current = MENU_TYPES.find((m) => m.id === active) ?? MENU_TYPES[0];
  const priceUnit = current.priceUnit ?? "/guest";
  const prefersReducedMotion = useReducedMotion();

  const toggleDietary = (id: string) => {
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const select = (id: string) => {
    setActive(id);
    setExpandedPackage(null);
    window.dispatchEvent(new CustomEvent("catering:menu-select", { detail: id }));
  };

  const dispatchMenuSelect = (id: string) => {
    window.dispatchEvent(new CustomEvent("catering:menu-select", { detail: id }));
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadPdf = async (typeId: string) => {
    if (downloading !== null) return;
    setDownloading(typeId);
    try {
      await generateMenuPdf(typeId);
      const isCatalog = typeId === "all";
      const t = MENU_TYPES.find((m) => m.id === typeId);
      toast.success(isCatalog ? "Каталог скачан" : `Меню «${t?.label}» скачано`);
    } catch (e) {
      // Silently fail - user sees toast error above
      toast.error("Не удалось сгенерировать PDF. Попробуйте ещё раз.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section id="menu" data-header-theme="light" className="relative overflow-hidden bg-cream py-24 md:py-36">
      {/* Subtle decoration */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-l from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-terracotta/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Menu
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: 1 }}
              >
                Сезонные{"\u00A0"}
                <span className="gradient-text italic">меню</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 font-display italic text-lg text-ink/70 max-w-xl">
                Пакеты с реальными блюдами и реальными ценами. Скачайте PDF, чтобы поделиться с командой.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Visual Menu Type Cards - Enhanced Tabs */}
        <Reveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Типы меню"
            className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4"
          >
            {MENU_TYPES.map((m) => {
              const isActive = active === m.id;
              return (
                <button
                  key={m.id}
                  id={`tab-${m.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="menu-panel"
                  onClick={() => select(m.id)}
                  className={`group relative flex min-h-[72px] sm:min-h-[80px] w-[140px] sm:w-[160px] flex-col items-center overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                    isActive
                      ? "border-transparent shadow-xl shadow-gold/20 scale-[1.02]"
                      : "border-border-line/60 bg-white hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 hover:scale-[1.01]"
                  }`}
                >
                  {/* Gradient border for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, #D4A574 0%, #C17F59 50%, #E8B896 100%)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Glow effect for active state */}
                  {isActive && !prefersReducedMotion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: "radial-gradient(circle at center, rgba(212,165,116,0.25) 0%, transparent 70%)",
                        boxShadow: "0 0 30px rgba(212,165,116,0.3), 0 0 60px rgba(193,127,89,0.15)",
                      }}
                    />
                  )}

                  {/* Thumbnail image */}
                  <div className="relative h-16 w-full overflow-hidden sm:h-20">
                    <Image
                      src={MENU_TYPE_IMAGES[m.id] || "/media/concorde-handhelds.jpg"}
                      alt={m.label}
                      fill
                      sizes="160px"
                      className={`object-cover transition-transform duration-700 ${
                        isActive ? "scale-110 opacity-90" : "scale-100 opacity-70 group-hover:opacity-90 group-hover:scale-105"
                      }`}
                    />
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      isActive ? "bg-gradient-to-t from-black/70 via-black/20 to-transparent" : "bg-gradient-to-t from-black/60 via-black/30 to-transparent"
                    }`} />
                    
                    {/* Price badge on thumbnail */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2 py-0.5 shadow-sm">
                      <Sparkles className={`size-2.5 ${isActive ? "text-gold" : "text-ink/70"} transition-colors`} />
                      <span className={`font-mono text-[10px] font-bold leading-none ${isActive ? "text-ink" : "text-ink/70"}`}>
                        от {formatRUB(m.perGuest)}
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className={`flex w-full items-center justify-center px-2 pb-2 pt-1.5 transition-colors duration-300 ${
                    isActive ? "bg-white/95" : "bg-white/80 group-hover:bg-white/90"
                  }`}>
                    <span className={`font-display text-xs sm:text-sm font-medium leading-tight text-center transition-colors duration-300 ${
                      isActive ? "text-ink" : "text-ink/70 group-hover:text-ink"
                    }`}>
                      {m.label}
                    </span>
                  </div>

                  {/* Animated underline for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold to-terracotta"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Featured-dish spotlight block (Task 2-c §1) */}
        <Reveal delay={0.05}>
          <FeaturedSpotlight
            activeMenuId={current.id}
            prefersReducedMotion={prefersReducedMotion}
          />
        </Reveal>

        {/* Dietary filter chips (Task 2-c §1) */}
        <Reveal delay={0.1}>
          <div
            role="toolbar"
            aria-label="Фильтр по пищевым предпочтениям"
            className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3"
          >
            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/70">
              Фильтр:
            </span>
            {DIETARY_CHIPS.map(({ id, label, icon: Icon }) => {
              const pressed = dietary.includes(id);
              return (
                <Toggle
                  key={id}
                  pressed={pressed}
                  onPressedChange={() => toggleDietary(id)}
                  size="sm"
                  aria-label={`Фильтр: ${label}`}
                  className={`gap-1.5 inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                    pressed
                      ? "border-gold/40 bg-gold/15 text-ink shadow-sm shadow-gold/15"
                      : "border-border-line bg-white text-ink/70 hover:border-gold/30 hover:bg-gold/5 hover:text-ink"
                  }`}
                >
                  <Icon className={`size-3.5 ${pressed ? "text-gold" : "text-ink/70"}`} />
                  {label}
                </Toggle>
              );
            })}
            {dietary.length > 0 && (
              <button
                type="button"
                onClick={() => setDietary([])}
                className="ml-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink/70 underline-offset-4 transition-colors hover:text-bordeaux hover:underline"
              >
                Сбросить
              </button>
            )}
          </div>
        </Reveal>

        {/* Active menu context with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            id="menu-panel"
            role="tabpanel"
            aria-labelledby={`tab-${current.id}`}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24, scale: prefersReducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -16, scale: prefersReducedMotion ? 1 : 0.98 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.2 : 0.45, 
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: 0.4 }
            }}
            className="mt-10"
            layout
          >
            {/* Context line with enhanced styling */}
            <motion.div 
              className="mb-8 flex flex-wrap items-center justify-center gap-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-2 font-mono text-xs text-white shadow-md shadow-gold/25 overflow-hidden">
                {!prefersReducedMotion && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                  />
                )}
                <Sparkles className="size-3 relative z-10" />
                <span className="relative z-10">от {formatRUB(current.perGuest)} {priceUnit}</span>
              </span>
              <span className="rounded-full bg-ink/5 px-4 py-2 font-mono text-xs text-ink/70">
                мин. {current.minGuests} гостей
              </span>
              <span className="hidden text-ink/30 sm:inline">·</span>
              <span className="hidden max-w-xs text-xs text-ink/70 sm:inline">{current.short}</span>
            </motion.div>

            {/* Packages carousel/grid with enhanced cards */}
            <PackageCarousel 
              packages={current.packages} 
              current={current} 
              expandedPackage={expandedPackage} 
              setExpandedPackage={setExpandedPackage} 
              dispatchMenuSelect={dispatchMenuSelect} 
              priceUnit={priceUnit}
              prefersReducedMotion={prefersReducedMotion}
              dietary={dietary}
            />

            {/* Included in all packages */}
            <Reveal delay={0.3}>
              <div className="mt-8 rounded-2xl border border-border-line bg-white p-5 md:p-6 shadow-sm">
                <h4 className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gold font-medium">
                  <Check className="size-4" />
                  Входит во все пакеты
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {current.included.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-ink/70">
                      <Check className="size-4 shrink-0 text-gold" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* PDF download buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <motion.button
                onClick={() => downloadPdf(current.id)}
                disabled={downloading !== null}
                aria-busy={downloading === current.id}
                aria-label={`Скачать меню «${current.label}» в формате PDF`}
                whileHover={!prefersReducedMotion ? { scale: 1.03, y: -2 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-gold/25 transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm min-h-[48px]"
              >
                {!prefersReducedMotion && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
                {downloading === current.id ? (
                  <><Loader2 className="size-4 animate-spin relative z-10" /> Готовим PDF…</>
                ) : (
                  <><Download className="size-4 group-hover:animate-bounce relative z-10" /> Скачать меню</>
                )}
              </motion.button>
              <motion.button
                onClick={() => downloadPdf("all")}
                disabled={downloading !== null}
                aria-busy={downloading === "all"}
                aria-label="Скачать полный каталог всех меню в формате PDF"
                whileHover={!prefersReducedMotion ? { scale: 1.03, y: -2 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                className="group flex items-center gap-2 rounded-full border-2 border-border-line bg-white px-6 py-3 text-xs font-medium text-ink/70 transition-all hover:border-gold hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm min-h-[48px]"
              >
                {downloading === "all" ? (
                  <><Loader2 className="size-4 animate-spin" /> Готовим…</>
                ) : (
                  <><Download className="size-4 transition-transform group-hover:-translate-y-0.5" /> Полный каталог</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/**
 * Tilt card wrapper component for 3D hover effect
 */
function TiltCard({ 
  children, 
  className = "",
  prefersReducedMotion = false,
}: { 
  children: React.ReactNode; 
  className?: string;
  prefersReducedMotion?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 30,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  }, [mouseX, mouseY, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shimmer overlay component for shine effect on hover
 */
function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.1) 55%, transparent 65%)",
        }}
        whileHover={{
          translateX: ["-100%", "200%"],
          transition: { duration: 0.7, ease: "easeInOut" },
        }}
      />
    </motion.div>
  );
}

/**
 * Enhanced Price Badge with animation
 */
function PriceBadge({ price, unit }: { price: number; unit: string }) {
  return (
    <motion.span 
      className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-terracotta px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-lg shadow-gold/30 overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Animated shimmer background */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
      />
      
      <Sparkles className="size-3 relative z-10 animate-pulse" />
      <span className="relative z-10">от {formatRUB(price)}{unit}</span>
    </motion.span>
  );
}

/**
 * Package carousel component with enhanced visuals
 */
function PackageCarousel({
  packages,
  current,
  expandedPackage,
  setExpandedPackage,
  dispatchMenuSelect,
  priceUnit,
  prefersReducedMotion = false,
  dietary = [],
}: {
  packages: MenuType["packages"];
  current: MenuType;
  expandedPackage: string | null;
  setExpandedPackage: (v: string | null) => void;
  dispatchMenuSelect: (id: string) => void;
  priceUnit: string;
  prefersReducedMotion?: boolean;
  dietary?: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    
    // Mobile scroll hint animation
    if (!prefersReducedMotion && typeof window !== 'undefined' && window.innerWidth < 640 && el.scrollWidth > el.clientWidth) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const hint = Math.min(maxScroll * 0.25, 120);
      const start = Date.now();
      const dur = 1500;
      const tick = () => {
        const t = (Date.now() - start) / dur;
        if (t >= 1) { el.scrollTo({ left: 0, behavior: "smooth" }); return; }
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        el.scrollTo({ left: hint * eased, behavior: "auto" });
        requestAnimationFrame(tick);
      };
      const timer = setTimeout(() => requestAnimationFrame(tick), 600);
      return () => clearTimeout(timer);
    }
  }, [current.id, prefersReducedMotion]);

  const gridCols =
    packages.length === 2
      ? "md:grid-cols-2"
      : packages.length === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="relative">
      {/* Edge fades on mobile */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-cream via-cream to-transparent md:hidden" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-cream via-cream to-transparent md:hidden" />
      )}

      {/* Mobile scroll hint indicator */}
      {!prefersReducedMotion && canScrollRight && typeof window !== 'undefined' && window.innerWidth < 640 && (
        <motion.div 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex md:hidden"
          animate={{ x: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5 rotate-[-90deg] text-gold/60" />
        </motion.div>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className={`hide-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:gap-6 md:px-0 ${gridCols}`}
        style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}
      >
        {packages.map((pkg, idx) => {
          const isExpanded = expandedPackage === pkg.name;
          const hasDietary = dietary.length > 0;
          // When a dietary filter is active, show ALL matching dishes (no slicing).
          // Otherwise use the original 5-dish preview + expand-to-all behaviour.
          const filteredDishes: Dish[] = hasDietary
            ? pkg.dishes.filter((d) => {
                const tags = getDietaryTags(d.name);
                return dietary.every((req) => tags.includes(req));
              })
            : pkg.dishes;
          const showAll = isExpanded || packages.length === 1 || hasDietary;
          const visibleDishes = showAll
            ? filteredDishes
            : filteredDishes.slice(0, 5);
          const hiddenCount = hasDietary ? 0 : pkg.dishes.length - 5;
          const isPremium = idx === packages.length - 1 && packages.length >= 2;

          return (
            <TiltCard
              key={pkg.name}
              prefersReducedMotion={prefersReducedMotion}
              className={`relative flex w-[290px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-lg md:w-auto md:shrink transition-shadow duration-500 ${
                isPremium 
                  ? "border-gold/40 shadow-gold/15 ring-1 ring-gold/20" 
                  : "border-border-line/80 hover:shadow-xl hover:border-gold/30"
              }`}
            >
              {/* Shimmer overlay for premium feel */}
              {!prefersReducedMotion && <ShimmerOverlay />}
              
              {pkg.photo && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={pkg.photo}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 768px) 290px, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ transform: "scale(1)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                  
                  {/* Package info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <motion.span 
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gold"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                          {isPremium && <Sparkles className="size-2.5" />}
                          Пакет {idx + 1}
                        </motion.span>
                        <motion.h3 
                          className="mt-1.5 font-display text-xl text-white font-semibold leading-tight truncate"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + idx * 0.05 }}
                        >
                          {pkg.name}
                        </motion.h3>
                      </div>
                      
                      {/* Enhanced price badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05, type: "spring", bounce: 0.4 }}
                      >
                        <PriceBadge price={pkg.pricePerGuest} unit={priceUnit} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <motion.p 
                  className="text-sm leading-relaxed text-ink/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                >
                  {pkg.description}
                </motion.p>

                {/* Enhanced dish list with better hierarchy + popLayout animations */}
                <ul id={`dish-list-${idx}`} className="mt-4 space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {visibleDishes.map((d, i) => {
                      const tags = getDietaryTags(d.name);
                      return (
                        <motion.li
                          key={`${pkg.name}-${i}-${d.name.slice(0, 24)}`}
                          layout
                          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, x: -8 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            scale: prefersReducedMotion ? 1 : 0.95,
                            transition: { duration: prefersReducedMotion ? 0.15 : 0.25 },
                          }}
                          transition={{
                            duration: prefersReducedMotion ? 0.15 : 0.3,
                            delay: prefersReducedMotion ? 0 : i * 0.03 + 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          data-dietary={tags.join(" ") || undefined}
                          className="group/dish flex items-baseline gap-2.5 text-sm"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/10 font-mono text-[10px] font-bold text-gold transition-colors group-hover/dish:bg-gold/20">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-ink/80 leading-relaxed transition-colors group-hover/dish:text-ink">
                            {d.name}
                          </span>
                          {/* Dietary tag chips (shown only when filter is active) */}
                          {hasDietary && tags.length > 0 && (
                            <span className="flex shrink-0 items-center gap-1">
                              {tags.map((t) => {
                                const chip = DIETARY_CHIPS.find((c) => c.id === t);
                                if (!chip) return null;
                                const Icon = chip.icon;
                                return (
                                  <span
                                    key={t}
                                    className="inline-flex size-4 items-center justify-center rounded-full bg-sage/20 text-sage"
                                    aria-label={chip.label}
                                  >
                                    <Icon className="size-2.5" />
                                  </span>
                                );
                              })}
                            </span>
                          )}
                          {d.weight && (
                            <span className="shrink-0 rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[10px] text-ink/70 tabular-nums">
                              {d.weight}
                            </span>
                          )}
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {/* Empty-state when a dietary filter has 0 matches */}
                  {hasDietary && visibleDishes.length === 0 && (
                    <li
                      className="rounded-xl border border-dashed border-border-line bg-cream/40 px-4 py-6 text-center text-xs text-ink/70"
                      role="status"
                    >
                      В этом пакете нет блюд, соответствующих выбранным фильтрам.
                    </li>
                  )}
                </ul>

                {/* Expand/collapse button */}
                {hiddenCount > 0 && (
                  <motion.button
                    aria-expanded={isExpanded ? "true" : "false"}
                    aria-controls={`dish-list-${idx}`}
                    onClick={() => setExpandedPackage(isExpanded ? null : pkg.name)}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-gold/5 px-3 py-2.5 text-xs font-semibold text-gold transition-all hover:bg-gold/10 hover:text-terracotta min-h-[44px]"
                    whileHover={!prefersReducedMotion ? { scale: 1.02 } : undefined}
                    whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                  >
                    <span>{isExpanded ? "Свернуть" : `Показать ещё ${hiddenCount}`}</span>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="size-3.5" />
                    </motion.span>
                  </motion.button>
                )}

                {/* CTA button with enhanced styling */}
                <motion.button
                  onClick={() => dispatchMenuSelect(current.id)}
                  className="group mt-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-gold to-terracotta px-5 py-3 text-xs font-bold text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:shadow-gold/30 min-h-[48px]"
                  whileHover={!prefersReducedMotion ? { scale: 1.03, y: -2 } : undefined}
                  whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                >
                  <span>Рассчитать стоимость</span>
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
