"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { MuxCSSProperties } from "@mux/mux-player-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles, Play, UtensilsCrossed, Star } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { Magnetic } from "@/components/motion/magnetic";

/**
 * MuxPlayer loaded client-side only (web component, touches window).
 * Activates ONLY when MEDIA.hero.muxPlaybackId is set — otherwise the hero
 * uses a Ken Burns image (default, no Mux tokens required).
 */
const MuxPlayer = dynamic(
  () => import("@mux/mux-player-react").then((m) => m.default),
  { ssr: false, loading: () => null },
);

/**
 * Floating Particle — animated decorative element with physics-like movement
 */
function FloatingParticle({ 
  size, 
  x, 
  y, 
  color, 
  delay = 0,
  duration = 6 
}: { 
  size: number; 
  x: string; 
  y: string; 
  color: string;
  delay?: number;
  duration?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xFactor = (e.clientX / window.innerWidth - 0.5) * 2;
      const yFactor = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(xFactor * 30);
      mouseY.set(yFactor * 30);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <motion.div
      className="absolute rounded-full hidden lg:block"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        x: springX,
        y: springY,
        backgroundColor: color,
      }}
      animate={{ 
        y: [-15, 15, -15],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/**
 * Counter Animation — counts up from 0 to target value
 */
function AnimatedCounter({ 
  target, 
  suffix = "", 
  duration = 2,
  delay = 0 
}: { 
  target: number; 
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = target / (duration * 60);
      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
}

/**
 * RotatingWord — GG Catering signature: cycles an adjective in the headline.
 * Uses AnimatePresence mode="wait" so the outgoing word exits before the
 * next one enters. Respects prefers-reduced-motion (renders first word only).
 */
function RotatingWord({
  words,
  interval = 2600,
}: {
  words: string[];
  interval?: number;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || words.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [reduce, words.length, interval]);

  if (reduce) {
    return <span className="gradient-text italic">{words[0]}</span>;
  }

  return (
    <span className="relative inline-flex h-[1.1em] overflow-hidden align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          className="gradient-text italic"
          initial={{ opacity: 0, y: "0.5em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-0.5em" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Hero — full-bleed cinematic background (LIGHT THEME)
 * 
 * Redesigned with warm, inviting aesthetic inspired by MyRadish,
 * Ridgewells, and Wolfgang Puck catering websites.
 * 
 * Features:
 * - Premium AI-generated background image
 * - Letter-by-letter reveal animation on headline
 * - Parallax scroll exit effect with multiple layers
 * - Magnetic CTA buttons with glow effects
 * - Interactive floating particles that respond to mouse
 * - Animated trust counters
 * - Gold accent gradient CTAs
 * - Smooth Ken Burns background animation
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  // Multiple parallax layers for depth
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.6], [0, 12]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const yText = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const yParallax1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yParallax2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  const hasVideo = Boolean(MEDIA.hero.muxPlaybackId);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Split headline into letters for animation
  const headlineLetters = "Interfood".split("");

  return (
    <section
      id="home"
      ref={ref}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-cream"
    >
      {/* Background: Mux video OR Ken Burns image */}
      <motion.div 
        className="absolute inset-0" 
        style={{ scale: bgScale }}
      >
        {hasVideo ? (
          <MuxPlayer
            playbackId={MEDIA.hero.muxPlaybackId}
            streamType="on-demand"
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            } as MuxCSSProperties}
          />
        ) : (
          <Image
            src={MEDIA.hero.src}
            alt={MEDIA.hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover kenburns-slow"
          />
        )}
      </motion.div>

      {/* Multi-layer gradient overlay for legibility — warm cream tones */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: yParallax1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/60 to-cream/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/20 via-transparent to-cream/20" />
      </motion.div>
      
      {/* Warm tint overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-terracotta/5"
        style={{ y: yParallax2 }}
      />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(26,26,26,0.15) 100%)'
      }} />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain" />

      {/* Interactive floating particles — respond to mouse movement */}
      <FloatingParticle size={8} x="12%" y="25%" color="rgba(196,149,106,0.35)" delay={0} duration={5} />
      <FloatingParticle size={6} x="85%" y="35%" color="rgba(196,112,74,0.3)" delay={1} duration={7} />
      <FloatingParticle size={4} x="75%" y="60%" color="rgba(196,149,106,0.4)" delay={0.5} duration={6} />
      <FloatingParticle size={10} x="20%" y="70%" color="rgba(196,112,74,0.2)" delay={1.5} duration={8} />
      <FloatingParticle size={5} x="90%" y="75%" color="rgba(196,149,106,0.3)" delay={2} duration={5.5} />
      
      {/* Decorative line elements */}
      <motion.div 
        className="absolute top-[20%] right-[8%] w-16 h-px hidden lg:block"
        style={{ backgroundColor: 'rgba(196,149,106,0.4)' }}
        animate={{ scaleX: [0, 1, 0.5, 1], opacity: [0, 0.6, 0.4, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div 
        className="absolute bottom-[30%] left-[10%] w-24 h-px hidden lg:block"
        style={{ backgroundColor: 'rgba(196,112,74,0.35)' }}
        animate={{ scaleX: [0, 1, 0.7, 1], opacity: [0, 0.5, 0.3, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Main content container */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ scale, opacity, filter, y: yText }}
      >
        {/* Top badge with icon animation */}
        <motion.div
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-white/70 px-6 py-3 backdrop-blur-md shadow-lg shadow-gold/5"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30, scale: isLoaded ? 1 : 0.9 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ borderColor: "rgba(196,149,106,0.6)", boxShadow: "0 8px 32px rgba(196,149,106,0.15)" }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sparkles className="size-5 text-gold" />
          </motion.div>
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-ink/70 font-medium">
            Премиальный кейтеринг в Санкт-Петербурге
          </span>
          <Star className="size-3 text-gold/60" />
        </motion.div>

        {/* Headline — elegant serif with letter-by-letter reveal animation */}
        <motion.h1
          className="font-display text-ink relative"
          style={{
            fontSize: "clamp(2.5rem, 11vw, 8.5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            // View Transitions API — cross-fade the hero title across routes
            // (Ridgewells pattern). Progressive enhancement; no-op if unsupported.
            viewTransitionName: "hero-title" as React.CSSProperties["viewTransitionName"],
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="relative inline-block">
            {headlineLetters.map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block"
                aria-hidden="true"
                initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
                animate={{ 
                  clipPath: isLoaded ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", 
                  opacity: isLoaded ? 1 : 0 
                }}
                transition={{
                  delay: 0.6 + i * 0.04,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {letter}
              </motion.span>
            ))}
            
            {/* Underline animation */}
            <motion.span
              className="gradient-text absolute -bottom-2 left-0 h-1 rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isLoaded ? "100%" : 0, opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ 
                background: "linear-gradient(90deg, var(--gold), var(--terracotta))",
              }}
            />
          </span>
          
          <motion.span 
            className="gradient-text ml-3 inline-block"
            initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
            animate={{ 
              clipPath: isLoaded ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", 
              opacity: isLoaded ? 1 : 0 
            }}
            transition={{ delay: 1.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            .
          </motion.span>
        </motion.h1>

        {/* Subheadline — rotating adjective (GG Catering pattern) */}
        <motion.p
          className="mt-8 max-w-xl font-display text-lg italic text-ink/70 md:max-w-2xl md:text-xl lg:text-2xl leading-relaxed"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 25 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block">Еда как&nbsp;</span>
          <RotatingWord
            words={["искусство", "ритуал", "праздник", "магия"]}
            interval={2600}
          />
          <span>.</span>
          <span className="mt-2 block text-base not-italic text-ink/60 md:text-lg">
            Выездной кейтеринг полного цикла — от канапе до банкета на 500 гостей.
          </span>
        </motion.p>

        {/* CTA Buttons with magnetic & glow effects */}
        <motion.div
          className="mt-12 flex w-full max-w-md flex-col items-stretch gap-5 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 25 }}
          transition={{ delay: 1.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Magnetic strength={0.4} className="inline-flex">
            <a
              href="#calculator"
              data-cursor="считать"
              className="group relative pulse-glow inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-gold via-terracotta to-gold bg-[length:200%_100%] px-10 py-5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-gold/25 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/35 hover:-translate-y-1 hover:bg-right sm:text-base animate-background-shift"
            >
              <Sparkles className="size-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
              Рассчитать мероприятие
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
                }}
              />
            </a>
          </Magnetic>
          
          <Magnetic strength={0.3} className="inline-flex">
            <a
              href="#menu"
              data-cursor="меню"
              className="group relative inline-flex items-center justify-center gap-3 rounded-full border-2 border-ink/15 bg-white/80 px-10 py-5 text-sm font-semibold uppercase tracking-wider text-ink backdrop-blur-lg shadow-lg shadow-ink/5 transition-all duration-500 hover:border-gold/60 hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 sm:text-base"
            >
              <UtensilsCrossed className="size-4 transition-transform group-hover:rotate-45" />
              Смотреть меню
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" />
            </a>
          </Magnetic>
          
          {/* Play video button (if video available or for demo) */}
          <Magnetic strength={0.25} className="inline-flex lg:hidden">
            <button
              data-cursor="видео"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-6 py-5 text-sm font-medium uppercase tracking-wider text-gold backdrop-blur-sm transition-all duration-300 hover:bg-gold/20 hover:border-gold/50"
            >
              <Play className="size-4 fill-current" />
              Видео
            </button>
          </Magnetic>
        </motion.div>

        {/* Trust indicators with animated counters */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {[
            { value: 16, suffix: "+ лет", label: "опыта", color: "bg-sage" },
            { value: 2400, suffix: "+", label: "мероприятий", color: "bg-gold" },
            { value: 50000, suffix: "+", label: "гостей", color: "bg-terracotta" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 2.1 + i * 0.15, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="flex items-center gap-2 text-sm font-mono font-medium text-ink/80">
                <span className={`inline-block size-2 rounded-full ${stat.color}`} />
                <AnimatedCounter target={stat.value} suffix={stat.suffix} delay={2.2 + i * 0.15} />
              </span>
              <span className="text-xs uppercase tracking-wider text-ink/50 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Left-side chapter indicator — vertical, desktop only */}
      <motion.div
        aria-hidden="true"
        className="absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 -rotate-90 origin-center md:block lg:left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink whitespace-nowrap">
          01 / 08 — Главная
        </span>
      </motion.div>

      {/* Scroll cue — animated arrow with pulsing ring */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <motion.span 
          className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink/60 block"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Листайте вниз
        </motion.span>
        
        <motion.div className="relative">
          <motion.div
            className="flex items-center justify-center size-10 rounded-full border border-gold/30 bg-white/50 backdrop-blur-sm"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="size-4 text-gold/70" />
          </motion.div>
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-gold/30"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom-left mono caption with subtle animation */}
      <motion.div 
        className="absolute bottom-6 left-4 z-10 hidden font-mono text-xs uppercase tracking-wider text-ink/40 md:flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ delay: 2.7, duration: 0.8 }}
      >
        <motion.span 
          className="inline-block size-2 rounded-full bg-gold"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="flex items-center gap-3">
          <span>Фуршет</span>
          <span className="w-4 h-px bg-ink/20" />
          <span>Банкет</span>
          <span className="w-4 h-px bg-ink/20" />
          <span>Кофе-брейк</span>
          <span className="w-4 h-px bg-ink/20" />
          <span>Барбекю</span>
        </span>
      </motion.div>

      {/* Right side decorative element */}
      <motion.div
        className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 rotate-90 origin-center lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </motion.div>
    </section>
  );
}
