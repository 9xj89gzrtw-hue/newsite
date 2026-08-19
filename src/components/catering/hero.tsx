"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles, Play, UtensilsCrossed, Star } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { Magnetic } from "@/components/motion/magnetic";

/**
 * Hero background — uses Ken Burns image by default.
 * When MEDIA.hero.videoSrc is set (direct CDN MP4 URL — Phase 6, no Mux),
 * hero swaps to <video autoplay muted loop> background.
 * Reduced-motion → always Ken Burns image (no video).
 *
 * Phase 5 had MuxPlayer support, but Mux API returned 404 for all endpoints
 * (credentials likely restricted). Removed in Phase 6 — replaced with simple
 * <video> element supporting any direct external MP4 URL.
 */

// ─── Scramble Characters Set ────────────────────────────────────────────────
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

/**
 * TextScramble — Premium glitch/scramble letter reveal effect
 * Inspired by Awwwards sites like Salza Catering.
 * Each letter cycles through random characters before resolving to its final form.
 */
function TextScramble({
  text,
  className,
  delay = 0,
  duration = 0.8,
  staggerDelay = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
}) {
  const [displayText, setDisplayText] = useState<string[]>(Array(text.length).fill(""));
  const [isComplete, setIsComplete] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setDisplayText(text.split(""));
      setIsComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      const chars = [...text];
      const result: string[] = Array(chars.length).fill("");
      
      chars.forEach((char, i) => {
        const frameCount = Math.floor(duration / 50); // ~20fps
        let frame = 0;
        
        const interval = setInterval(() => {
          frame++;
          if (frame >= frameCount) {
            result[i] = char;
            clearInterval(interval);
          } else {
            // Mix in some random characters with occasional correct character
            result[i] = Math.random() > 0.7 ? char : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          setDisplayText([...result]);
          
          // Check if all characters are resolved
          if (i === chars.length - 1 && frame >= frameCount) {
            setTimeout(() => setIsComplete(true), 100);
          }
        }, 50 + i * staggerDelay * 1000); // Stagger each letter
      });
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [text, delay, duration, staggerDelay, reduce]);

  return (
    <span 
      className={className}
      style={{ 
        opacity: isComplete ? 1 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {displayText.map((char, i) => (
        <span
          key={i}
          className="inline-block"
          aria-hidden="true"
          style={{
            color: isComplete || displayText[i] === text[i] ? "inherit" : "var(--gold)",
            textShadow: isComplete || displayText[i] === text[i] ? "none" : "0 0 10px rgba(196,149,106,0.5)",
            transform: isComplete ? "translateY(0)" : "translateY(-2px)",
            transition: "color 0.1s, text-shadow 0.1s, transform 0.15s ease-out",
          }}
        >
          {char || "\u00A0"}
        </span>
      ))}
    </span>
  );
}

/**
 * Floating Particle — animated decorative element with physics-like movement
 * Enhanced with deeper parallax integration
 */
function FloatingParticle({ 
  size, 
  x, 
  y, 
  color, 
  delay = 0,
  duration = 6,
  parallaxSpeed = 30,
}: { 
  size: number; 
  x: string; 
  y: string; 
  color: string;
  delay?: number;
  duration?: number;
  parallaxSpeed?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xFactor = (e.clientX / window.innerWidth - 0.5) * 2;
      const yFactor = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(xFactor * parallaxSpeed);
      mouseY.set(yFactor * parallaxSpeed);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, parallaxSpeed]);
  
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
        opacity: [0.25, 0.6, 0.25],
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
 * PremiumCTAButton — Enhanced CTA with ripple effect and improved styling
 */
function PremiumCTAButton({
  children,
  href,
  variant = "primary",
  cursorLabel,
  cursorImage,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "tertiary";
  cursorLabel?: string;
  // Phase 9: optional image URL shown in cursor ring on hover (wow-factor)
  cursorImage?: string;
  className?: string;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, []);

  const baseStyles = "group relative inline-flex items-center justify-center gap-3 rounded-full overflow-hidden transition-all duration-500";
  
  const variants = {
    primary: "bg-gradient-to-r from-gold via-terracotta to-gold bg-[length:200%_100%] px-10 py-5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-gold/25 hover:shadow-2xl hover:shadow-gold/35 hover:-translate-y-1 hover:bg-right sm:text-base animate-background-shift",
    secondary: "border-2 border-ink/15 bg-white/80 px-10 py-5 text-sm font-semibold uppercase tracking-wider text-ink backdrop-blur-lg shadow-lg shadow-ink/5 hover:border-gold/60 hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 sm:text-base",
    tertiary: "border border-gold/30 bg-gold/10 px-6 py-5 text-sm font-medium uppercase tracking-wider text-gold backdrop-blur-sm hover:bg-gold/20 hover:border-gold/50",
  };

  return (
    <Magnetic strength={variant === "primary" ? 0.5 : variant === "secondary" ? 0.35 : 0.25} className="inline-flex">
      <a
        ref={buttonRef}
        href={href}
        data-cursor={cursorLabel}
        data-cursor-image={cursorImage || undefined}
        onClick={handleClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            initial={{ 
              width: 0, 
              height: 0, 
              x: ripple.x, 
              y: ripple.y,
              opacity: 0.5,
              scale: 0,
            }}
            animate={{ 
              width: 300, 
              height: 300, 
              x: ripple.x - 150, 
              y: ripple.y - 150,
              opacity: 0,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: variant === "primary" 
                ? "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(196,149,106,0.3) 0%, transparent 70%)",
            }}
          />
        ))}
        
        {/* Hover glow overlay */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ 
            background: variant === "primary" 
              ? "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(196,149,106,0.08) 0%, transparent 70%)",
          }}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-3">
          {children}
        </span>
      </a>
    </Magnetic>
  );
}

