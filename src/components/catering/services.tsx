"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X, Check, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Reveal } from "./reveal";
import { SERVICES } from "@/lib/media";

// Photo per service (from MEDIA.menu / events)
const SERVICE_PHOTOS: Record<string, string> = {
  Heart: "/media/menu-banquet.jpg",
  Gem: "/media/event-04.jpg",
  Truck: "/media/event-09.jpg",
  UtensilsCrossed: "/media/event-03.jpg",
  ChefHat: "/media/event-10.jpg",
  Flower2: "/media/event-01.png",
  Cake: "/media/menu-coffee-break.jpg",
  Wine: "/media/event-11.jpg",
  PartyPopper: "/media/event-02.jpg",
  Droplets: "/media/menu-snack-box.jpg",
  Flame: "/media/event-06.jpg",
};

// Category tags for each service index
const SERVICE_CATEGORIES: Record<number, string[]> = {
  0: ["Свадьба", "Банкет"],
  1: ["Корпоратив", "Фуршет"],
  2: ["Кейтеринг", "Доставка"],
  3: ["Выезд", "Ресторан"],
  4: ["Шеф", "Гастрономия"],
  5: ["Декор", "Флористика"],
  6: ["Кофе-брейк", "Переговоры"],
  7: ["Бар", "Винная карта"],
  8: ["Праздник", "Детский"],
  9: ["Ланч", "Офис"],
  10: ["BBQ", "На природе"],
};

// Glow colors based on service mood
const GLOW_COLORS: string[] = [
  "rgba(196,149,106,0.25)", // Gold - Wedding
  "rgba(180,100,80,0.22)",  // Terracotta - Corporate
  "rgba(100,140,160,0.20)", // Steel Blue - Delivery
  "rgba(160,120,90,0.22)",  // Warm Brown - Restaurant
  "rgba(200,150,50,0.23)",  // Golden Yellow - Chef
  "rgba(180,130,170,0.20)", // Soft Purple - Decor
  "rgba(139,110,85,0.21)",  // Coffee - Coffee Break
  "rgba(128,60,70,0.22)",   // Wine Red - Bar
  "rgba(220,140,100,0.24)", // Peach - Party
  "rgba(120,145,130,0.19)", // Sage Green - Lunch
  "rgba(200,100,60,0.23)",  // Orange - BBQ
];

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Animated Number Badge — with count-up and style change on hover
 */
function AnimatedNumber({ 
  number, 
  total,
  isHovered 
}: { 
  number: number; 
  total: number;
  isHovered: boolean;
}) {
  const [displayNum, setDisplayNum] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || prefersReducedMotion()) {
      setDisplayNum(number);
      return;
    }
    
    const duration = 800;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth count-up
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(Math.round(eased * number));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hasAnimated.current = true;
      }
    };
    
    requestAnimationFrame(animate);
  }, [number]);

  return (
    <motion.span 
      className="absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.3em] px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-500"
      style={{
        color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)',
        backgroundColor: isHovered ? 'rgba(196,149,106,0.9)' : 'rgba(255,255,255,0.1)',
        borderColor: isHovered ? 'rgba(196,149,106,1)' : 'rgba(255,255,255,0.1)',
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {String(displayNum).padStart(2, "0")}
    </motion.span>
  );
}

/**
 * Category Tags Component — animated appearance on hover
 */