/**
 * SignatureFlourish — Luxury brand signature element
 * Handwritten-style decorative flourish near the headline
 */
function SignatureFlourish({ isVisible }: { isVisible: boolean }) {
  return (
    <motion.div
      className="absolute -right-4 md:-right-12 lg:-right-16 top-0 md:-top-4 lg:-top-6 origin-left"
      initial={{ opacity: 0, scaleX: 0, rotate: -10 }}
      animate={{ 
        opacity: isVisible ? 0.7 : 0, 
        scaleX: isVisible ? 1 : 0, 
        rotate: isVisible ? -5 : -10 
      }}
      transition={{ delay: 1.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative SVG flourish */}
      <svg 
        width="120" 
        height="40" 
        viewBox="0 0 120 40" 
        fill="none" 
        className="w-16 h-6 md:w-24 md:h-10 lg:w-32 lg:h-12"
        style={{ overflow: "visible" }}
      >
        {/* Main elegant stroke */}
        <path
          d="M5 35 Q 20 5, 45 20 T 90 18 Q 105 17, 115 25"
          stroke="url(#signatureGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="drop-shadow-sm"
        />
        {/* Accent loop */}
        <path
          d="M85 18 Q 95 8, 88 28 Q 82 38, 92 30"
          stroke="url(#signatureGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* Small dot accent */}
        <circle cx="112" cy="26" r="2" fill="var(--gold)" opacity="0.6" />
        
        <defs>
          <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="50%" stopColor="var(--terracotta)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Est. text */}
      <motion.span
        className="absolute -bottom-1 right-0 font-serif italic text-xs text-gold/60 whitespace-nowrap hidden sm:block"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 10 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        est. 2008
      </motion.span>
    </motion.div>
  );
}

/**
 * ScrollProgressIndicator — Subtle horizontal line that fills as user scrolls
 * Positioned at the very top of the hero section
 */
function ScrollProgressIndicator({ scrollProgress }: { scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const scaleX = useTransform(scrollProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 right-0 h-[2px] z-50 bg-ink/5"
    >
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX,
          opacity,
          background: "linear-gradient(90deg, var(--gold), var(--terracotta))",
        }}
      />
    </div>
  );
}

/**
 * Hero — full-bleed cinematic background (LIGHT THEME)
 * 
 * Redesigned with warm, inviting aesthetic inspired by MyRadish,
 * Ridgewells, Wolfgang Puck, Salza Catering, and Gamma Catering websites.
 * 
 * Features:
 * - Premium AI-generated or video background
 * - Text scramble/reveal animation on headline (Awwwards-style)
 * - Enhanced parallax scroll exit effect with multiple depth layers
 * - Premium CTA buttons with magnetic pull & ripple effects
 * - Scroll progress indicator (Salza pattern)
 * - Interactive floating particles that respond to mouse
 * - Luxury signature/flourish element
 * - Animated trust counters
 * - Gold accent gradient CTAs
 * - Smooth Ken Burns background animation
 * - Full mobile responsiveness with graceful degradation
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Page-level scroll for progress indicator
  const { scrollYProgress: pageScrollProgress } = useScroll();
  
  // Section-level scroll for parallax effects
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  // Multiple parallax layers for depth — enhanced with more layers.
  // Kinetic oversized type scale: headline enters at 1.15 and settles to 0.92
  // over the first 60% of scroll, then holds (creates a "cinematic zoom-out"
  // feel as the user descends into the page).
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.15, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Chapter palette-shift hand-off: charcoal (bg-ink) overlay fades in at the
  // very end of the hero scroll (0.85 → 1.0), blending the light hero surface
  // into the next dark section. Uses opacity only (RULES §5 compliant) —
 // stacked-overlay pattern per AGENTS.md §12 грабли #4, NOT backgroundColor interpolation.
  const chapterShiftOpacity = useTransform(scrollYProgress, [0.85, 1.0], [0, 0.6]);
  const blur = useTransform(scrollYProgress, [0, 0.6], [0, 12]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const yText = useTransform(scrollYProgress, [0, 0.8], [0, -120]); // Increased parallax distance
  
  // Background layer scales up on scroll (Ken Burns reverse)
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.3]);
  
  // Multi-depth parallax layers
  const yParallaxFar = useTransform(scrollYProgress, [0, 1], [0, -30]);   // Far layer (slowest)
  const yParallaxMid = useTransform(scrollYProgress, [0, 1], [0, -70]);   // Mid layer
  const yParallaxNear = useTransform(scrollYProgress, [0, 1], [0, -120]); // Near layer (fastest)
  const yParallaxForeground = useTransform(scrollYProgress, [0, 1], [0, -180]); // Foreground elements
  
  // Rotation for subtle 3D tilt effect on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.8], [0, 3]);
  
  const hasVideo = Boolean(MEDIA.hero.videoSrc);
  const prefersReducedMotion = useReducedMotion();
  // Show video only when: videoSrc is set AND user hasn't requested reduced motion.
  // (Reduced-motion users get the Ken Burns image — videos can be vestibular triggers.)
  const showVideo = hasVideo && !prefersReducedMotion;

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      ref={ref}
      data-header-theme="transparent"
      className="section-light relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-cream"
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator scrollProgress={pageScrollProgress} />

      {/* Background: external MP4 video OR Ken Burns image (Phase 6 — no Mux) */}
      <motion.div 
        className="absolute inset-0" 
        style={{ scale: bgScale }}
      >
        {showVideo ? (
          // Direct external MP4 video — supports any CDN URL (Pexels, Mixkit, etc.).
          // Autoplay muted loop (browser autoplay policy compliant). Poster = hero image
          // shows before video loads. Reduced-motion users see Ken Burns image (above check).
          <video
            src={MEDIA.hero.videoSrc}
            poster={MEDIA.hero.src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover"
            aria-label={MEDIA.hero.alt}
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

      {/* Multi-layer gradient overlays for legibility — enhanced depth */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: yParallaxFar }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cream/85 via-cream/65 to-cream/88" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/25 via-transparent to-cream/25" />
      </motion.div>
      
      {/* Warm tint overlay — mid parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-gold/12 via-transparent to-terracotta/8"
        style={{ y: yParallaxMid }}
      />
      
      {/* Additional depth layer — near parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: yParallaxNear }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink/5 via-transparent to-transparent" />
      </motion.div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(26,26,26,0.18) 100%)'
      }} />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain" />

      {/* Interactive floating particles — respond to mouse movement with varied depths */}
      <FloatingParticle size={8} x="12%" y="25%" color="rgba(196,149,106,0.35)" delay={0} duration={5} parallaxSpeed={25} />
      <FloatingParticle size={6} x="85%" y="35%" color="rgba(196,112,74,0.3)" delay={1} duration={7} parallaxSpeed={35} />
      <FloatingParticle size={4} x="75%" y="60%" color="rgba(196,149,106,0.4)" delay={0.5} duration={6} parallaxSpeed={20} />
      <FloatingParticle size={10} x="20%" y="70%" color="rgba(196,112,74,0.2)" delay={1.5} duration={8} parallaxSpeed={40} />
      <FloatingParticle size={5} x="90%" y="75%" color="rgba(196,149,106,0.3)" delay={2} duration={5.5} parallaxSpeed={28} />
      <FloatingParticle size={3} x="45%" y="15%" color="rgba(196,149,106,0.25)" delay={0.8} duration={6.5} parallaxSpeed={22} /> {/* New particle */}
      
      {/* Decorative line elements — enhanced with parallax */}
      <motion.div 
        className="absolute top-[20%] right-[8%] w-16 h-px hidden lg:block"
        style={{ 
          backgroundColor: 'rgba(196,149,106,0.4)',
          y: yParallaxMid,
        }}
        animate={{ scaleX: [0, 1, 0.5, 1], opacity: [0, 0.6, 0.4, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div 
        className="absolute bottom-[30%] left-[10%] w-24 h-px hidden lg:block"
        style={{ 
          backgroundColor: 'rgba(196,112,74,0.35)',
          y: yParallaxNear,
        }}
        animate={{ scaleX: [0, 1, 0.7, 1], opacity: [0, 0.5, 0.3, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* New: Corner bracket decorations for luxury feel */}
      <motion.div 
        className="absolute top-8 left-8 w-12 h-12 hidden lg:block opacity-20"
        style={{ y: yParallaxForeground }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M0 0 L0 48 L2 46 L2 2 L46 2 L48 0 Z" fill="url(#cornerGrad)" />
          <defs>
            <linearGradient id="cornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--terracotta)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <motion.div 
        className="absolute bottom-8 right-8 w-12 h-12 hidden lg:block opacity-20"
        style={{ y: yParallaxForeground }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M48 48 L48 0 L46 2 L46 46 L2 46 L0 48 Z" fill="url(#cornerGrad2)" />
          <defs>
            <linearGradient id="cornerGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--terracotta)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Main content container with enhanced parallax */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ 
          scale, 
          opacity, 
          filter, 
          y: yText,
          rotateX,
          transformPerspective: 800,
        }}
      >
        {/* Top badge with icon animation */}
        <motion.div
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-white/70 px-6 py-3 backdrop-blur-md shadow-lg shadow-gold/5"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30, scale: isLoaded ? 1 : 0.9 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ borderColor: "rgba(196,149,106,0.6)", boxShadow: "0 8px 32px rgba(196,149,106,0.15)", scale: 1.02 }}
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

        {/* Headline — elegant serif with text scramble animation */}
        <motion.h1
          className="font-display text-ink relative"
          style={{
            fontSize: "clamp(2.5rem, 11vw, 8.5rem)",
            lineHeight: 0.95,
            // Tighter headline tracking — Playfair Display looks more cinematic
            // at -0.04em; pairs with the kinetic scale for the oversized-type effect.
            letterSpacing: "-0.04em",
            viewTransitionName: "hero-title" as React.CSSProperties["viewTransitionName"],
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span className="relative inline-block">
            {/* Text Scramble Effect for "Interfood" */}
            <TextScramble
              text="Interfood"
              delay={0.6}
              duration={0.9}
              staggerDelay={0.06}
            />
            
            {/* Underline animation */}
            <motion.span
              className="gradient-text absolute -bottom-2 left-0 h-1 rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isLoaded ? "100%" : 0, opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: 2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ 
                background: "linear-gradient(90deg, var(--gold), var(--terracotta))",
              }}
            />
            
            {/* Signature Flourish Element */}
            <SignatureFlourish isVisible={isLoaded} />
          </span>
          
          <motion.span 
            className="gradient-text ml-3 inline-block"
            initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
            animate={{ 
              clipPath: isLoaded ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", 
              opacity: isLoaded ? 1 : 0 
            }}
            transition={{ delay: 1.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            est. 2008
          </motion.span>
        </motion.h1>

        {/* Subheadline — rotating adjective (GG Catering pattern) */}
        <motion.p
          className="mt-8 max-w-xl font-display text-lg italic text-ink/70 md:max-w-2xl md:text-xl lg:text-2xl leading-relaxed"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 25 }}
          transition={{ delay: 1.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
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

        {/* CTA Buttons with enhanced magnetic & ripple effects */}
        <motion.div
          className="mt-12 flex w-full max-w-md flex-col items-stretch gap-5 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 25 }}
          transition={{ delay: 1.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <PremiumCTAButton 
            href="#calculator" 
            variant="primary"
            cursorLabel="считать"
          >
            <Sparkles className="size-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            Рассчитать мероприятие
          </PremiumCTAButton>
          
          <PremiumCTAButton 
            href="#menu" 
            variant="secondary"
            cursorLabel="меню"
            // Phase 9: show real catering dish photo on cursor hover — wow-factor.
            // Uses concorde-boardroom (BoardroomTableTop) which is a banquet table.
            cursorImage="/media/concorde-boardroom.webp"
          >
            <UtensilsCrossed className="size-4 transition-transform group-hover:rotate-45" />
            Смотреть меню
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" />
          </PremiumCTAButton>
          
          {/* Play video button (if video available or for demo) */}
          <PremiumCTAButton 
            href="#video" 
            variant="tertiary"
            cursorLabel="видео"
            className="inline-flex lg:hidden"
          >
            <Play className="size-4 fill-current" />
            Видео
          </PremiumCTAButton>
        </motion.div>

        {/* Trust indicators with animated counters */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 2.1, duration: 1 }}
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
              transition={{ delay: 2.2 + i * 0.15, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -3 }}
            >
              <span className="flex items-center gap-2 text-sm font-mono font-medium text-ink/80">
                <span className={`inline-block size-2 rounded-full ${stat.color}`} />
                <AnimatedCounter target={stat.value} suffix={stat.suffix} delay={2.3 + i * 0.15} />
              </span>
              <span className="text-xs uppercase tracking-wider text-ink/50 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Left-side chapter indicator — vertical, desktop only.
          Uses writing-mode: vertical-rl (per design spec) for true vertical text
          instead of -rotate-90 hack. Text reads top-to-bottom along the left edge. */}
      <motion.div
        aria-hidden="true"
        className="absolute left-8 top-1/2 z-10 hidden -translate-y-1/2 md:block lg:left-8"
        style={{
          y: yParallaxForeground,
          writingMode: "vertical-rl" as React.CSSProperties["writingMode"],
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ delay: 2.6, duration: 0.8 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink whitespace-nowrap">
          01 — ГЛАВНАЯ
        </span>
      </motion.div>

      {/* Scroll cue — animated arrow with pulsing ring */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ y: yParallaxForeground }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 2.6, duration: 0.8 }}
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
        style={{ y: yParallaxNear }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ delay: 2.8, duration: 0.8 }}
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
        style={{ y: yParallaxMid }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 3.1, duration: 1 }}
      >
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </motion.div>

      {/* Chapter palette-shift hand-off: charcoal overlay that fades in at the
          very end of the hero scroll (0.85 → 1.0). Sits below content (z-0) so
          the headline + CTAs remain legible above it; bg-ink at 0.6 opacity
          visually bridges the light hero into the next dark section. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-ink"
        style={{ opacity: chapterShiftOpacity }}
      />
    </section>
  );
}