function CategoryTags({ 
  categories, 
  isHovered 
}: { 
  categories: string[]; 
  isHovered: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {categories.map((cat, i) => (
        <motion.span
          key={cat}
          className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border transition-colors duration-300"
          style={{
            color: isHovered ? 'rgba(196,149,106,1)' : 'rgba(255,255,255,0.5)',
            backgroundColor: isHovered ? 'rgba(196,149,106,0.15)' : 'rgba(255,255,255,0.08)',
            borderColor: isHovered ? 'rgba(196,149,106,0.4)' : 'rgba(255,255,255,0.12)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={isHovered ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.6, scale: 0.9, y: 0 }}
          transition={{ 
            delay: isHovered ? i * 0.06 : 0, 
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {cat}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Service Card Component — with enhanced 3D hover effects and animations.
 * Flips on click to reveal back face with full description + CTA.
 */
function ServiceCard({ 
  service, 
  index,
  onOpenModal,
  gridIndex,
  prefersReducedMotion = false,
}: { 
  service: typeof SERVICES[0]; 
  index: number;
  onOpenModal: () => void;
  gridIndex: number;
  prefersReducedMotion?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Mouse position tracking for 3D tilt — disabled when flipped to avoid jitter.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring-based rotation transforms (only used on the FRONT face — for the
  // 3D tilt on hover effect, NOT for the flip itself).
  const tiltRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const tiltRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });
  // The flip rotateY value — 0 (front) or 180 (back). useSpring is created
  // once on mount; we call .set() when `flipped` changes (see useEffect below)
  // so the spring animates to the new target instead of jumping.
  const flipRotateY = useSpring(0, {
    stiffness: 220,
    damping: 28,
    mass: 0.8,
  });
  useEffect(() => {
    flipRotateY.set(flipped ? 180 : 0);
  }, [flipped, flipRotateY]);
  // Compose: when flipped, ignore tilt (front-face tilt is irrelevant on the back face).
  // combinedRotateY = flip + (flipped ? 0 : tilt)
  const combinedRotateY = useTransform(
    [flipRotateY, tiltRotateY] as const,
    ([flip, tilt]: number[]) => flip + (flip > 90 ? 0 : tilt),
  );
  // combinedRotateX = flipped ? 0 : tilt
  const combinedRotateX = useTransform(
    [flipRotateY, tiltRotateX] as const,
    ([flip, rx]: number[]) => (flip > 90 ? 0 : rx),
  );

  // Directional overlay slide direction based on even/odd
  const slideDirection = index % 2 === 0 
    ? { initial: { x: '-100%' }, animate: { x: '0%' } }  // Even: slide from left
    : { initial: { x: '100%' }, animate: { x: '0%' } };   // Odd: slide from right

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current || flipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY, prefersReducedMotion, flipped]);

  const handleMouseEnter = () => {
    if (flipped) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleFrontClick = () => {
    if (prefersReducedMotion) {
      // Skip flip animation, go straight to modal for reduced-motion users.
      onOpenModal();
      return;
    }
    setFlipped(true);
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    // Clicking on the back-face "container" (not on a button) flips back.
    e.stopPropagation();
    setFlipped(false);
  };

  // Calculate diagonal entrance delay for wave pattern
  // Creates a diagonal sweep from top-left to bottom-right
  const col = gridIndex % 4; // 0-3 for 4 columns
  const row = Math.floor(gridIndex / 4);
  const diagonalDelay = (col + row) * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        delay: diagonalDelay, 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleFrontClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFrontClick();
          }
        }}
        data-cursor="подробнее"
        aria-label={`${service.title} — открыть описание`}
        aria-pressed={flipped}
        className="svc-flip-inner group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl bg-cream text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        style={{
          boxShadow: isHovered 
            ? `0 25px 60px -15px ${GLOW_COLORS[index % GLOW_COLORS.length]}, 0 0 40px -10px ${GLOW_COLORS[index % GLOW_COLORS.length]}`
            : "0 4px 20px -4px rgba(0,0,0,0.08)",
          transformStyle: "preserve-3d",
          rotateY: prefersReducedMotion ? 0 : combinedRotateY,
          rotateX: prefersReducedMotion ? 0 : combinedRotateX,
        }}
        whileHover={flipped ? undefined : { y: -16 }}
        transition={{ 
          duration: prefersReducedMotion ? 0.3 : 0.5, 
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* FRONT FACE — photo + title + icon + animated badges */}
        <div className="svc-flip-face absolute inset-0 overflow-hidden rounded-2xl">

        {/* Photo with smooth zoom on hover */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{ 
              scale: isHovered ? 1.12 : 1 
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1] // Ease-out cubic-bezier for smoother feel
            }}
          >
            <Image
              src={SERVICE_PHOTOS[service.icon] ?? "/media/event-02.jpg"}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 via-40% to-transparent" />
        
        {/* Directional sliding overlay on hover */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={false}
          animate={isHovered ? {
            background: `linear-gradient(${index % 2 === 0 ? '105deg' : '285deg'}, transparent 30%, rgba(196,149,106,0.12) 45%, transparent 60%)`,
          } : {
            background: 'transparent',
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Hover shimmer effect */}
        <motion.div 
          className="absolute inset-0"
          initial={false}
          animate={{ 
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 45%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>

        {/* Grain texture on hover */}
        <div className={`absolute inset-0 grain transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Animated Number Badge with count-up and style change */}
        <AnimatedNumber 
          number={index + 1} 
          total={SERVICES.length} 
          isHovered={isHovered}
        />

        {/* Index badge — top-right with gold accent on hover */}
        <motion.span 
          className="absolute right-4 top-4 rounded-full border bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-md transition-all duration-500"
          style={{
            borderColor: isHovered ? 'rgba(196,149,106,0.6)' : 'rgba(255,255,255,0.2)',
            backgroundColor: isHovered ? 'rgba(196,149,106,0.9)' : 'rgba(255,255,255,0.1)',
            color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.8)',
            boxShadow: isHovered ? '0 8px 24px rgba(196,149,106,0.3)' : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {index + 1} / {SERVICES.length}
        </motion.span>

        {/* Bottom content area */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          {/* Animated gold line — appears on hover with glow */}
          <motion.div 
            className="mb-3 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(to right, #c4956a, #c97c5c)',
              boxShadow: isHovered ? '0 0 8px rgba(196,149,106,0.5)' : 'none',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: diagonalDelay + 0.3, duration: 0.6 }}
          />
          
          {/* Title */}
          <h3 className="font-display text-xl leading-tight text-white sm:text-2xl transition-all duration-300 group-hover:text-white">
            {service.title}
          </h3>
          
          {/* Subtitle */}
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/60 sm:text-xs">
            {service.short}
          </p>
          
          {/* Animated Category Tags */}
          <CategoryTags 
            categories={SERVICE_CATEGORIES[index] || ['Услуга']} 
            isHovered={isHovered}
          />
          
          {/* CTA hint — slides up on hover */}
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gold opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            Подробнее
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            
            {/* Arrow line animation */}
            <motion.span
              className="ml-1 w-8 h-px bg-gold origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: diagonalDelay + 0.4, duration: 0.4 }}
            />
          </span>
        </div>

        {/* Corner decorations on hover with glow */}
        <div className={`absolute top-0 right-0 w-16 h-16 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-gold to-transparent" style={{ boxShadow: '0 0 6px rgba(196,149,106,0.5)' }} />
          <div className="absolute top-0 right-0 w-0.5 h-8 bg-gradient-to-b from-gold to-transparent" style={{ boxShadow: '0 0 6px rgba(196,149,106,0.5)' }} />
        </div>
        
        <div className={`absolute bottom-0 left-0 w-16 h-16 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-gold to-transparent" style={{ boxShadow: '0 0 6px rgba(196,149,106,0.5)' }} />
          <div className="absolute bottom-0 left-0 w-0.5 h-8 bg-gradient-to-t from-gold to-transparent" style={{ boxShadow: '0 0 6px rgba(196,149,106,0.5)' }} />
        </div>
        </div>
        {/* /FRONT FACE */}

        {/* BACK FACE — full description + CTA "Подробнее →" opens the modal */}
        <div
          className="svc-flip-face svc-flip-back absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-ink p-5 text-cream sm:p-6"
          onClick={handleBackClick}
        >
          {/* Soft gradient backdrop with gold glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 80% 0%, ${GLOW_COLORS[index % GLOW_COLORS.length]} 0%, transparent 55%)`,
            }}
          />
          {/* Decorative giant numeral */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-8 font-display text-[10rem] leading-none text-cream/[0.06]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="relative z-10 flex h-full flex-col">
            {/* Eyebrow */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                <Sparkles className="size-3" />
                Услуга {String(index + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-cream/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-cream/70"
                aria-hidden="true"
              >
                <RotateCcw className="size-3" />
                назад
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 font-display text-2xl leading-tight text-white sm:text-3xl">
              {service.title}
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cream/60">
              {service.short}
            </p>

            {/* Divider */}
            <div className="mt-4 h-px w-full origin-left bg-gradient-to-r from-gold via-terracotta/40 to-transparent" />

            {/* Full description */}
            <p className="mt-4 flex-1 overflow-y-auto text-sm leading-relaxed text-cream/80 pr-1">
              {service.desc}
            </p>

            {/* Feature chips */}
            <ul className="mt-4 grid grid-cols-2 gap-1.5">
              {service.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-1.5 text-[11px] leading-tight text-cream/75"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold"
                  >
                    <Check className="size-2.5" />
                  </span>
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA: opens the existing modal */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal();
                }}
                className="group/cta inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-transform hover:scale-[1.03] hover:shadow-xl hover:shadow-gold/30 active:scale-[0.98] min-h-[44px]"
              >
                Подробнее
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={handleBackClick}
                aria-label="Перевернуть карточку обратно"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-cream/25 bg-cream/5 text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream min-h-[44px] min-w-[44px]"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>
        </div>
        {/* /BACK FACE */}
      </motion.div>
    </motion.div>
  );
}

/**
 * Parallax Image Component — for modal image with mouse-tracking parallax
 */
function ParallaxImage({ 
  src, 
  alt,
  serviceNumber 
}: { 
  src: string; 
  alt: string;
  serviceNumber: number;
}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);
  
  // Spring-smoothed transforms
  const springConfig = { stiffness: 100, damping: 30 };
  const translateX = useSpring(imageX, springConfig);
  const translateY = useSpring(imageY, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion() || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * -15; // Max 15px movement
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    
    imageX.set(x);
    imageY.set(y);
  }, [imageX, imageY]);

  const handleMouseLeave = () => {
    imageX.set(0);
    imageY.set(0);
  };

  return (
    <div 
      ref={imageRef}
      className="relative aspect-square md:aspect-auto md:min-h-[450px] rounded-t-[2rem] sm:rounded-l-[2rem] sm:rounded-tr-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: translateX, y: translateY }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 42vw"
          className="object-cover"
        />
      </motion.div>
      
      {/* Gradient overlay on image */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent md:bg-gradient-to-r md:from-ink/20 md:to-transparent pointer-events-none" />
      
      {/* Service number overlay with subtle animation */}
      <motion.div 
        className="absolute bottom-6 left-6 font-display text-6xl text-white/20 font-bold"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {String(serviceNumber).padStart(2, "0")}
      </motion.div>
    </div>
  );
}

/**
 * Progress Indicator — shows current step in service details
 */
function ProgressIndicator({ 
  currentStep, 
  totalSteps 
}: { 
  currentStep: number; 
  totalSteps: number;
}) {
  const steps = ['Информация', 'Описание', 'Преимущества', 'Действие'];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= currentStep ? 'bg-gold' : 'bg-ink/20'
            }`}
            animate={i <= currentStep ? { scale: [1, 1.3, 1] } : {}}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
          <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${
            i <= currentStep ? 'text-gold' : 'text-ink/40'
          }`}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px mx-1 ${
              i < currentStep ? 'bg-gold/50' : 'bg-ink/15'
            }`} />
          )}
        </div>
      ))}
      
      {/* Progress bar for mobile */}
      <div className="sm:hidden flex-1 h-1 bg-ink/10 rounded-full overflow-hidden ml-2">
        <motion.div 
          className="h-full bg-gradient-to-r from-gold to-terracotta rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/**
 * Services section — LIGHT THEME with cinematic card animations
 * 
 * Inspired by Ridgewells, Creative Edge Parties, and Concept Catering:
 * - Image cards with dramatic 3D tilt & mood-based glow
 * - Gold accent badges with count-up animation and hover state change
 * - Smooth modal with parallax image and spring physics
 * - Diagonal wave entrance pattern for visual interest
 * - Animated category tags for service classification
 * - Progress indicator in modal for detail navigation
 */
export function Services() {
  const [open, setOpen] = useState<number | null>(null);
  const current = open !== null ? SERVICES[open] : null;
  const [modalStep, setModalStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  // Active service index for sticky TOC highlighting (set via IntersectionObserver).
  const [activeIdx, setActiveIdx] = useState<number>(0);
  // Refs to each card wrapper element so we can both observe them and scroll to them.
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Inject backface-visibility CSS once.
  const hasInjectedFlipStyle = useRef(false);

  useEffect(() => {
    if (hasInjectedFlipStyle.current) return;
    if (typeof document === "undefined") return;
    if (document.getElementById("svc-flip-style")) {
      hasInjectedFlipStyle.current = true;
      return;
    }
    const style = document.createElement("style");
    style.id = "svc-flip-style";
    style.textContent =
      ".svc-flip-inner { transform-style: preserve-3d; } .svc-flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; } .svc-flip-back { transform: rotateY(180deg); }";
    document.head.appendChild(style);
    hasInjectedFlipStyle.current = true;
  }, []);

  // Allow the header mega-menu to open a specific service modal by index.
  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (typeof idx === "number" && idx >= 0 && idx < SERVICES.length) {
        setOpen(idx);
        setModalStep(0); // Reset step when opening new service
      }
    };
    window.addEventListener("catering:service-open", handler as EventListener);
    return () =>
      window.removeEventListener("catering:service-open", handler as EventListener);
  }, []);

  // Animate modal step based on scroll position or time
  useEffect(() => {
    if (open === null) return;
    
    const interval = setInterval(() => {
      setModalStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);
    
    return () => clearInterval(interval);
  }, [open]);

  // IntersectionObserver: highlight the service card currently in the
  // middle band of the viewport. Updates `activeIdx`. SSR-safe guard.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const top = visible[0];
        const idx = Number((top.target as HTMLElement).dataset.serviceIdx);
        if (!Number.isNaN(idx)) setActiveIdx(idx);
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-30% 0px -30% 0px",
      },
    );
    cardRefs.current.forEach((el) => {
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const scrollToService = (i: number) => {
    const el = cardRefs.current[i];
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
    setActiveIdx(i);
  };

  return (
    <section id="services" data-header-theme="light" className="section-light relative overflow-hidden bg-white py-28 md:py-40">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-gold/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-terracotta/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            {/* Section label */}
            <Reveal>
              <motion.span 
                className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-gold bg-gradient-to-r from-gold/10 to-terracotta/10 px-5 py-2.5 rounded-full border border-gold/20"
                whileHover={{ borderColor: "rgba(196,149,106,0.4)", backgroundColor: "rgba(196,149,106,0.12)" }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={12} />
                </motion.span>
                Услуги
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              </motion.span>
            </Reveal>
            
            {/* Main headline */}
            <Reveal delay={0.1}>
              <motion.h2
                className="mt-6 font-display text-ink leading-[1.05]"
                style={{ fontSize: "clamp(2rem, 6vw, 4.25rem)" }}
              >
                {"Всё для события".split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-4"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.12, duration: 0.7 }}
                  >
                    {word}
                  </motion.span>
                ))}
                <br className="hidden sm:block" />
                <motion.span 
                  className="gradient-text italic inline-block mt-1"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  в одних руках
                </motion.span>
              </motion.h2>
            </Reveal>
          </div>
          
          {/* Description */}
          <Reveal delay={0.2}>
            <motion.p 
              className="max-w-xs font-display italic text-ink/55 text-base leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Одиннадцать направлений под ключ. Нажмите на карточку, чтобы узнать детали каждой услуги.
            </motion.p>
          </Reveal>
        </div>

        {/* Services layout: 4-col grid + sticky TOC right rail (lg+) */}
        <div className="mt-16 flex flex-col gap-10 lg:flex-row lg:gap-10">
          {/* Services grid — 4 columns with diagonal wave entrance */}
          <div className="flex-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-service-idx={i}
                className="relative"
              >
                <ServiceCard
                  service={s}
                  index={i}
                  gridIndex={i}
                  onOpenModal={() => setOpen(i)}
                  prefersReducedMotion={prefersReducedMotion ?? false}
                />
                {/* Highlight ring when this card is the active one (TOC sync) */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-[1.25rem] ring-2 ring-gold/50"
                  initial={false}
                  animate={{
                    opacity: activeIdx === i ? 1 : 0,
                    scale: activeIdx === i ? 1 : 0.97,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>

          {/* Sticky right-rail "Service index" (TOC) — lg+ only */}
          <aside
            aria-label="Индекс услуг"
            className="hidden lg:block lg:w-60 lg:shrink-0 lg:self-start lg:sticky lg:top-24"
          >
            <div className="rounded-2xl border border-border-line bg-cream/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                  Индекс
                </span>
                <span className="font-mono text-[10px] text-ink/40">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-3 h-px w-full origin-left bg-gradient-to-r from-gold/60 via-terracotta/30 to-transparent" />
              <ol className="mt-4 space-y-1">
                {SERVICES.map((s, i) => {
                  const isActive = activeIdx === i;
                  return (
                    <li key={s.title}>
                      <button
                        type="button"
                        onClick={() => scrollToService(i)}
                        aria-current={isActive ? "true" : undefined}
                        className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-gold/15 to-terracotta/10 text-ink"
                            : "hover:bg-cream/80 text-ink/65 hover:text-ink"
                        }`}
                      >
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-colors ${
                            isActive
                              ? "bg-gradient-to-r from-gold to-terracotta text-white"
                              : "bg-ink/5 text-ink/45 group-hover:bg-gold/15 group-hover:text-gold"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 truncate text-xs font-medium leading-tight">
                          {s.title}
                        </span>
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                            isActive
                              ? "scale-100 bg-gold shadow-[0_0_6px_rgba(196,149,106,0.6)]"
                              : "scale-0 bg-transparent"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 rounded-lg border border-dashed border-border-line bg-white/50 px-3 py-2 text-[11px] leading-snug text-ink/50">
                Нажмите на карточку, чтобы перевернуть. «Подробнее» откроет полное описание.
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Detail Modal (LIGHT THEME) — Enhanced with parallax and spring animation */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setOpen(null);
              setModalStep(0);
            }}
          >
            {/* Backdrop with blur */}
            <motion.div 
              className="absolute inset-0 bg-ink/60 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Modal content with enhanced spring animation */}
            <motion.div
              className="scroll-warm relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
              initial={{ 
                scale: 0.85, 
                opacity: 0, 
                y: 80, 
                borderRadius: "2rem",
                filter: "blur(10px)"
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                filter: "blur(0px)"
              }}
              exit={{ 
                scale: 0.92, 
                opacity: 0, 
                y: 40,
                filter: "blur(8px)"
              }}
              transition={{ 
                type: "spring", 
                damping: 28, 
                stiffness: 280,
                mass: 0.9,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button — enhanced with rotation */}
              <motion.button
                onClick={() => {
                  setOpen(null);
                  setModalStep(0);
                }}
                className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full bg-cream/90 text-ink/70 backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-gold hover:text-white"
                aria-label="Закрыть"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 90,
                  boxShadow: "0 8px 24px rgba(196,149,106,0.35)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="size-5" />
              </motion.button>

              {/* Two-column layout: image + content */}
              <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                {/* Parallax Image side */}
                <ParallaxImage 
                  src={SERVICE_PHOTOS[current.icon] ?? "/media/event-02.jpg"}
                  alt={current.title}
                  serviceNumber={(open ?? 0) + 1}
                />

                {/* Content side */}
                <div className="flex flex-col p-7 md:p-10">
                  {/* Breadcrumb */}
                  <motion.span 
                    className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-4 py-2 rounded-full border border-gold/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                  >
                    <Sparkles size={11} />
                    Услуга {(open ?? 0) + 1} из {SERVICES.length}
                  </motion.span>
                  
                  {/* Progress Indicator */}
                  <ProgressIndicator currentStep={modalStep} totalSteps={4} />
              
                  {/* Title */}
                  <motion.h3 
                    className="font-display text-3xl text-ink md:text-4xl leading-tight"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {current.title}
                  </motion.h3>
                  
                  {/* Subtitle */}
                  <motion.p 
                    className="mt-2 font-mono text-xs uppercase tracking-wider text-ink/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                  >
                    {current.short}
                  </motion.p>
                  
                  {/* Divider with gradient animation */}
                  <motion.div 
                    className="mt-6 h-px origin-left"
                    style={{
                      background: 'linear-gradient(to right, #c4956a, transparent)',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                  
                  {/* Description */}
                  <motion.p 
                    className="mt-6 text-base leading-relaxed text-ink/70"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                  >
                    {current.desc}
                  </motion.p>

                  {/* Features list with staggered animation */}
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {current.features.map((f, fIndex) => (
                      <motion.li 
                        key={f} 
                        className="flex items-center gap-3 text-sm text-ink/75"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.4 + fIndex * 0.07, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                      >
                        <motion.span 
                          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-terracotta/20 text-gold border border-gold/20"
                          whileHover={{ 
                            scale: 1.15,
                            backgroundColor: 'rgba(196,149,106,0.3)'
                          }}
                        >
                          <Check className="size-3.5" />
                        </motion.span>
                        {f}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA buttons with enhanced hover states */}
                  <div className="mt-auto flex flex-wrap gap-4 pt-10">
                    <motion.a
                      href="#calculator"
                      onClick={() => {
                        setOpen(null);
                        setModalStep(0);
                      }}
                      data-cursor="считать"
                      className="group pulse-glow flex flex-1 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold via-terracotta to-gold px-7 py-4 text-sm font-bold text-white shadow-lg shadow-gold/25 transition-all duration-300"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: "0 12px 32px rgba(196,149,106,0.4)"
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Рассчитать стоимость
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                    
                    <motion.a
                      href="#contact"
                      onClick={() => {
                        setOpen(null);
                        setModalStep(0);
                      }}
                      data-cursor="заявка"
                      className="flex items-center justify-center gap-2 rounded-full border-2 border-ink/15 px-7 py-4 text-sm font-medium text-ink transition-all duration-300 hover:border-gold/50 hover:bg-gold/5"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.03,
                        y: -2
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Задать вопрос
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
