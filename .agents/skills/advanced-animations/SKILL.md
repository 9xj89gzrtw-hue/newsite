# Advanced Animations Skill

> Библиотека продвинутых анимаций для премиального кейтеринг-сайта.
> Основана на анализе top-32 мировых кейтеринг-брендов (Pinch, Wolfgang Puck, Ridgewells, etc.)
> **Обновлено**: Добавлены паттерны из анализа 23 дополнительных world-class сайтов

## Когда использовать

- При создании новых анимированных секций
- При улучшении существующих анимаций
- При добавлении scroll-triggered эффектов
- При работе с GSAP/Motion/Framer Motion
- При реализации page transitions и view transitions
- При создании интерактивных counter/marquee компонентов

## Core Animation Patterns (извлечено из эталонов)

### 1. Hero Cinematic Entrance (Wolfgang Puck / Pinch style)

```tsx
// components/motion/hero-cinematic.tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function HeroCinematic({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax layers
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity, scale }}
      className="relative min-h-screen overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

// Letter-by-letter reveal animation
export function AnimatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className ?? ''}`}
      variants={container}
      initial='hidden'
      animate='visible'
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className='mr-2'
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
```

### 2. Magnetic Button Effect (Pinch "Book Now" style)

```tsx
// components/motion/magnetic-button.tsx
'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className,
  strength = 40,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative ${className ?? ''}`}
      whileTap={{ scale: 0.97 }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className='absolute inset-0 rounded-inherit'
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered
            ? '0 0 40px rgba(209, 26, 70, 0.3)'
            : '0 0 0px transparent',
        }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.button>
  );
}
```

### 3. Scroll-Triggered Reveals (GSAP ScrollTrigger style)

```tsx
// components/motion/scroll-reveal.tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-up' | 'blur-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

const variantMap: Record<RevealVariant, { hidden: object; visible: object }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-up': {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  'blur-in': {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  threshold = 0.2,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  const selectedVariant = variantMap[variant];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={controls}
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered children reveal
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 4. Parallax Layers (M Culinary style)

```tsx
// components/motion/parallax-layers.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // 0 = static, 1 = normal, 2 = 2x speed
  className?: string;
  direction?: 'up' | 'down';
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  className,
  direction = 'up',
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Direction determines movement direction
  const multiplier = direction === 'up' ? -1 : 1;
  const range = 100 * speed * multiplier;

  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.div style={{ y }} className='h-full w-full'>
        {children}
      </motion.div>
    </div>
  );
}

// Multi-layer parallax section
interface ParallaxSectionProps {
  layers: Array<{
    component: React.ReactNode;
    speed: number;
    className?: string;
  }>;
  className?: string;
  height?: string;
}

export function ParallaxSection({ layers, className, height = '100vh' }: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className={`relative ${className}`} style={{ height }}>
      {layers.map((layer, index) => (
        <ParallaxLayer key={index} speed={layer.speed} className={layer.className}>
          {layer.component}
        </ParallaxLayer>
      ))}
    </section>
  );
}
```

### 5. Animated Counters (Pinch Live Stats style)

```tsx
// components/motion/animated-counter.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView, motion } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  label?: string;
}

export function AnimatedCounter({
  target,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  label,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-expo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(eased * target);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  const formatNumber = (num: number) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <div className={`text-center ${className ?? ''}`}>
      <motion.span
        ref={ref}
        className='block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {prefix}{formatNumber(count)}{suffix}
      </motion.span>
      {label && (
        <span className='mt-2 block text-sm uppercase tracking-widest text-muted'>
          {label}
        </span>
      )}
    </div>
  );
}

// Stats section component
interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export function AnimatedStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16'>
      {stats.map((stat, index) => (
        <AnimatedCounter
          key={index}
          target={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          label={stat.label}
          delay={index * 200}
        />
      ))}
    </div>
  );
}
```

### 6. Custom Cursor (Premium trend)

```tsx
// components/motion/custom-cursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Trailing ring with more lag
  const ringX = useSpring(cursorX, { damping: 20, stiffness: 100 });
  const ringY = useSpring(cursorY, { damping: 20, stiffness: 100 });

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.dataset.cursor === 'pointer'
      ) {
        setIsPointer(true);
      }

      if (target.dataset.cursor === 'hover') {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsPointer(false);
      setIsHovering(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main dot */}
      <motion.div
        className='fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference'
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className='rounded-full bg-white'
          animate={{
            width: isPointer ? 48 : isHovering ? 64 : 12,
            height: isPointer ? 48 : isHovering ? 64 : 12,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            marginLeft: isPointer ? -24 : isHovering ? -32 : -6,
            marginTop: isPointer ? -24 : isHovering ? -32 : -6,
          }}
        />
      </motion.div>

      {/* Trailing ring */}
      <motion.div
        className='fixed top-0 left-0 pointer-events-none z-[9998]'
        style={{
          x: ringX,
          y: ringY,
        }}
      >
        <motion.div
          className='rounded-full border border-current'
          animate={{
            width: isHovering ? 80 : 40,
            height: isHovering ? 80 : 40,
            opacity: isHovering ? 0.5 : 0.3,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{
            marginLeft: isHovering ? -40 : -20,
            marginTop: isHovering ? -40 : -20,
          }}
        />
      </motion.div>
    </>
  );
}
```

### 7. Smooth Page Transitions

```tsx
// components/motion/page-transition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={pathname}
        initial='initial'
        animate='in'
        exit='out'
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Layout wrapper for transitions
export function TransitionLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
```

### 8. Text Scramble Effect (Cyberpunk/Premium style)

```tsx
// components/motion/text-scramble.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export function TextScramble({
  text,
  className,
  trigger = true,
}: {
  text: string;
  className?: string;
  trigger?: boolean;
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(textRef.current);
      return;
    }

    let iteration = 0;
    const totalIterations = 15;

    clearInterval(intervalRef.current!);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        textRef.current
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (iteration > index + 5) return textRef.current[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration++;

      if (iteration >= totalIterations + textRef.current.length) {
        clearInterval(intervalRef.current!);
        setDisplayText(textRef.current);
      }
    }, 35);

    return () => {
      clearInterval(intervalRef.current!);
    };
  }, [trigger]);

  return <span className={className}>{displayText}</span>;
}
```

## GSAP Integration (для сложных сценариев)

```tsx
// lib/gsap-utils.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Pin and parallax section (Manifesto-style)
export function createPinnedSection(
  selector: string,
  options?: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pinSpacing?: boolean;
  }
) {
  gsap.to(selector, {
    scrollTrigger: {
      trigger: selector,
      start: options?.start ?? 'top top',
      end: options?.end ?? 'bottom top',
      pin: true,
      scrub: options?.scrub ?? 1,
      pinSpacing: options?.pinSpacing ?? false,
    },
  });
}

// Text color progression on scroll
export function createTextColorReveal(
  wordsSelector: string,
  options?: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  }
) {
  const words = document.querySelectorAll(wordsSelector);

  words.forEach((word, index) => {
    gsap.fromTo(
      word,
      { color: 'rgba(255, 255, 255, 0.14)' },
      {
        color: 'rgba(252, 251, 248, 1)',
        scrollTrigger: {
          trigger: options?.trigger ?? wordsSelector,
          start: options?.start ?? 'top 80%',
          end: options?.end ?? 'bottom 20%',
          scrub: options?.scrub ?? true,
          containerAnimation: gsap.to(wordsSelector, {}),
        },
      }
    );
  });
}

// Horizontal scroll section
export function createHorizontalScroll(
  containerSelector: string,
  itemsSelector: string
) {
  const container = document.querySelector(containerSelector);
  const items = document.querySelectorAll(itemsSelector);

  if (!container || !items.length) return;

  const scrollWidth = items[items.length - 1].getBoundingClientRect().right -
    container.getBoundingClientRect().left;

  gsap.to(items, {
    x: () => -(scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: containerSelector,
      start: 'top top',
      end: () => `+=${scrollWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });
}
```

## CSS Animation Utilities (globals.css additions)

```css
/* ===== PREMIUM ANIMATION UTILITIES ===== */

/* Keyframes */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(209, 26, 70, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(209, 26, 70, 0.6);
  }
}

@keyframes draw-line {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Utility classes */
.animate-fade-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-fade-down {
  animation: fade-in-down 0.6s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.5 ease-out forwards;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-draw-line {
  position: relative;
}

.animate-draw-line::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 1px;
  background: currentColor;
  animation: draw-line 1s ease-out forwards;
}

.animate-rotate-slow {
  animation: rotate-slow 20s linear infinite;
}

/* Stagger delays */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hover-glow:hover {
  box-shadow: 0 0 30px rgba(209, 26, 70, 0.3);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🆕 New Patterns (from 23-site analysis)

### View Transitions API (Ridgewells pattern)

> Cutting-edge native browser API for smooth page transitions without JavaScript routing hacks.
> Works with Next.js App Router for seamless SPA-like navigation.

```tsx
// components/motion/view-transitions.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * View Transitions API integration for Next.js
 * 
 * Features:
 * - Automatic fade transitions between pages
 * - Cross-fade or slide animations
 * - Browser-native performance optimization
 * - Fallback for unsupported browsers
 */

type TransitionType = 'fade' | 'slide-left' | 'slide-up' | 'morph';

interface ViewTransitionProviderProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number;
}

export function ViewTransitionProvider({
  children,
  transitionType = 'fade',
  duration = 300,
}: ViewTransitionProviderProps) {
  const pathname = usePathname();
  const [supportsViewTransitions, setSupportsViewTransitions] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    // Check browser support
    setSupportsViewTransitions('startViewTransition' in document);
  }, []);

  useEffect(() => {
    // Skip if same path or no support
    if (pathname === prevPathname || !supportsViewTransitions) {
      setPrevPathname(pathname);
      return;
    }

    const transition = (document as any).startViewTransition?.(() => {
      setPrevPathname(pathname);
    });

    if (transition) {
      transition.finished.then(() => {
        setPrevPathname(pathname);
      });
    } else {
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname, supportsViewTransitions]);

  return <>{children}</>;
}

// CSS for View Transitions (add to globals.css)
/*
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: view-fade-out var(--view-transition-duration, 0.3s) ease-out;
}

::view-transition-new(root) {
  animation: view-fade-in var(--view-transition-duration, 0.3s) ease-in;
}

@keyframes view-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes view-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Slide variant
@media (view-transition-type: slide-left) {
  ::view-transition-old(root) {
    animation: slide-out-left 0.3s ease-out;
  }
  ::view-transition-new(root) {
    animation: slide-in-right 0.3s ease-out;
  }
}

@keyframes slide-out-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
*/

// Hook for programmatic view transitions
export function useViewTransition() {
  const navigateWithTransition = async (href: string) => {
    if ('startViewTransition' in document) {
      const transition = (document as any).startViewTransition(() => {
        window.location.href = href;
      });
      await transition.finished;
    } else {
      window.location.href = href;
    }
  };

  return { navigateWithTransition };
}
```

**Usage Example:**
```tsx
// app/layout.tsx
import { ViewTransitionProvider } from '@/components/motion/view-transitions';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ViewTransitionProvider transitionType="fade" duration={300}>
          {children}
        </ViewTransitionProvider>
      </body>
    </html>
  );
}
```

---

### Enhanced Stats & Counter Animations (Creative Edge pattern)

> Advanced count-up animations with spring physics, viewport triggering, and formatting options.
> Perfect for "30+ years", "40,000+ events", "5,000,000+ meals served" social proof sections.

```tsx
// components/motion/enhanced-counter.tsx
'use client';

import { useEffect, useRef, useState, useReducer } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface EnhancedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'easeOut' | 'spring';
  separator?: string;
  className?: string;
  label?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

type CounterState = {
  currentValue: number;
  isAnimating: boolean;
  hasAnimated: boolean;
};

type CounterAction =
  | { type: 'START'; target: number }
  | { type: 'UPDATE'; value: number }
  | { type: 'COMPLETE' }
  | { type: 'RESET' };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'START':
      return { ...state, isAnimating: true, currentValue: 0 };
    case 'UPDATE':
      return { ...state, currentValue: action.value };
    case 'COMPLETE':
      return { ...state, isAnimating: false, hasAnimated: true };
    case 'RESET':
      return { currentValue: 0, isAnimating: false, hasAnimated: false };
    default:
      return state;
  }
}

export function EnhancedCounter({
  value: targetValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  delay = 0,
  easing = 'easeOut',
  separator = ' ',
  className,
  label,
  onStart,
  onComplete,
}: EnhancedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const [state, dispatch] = useReducer(counterReducer, {
    currentValue: 0,
    isAnimating: false,
    hasAnimated: false,
  });

  // Spring-based animated value
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const displayValue = useTransform(springValue, (latest) => {
    return formatNumber(latest, decimals, separator);
  });

  useEffect(() => {
    if (!isInView || state.hasAnimated) return;

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'START', target: targetValue });
      onStart?.();

      if (easing === 'spring') {
        springValue.set(targetValue);
        
        // Listen for spring completion
        const unsubscribe = springValue.on('change', (v) => {
          if (Math.abs(v - targetValue) < 0.5) {
            dispatch({ type: 'COMPLETE' });
            onComplete?.();
            unsubscribe();
          }
        });
      } else {
        // Easing-based animation
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime - delay;
          
          if (elapsed < 0) {
            requestAnimationFrame(animate);
            return;
          }

          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = getEasing(progress, easing);
          const newValue = easedProgress * targetValue;

          dispatch({ type: 'UPDATE', value: newValue });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            dispatch({ type: 'COMPLETE' });
            onComplete?.();
          }
        };

        requestAnimationFrame(animate);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isInView, targetValue, duration, delay, easing]);

  const formatNumber = (num: number, dec: number, sep: string) => {
    const fixed = num.toFixed(dec);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  };

  return (
    <motion.div
      ref={ref}
      className={`text-center ${className ?? ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <motion.span className='block text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight'>
        {easing === 'spring' ? displayValue : `${prefix}${formatNumber(state.currentValue, decimals, separator)}${suffix}`}
      </motion.span>
      {label && (
        <motion.span
          className='mt-3 block text-sm uppercase tracking-[0.2em] text-muted-foreground'
          initial={{ opacity: 0 }}
          animate={state.hasAnimated ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}

// Stats Grid with staggered entrance
interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
}

interface StatsGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-2 ${gridCols[columns]} gap-8 lg:gap-16 ${className ?? ''}`}>
      {stats.map((stat, index) => (
        <EnhancedCounter
          key={index}
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          label={stat.label}
          delay={index * 150}
          duration={2000 + index * 200}
        />
      ))}
    </div>
  );
}

// Helper functions
function getEasing(t: number, type: 'linear' | 'easeOut'): number {
  switch (type) {
    case 'linear':
      return t;
    case 'easeOut':
      // Ease-out exponential
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    default:
      return t;
  }
}
```

**Usage Example:**
```tsx
// In your page component
<StatsGrid 
  stats={[
    { value: 30, suffix: '+', label: 'Years of Excellence' },
    { value: 40000, suffix: '+', label: 'Events Catered' },
    { value: 5000000, suffix: '+', label: 'Meals Served' },
    { value: 500, suffix: '+', label: 'Happy Clients' },
  ]}
/>
```

---

### Infinite Marquee & Carousel (Gamma Catering pattern)

> Auto-scrolling infinite logo/client carousel using Splide.js with pause-on-hover.
> Perfect for showcasing brand partners, clients, or testimonials.

```tsx
// components/motion/infinite-marquee.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// For Splide implementation, install: npm install @splidejs/splide
// import '@splidejs/splide/css';

interface MarqueeItem {
  id: string;
  content: React.ReactNode;
  alt?: string;
}

interface InfiniteMarqueeProps {
  items: MarqueeItem[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  gap?: number;
  className?: string;
}

const SPEED_MAP = {
  slow: 60,
  normal: 40,
  fast: 20,
};

export function InfiniteMarquee({
  items,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  gap = 48,
  className,
}: InfiniteMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const duration = SPEED_MAP[speed];
  const animationDirection = direction === 'left' ? 'normal' : 'reverse';

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Scrolling marquee"
    >
      {/* Fade edges */}
      <div className='absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none' />
      <div className='absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none' />

      <motion.div
        ref={marqueeRef}
        className='flex gap-4'
        animate={{ x: direction === 'left' ? [0, '-50%'] : ['-50%', 0] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration,
            ease: 'linear',
            ...(isPaused && { play: false }),
          },
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className='flex-shrink-0 px-2'
            style={{ marginRight: `${gap}px` }}
          >
            {item.content}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Logo Carousel Component
interface Logo {
  src: string;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
}

interface LogoCarouselProps {
  logos: Logo[];
  grayscale?: boolean;
  hoverColor?: boolean;
  className?: string;
}

export function LogoCarousel({
  logos,
  grayscale = true,
  hoverColor = true,
  className,
}: LogoCarouselProps) {
  const marqueeItems: MarqueeItem[] = logos.map((logo) => ({
    id: logo.alt,
    content: (
      <a
        href={logo.href ?? '#'}
        className={`inline-flex items-center justify-center p-4 transition-all duration-300 ${
          grayscale ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''
        } ${hoverColor ? 'hover:scale-110' : ''}`}
        aria-label={logo.alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={logo.alt}
          width={logo.width ?? 120}
          height={logo.height ?? 60}
          className='max-h-12 w-auto object-contain'
          loading='lazy'
        />
      </a>
    ),
  }));

  return (
    <InfiniteMarquee
      items={marqueeItems}
      speed='slow'
      pauseOnHover={true}
      className={className}
    />
  );
}

// Testimonial Carousel with Auto-scroll
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlayInterval = 5000,
  className,
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length, autoPlayInterval]);

  const currentTestimonial = testimonials[activeIndex];

  return (
    <div
      className={`relative ${className ?? ''}`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Testimonial Content */}
      <motion.div
        key={currentTestimonial.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className='text-center max-w-3xl mx-auto'
      >
        <blockquote className='text-xl md:text-2xl lg:text-3xl font-light italic leading-relaxed mb-8'>
          "{currentTestimonial.quote}"
        </blockquote>
        <div className='flex items-center justify-center gap-4'>
          {currentTestimonial.avatar && (
            <img
              src={currentTestimonial.avatar}
              alt={currentTestimonial.author}
              className='w-12 h-12 rounded-full object-cover'
            />
          )}
          <div className='text-left'>
            <p className='font-semibold'>{currentTestimonial.author}</p>
            {currentTestimonial.role && (
              <p className='text-sm text-muted-foreground'>{currentTestimonial.role}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation Dots */}
      <div className='flex justify-center gap-2 mt-8'>
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-primary w-8'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-muted overflow-hidden'>
        <motion.div
          className='h-full bg-primary'
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          key={activeIndex}
        />
      </div>
    </div>
  );
}
```

**Usage Examples:**
```tsx
// Logo Carousel
<LogoCarousel
  logos={[
    { src: '/logos/google.png', alt: 'Google' },
    { src: '/logos/apple.png', alt: 'Apple' },
    { src: '/logos/amazon.png', alt: 'Amazon' },
    // ...more logos
  ]}
  grayscale
  hoverColor
/>

// Simple Marquee
<InfiniteMarquee
  items={[
    { id: '1', content: <span className="text-2xl font-bold">✨ Premium Quality</span> },
    { id: '2', content: <span className="text-2xl font-bold">🎯 Exceptional Service</span> },
    // ...more items
  ]}
  speed="fast"
/>
```

---

### Rotating Text Carousel (GG Catering pattern)

> High-energy rotating adjective carousel for brand personality expression.
> Cycles through positive descriptors with smooth AnimatePresence transitions.

```tsx
// components/motion/rotating-text.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: textClassName?: string;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'blur' | 'scale' | 'rotateX';
  pauseOnHover?: boolean;
}

const ANIMATION_VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
  scale: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.5 },
  },
  rotateX: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
  },
};

export function RotatingText({
  words,
  interval = 2500,
  className,
  textClassName,
  animationType = 'slideUp',
  pauseOnHover = true,
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const variants = ANIMATION_VARIANTS[animationType];

  const nextWord = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(nextWord, interval);
    return () => clearInterval(timer);
  }, [interval, nextWord, isPaused]);

  return (
    <span
      className={`inline-block relative ${className ?? ''}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode='wait'>
        <motion.span
          key={currentIndex}
          className={`inline-block ${textClassName ?? ''}`}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Pre-configured "Who We Are" component
const POSITIVE_ADJECTIVES = [
  'Passionate',
  'Creative',
  'Dedicated',
  'Innovative',
  'Exceptional',
  'Authentic',
  'Inspiring',
  'Meticulous',
  'Bold',
  'Visionary',
  'Artisanal',
  'Sustainable',
  'Premier',
  'Bespoke',
  'Elevated',
  'Impeccable',
  'Extraordinary',
  'Unforgettable',
  'Curated',
  'Luxurious',
  'Heartfelt',
  'Dynamic',
  'Sophisticated',
  'Celebrated',
];

interface WhoWeAreProps {
  customWords?: string[];
  prefix?: string;
  suffix?: string;
  interval?: number;
  className?: string;
}

export function WhoWeAreRotating({
  customWords,
  prefix = 'We are ',
  suffix = '',
  interval = 2000,
  className,
}: WhoWeAreProps) {
  const words = customWords ?? POSITIVE_ADJECTIVES;

  return (
    <div className={className}>
      <span className='text-lg md:text-xl text-muted-foreground'>
        {prefix}
        <RotatingText
          words={words}
          interval={interval}
          textClassName='font-bold text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'
          animationType='slideUp'
        />
        {suffix}
      </span>
    </div>
  );
}

// Typewriter-style rotating text
interface TypewriterTextProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterText({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseDuration = 1500,
  className,
}: TypewriterTextProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentFullWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          setCurrentWord(currentFullWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);

          if (charIndex + 1 === currentFullWord.length) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting
          setCurrentWord(currentFullWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);

          if (charIndex - 1 === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentWord}
      <motion.span
        className='inline-block w-[3px] h-[1em] bg-current ml-1 align-middle'
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </span>
  );
}
```

**Usage Examples:**
```tsx
// Basic rotating text
<RotatingText
  words={['Amazing', 'Incredible', 'Exceptional', 'Unforgettable']}
  interval={2000}
  animationType="slideUp"
/>

// "Who We Are" section with all 24 adjectives
<WhoWeAreRotating 
  prefix="We are "
  interval={1800}
/>

// Typewriter effect
<TypewriterText
  words={['Catering', 'Events', 'Experiences', 'Memories']}
  typeSpeed={120}
/>
```

---

### Staggered Process Steps (Creative Edge pattern)

> Scroll-triggered staggered process steps with aspirational naming convention.
> Perfect for "Our Process" or "How We Work" sections.

```tsx
// components/motion/process-steps.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  className?: string;
  variant?: 'vertical' | 'horizontal' | 'timeline';
}

export function ProcessSteps({
  steps,
  className,
  variant = 'vertical',
}: ProcessStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  if (variant === 'horizontal') {
    return <HorizontalSteps steps={steps} className={className} />;
  }

  if (variant === 'timeline') {
    return <TimelineSteps steps={steps} className={className} />;
  }

  return <VerticalSteps steps={steps} isInView={isInView} containerRef={containerRef} className={className} />;
}

// Vertical Steps with Stagger
function VerticalSteps({
  steps,
  isInView,
  containerRef,
  className,
}: {
  steps: ProcessStep[];
  isInView: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className={`space-y-12 ${className ?? ''}`}
      variants={containerVariants}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
    >
      {steps.map((step, index) => (
        <ProcessStepCard key={step.number} step={step} index={index} />
      ))}
    </motion.div>
  );
}

// Individual Step Card
function ProcessStepCard({
  step,
  index,
}: {
  step: ProcessStep;
  index: number;
}) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      y: 30,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className='group relative flex gap-8'
    >
      {/* Step Number */}
      <div className='flex-shrink-0'>
        <motion.div
          className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300'
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {step.number}
        </motion.div>
        {/* Connector Line */}
        {index < 3 && (
          <div className='w-0.5 h-12 bg-gradient-to-b from-primary/30 to-transparent mx-auto mt-4' />
        )}
      </div>

      {/* Step Content */}
      <div className='flex-1 pb-8'>
        <motion.h3
          className='text-2xl font-bold mb-2 group-hover:text-primary transition-colors'
          layoutId={`title-${step.number}`}
        >
          {step.title}
        </motion.h3>
        <p className='text-muted-foreground leading-relaxed'>
          {step.description}
        </p>
        {step.icon && (
          <motion.div
            className='mt-4 text-primary'
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {step.icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Horizontal Steps
function HorizontalSteps({
  steps,
  className,
}: {
  steps: ProcessStep[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className ?? ''}`}>
      {steps.map((step, index) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className='relative group text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300'
        >
          {/* Step Number Badge */}
          <div className='absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full'>
            Step {step.number}
          </div>

          {/* Icon/Number */}
          <div className='w-20 h-20 mx-auto mt-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-bold text-primary mb-6 group-hover:scale-110 transition-transform'>
            {step.number}
          </div>

          <h3 className='text-xl font-bold mb-3 group-hover:text-primary transition-colors'>
            {step.title}
          </h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {step.description}
          </p>

          {/* Connector Arrow */}
          {index < steps.length - 1 && (
            <div className='hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-2xl text-muted-foreground/30'>
              →
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Timeline Variant
function TimelineSteps({
  steps,
  className,
}: {
  steps: ProcessStep[];
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Central Line */}
      <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block' />

      <div className='space-y-12'>
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className={`flex items-center gap-8 ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Content */}
            <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
              <span className='text-sm font-mono text-primary mb-2 block'>STEP {step.number}</span>
              <h3 className='text-2xl font-bold mb-2'>{step.title}</h3>
              <p className='text-muted-foreground'>{step.description}</p>
            </div>

            {/* Center Dot */}
            <div className='hidden md:flex w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 z-10 flex-shrink-0' />

            {/* Spacer for alignment */}
            <div className='flex-1 hidden md:block' />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Pre-configured catering process
export const CATERING_PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'DREAM',
    description: 'Share your vision with us. Whether it\'s an intimate dinner or a grand gala, we listen to every detail of your dream event.',
  },
  {
    number: '02',
    title: 'DESIGN',
    description: 'Our culinary architects craft a bespoke menu and experience tailored perfectly to your occasion and guests.',
  },
  {
    number: '03',
    title: 'BUILD',
    description: 'From sourcing premium ingredients to coordinating logistics, we meticulously build the foundation for your event.',
  },
  {
    number: '04',
    title: 'SAVOR',
    description: 'Experience the magic as our team delivers an unforgettable culinary journey that exceeds all expectations.',
  },
];
```

**Usage Example:**
```tsx
<section className="py-24">
  <h2 className="text-4xl font-bold text-center mb-16">Our Process</h2>
  <ProcessSteps 
    steps={CATERING_PROCESS_STEPS}
    variant="horizontal"
  />
</section>
```

---

### Header Theme Switching (Adaptive Navigation Pattern)

> Dynamic header that changes appearance based on the currently visible section.
> Uses IntersectionObserver for performant section detection.

```tsx
// components/motion/adaptive-header.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ThemeMode = 'transparent' | 'light' | 'dark' | 'colored';

interface SectionTheme {
  id: string;
  theme: ThemeMode;
  textColor?: 'light' | 'dark';
}

interface AdaptiveHeaderProps {
  sections: SectionTheme[];
  defaultTheme?: ThemeMode;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  blurAmount?: number;
}

export function AdaptiveHeader({
  sections,
  defaultTheme = 'transparent',
  children,
  className,
  threshold = 0.3,
  blurAmount = 12,
}: AdaptiveHeaderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(defaultTheme);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      const atTop = window.scrollY < 10;
      
      setIsScrolled(scrolled);
      setIsAtTop(atTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Observe sections for theme changes
  const setupObservers = useCallback(() => {
    // Cleanup previous observers
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    sections.forEach(({ id, theme }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentTheme(theme);
          }
        },
        {
          threshold,
          rootMargin: '-10% 0px -10% 0px',
        }
      );

      observer.observe(element);
      observersRef.current.push(observer);
    });
  }, [sections, threshold]);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupObservers, 100);
    return () => {
      clearTimeout(timeoutId);
      observersRef.current.forEach((obs) => obs.disconnect());
    };
  }, [setupObservers]);

  // Generate header styles based on theme
  const getHeaderStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: 'all 0.3s ease',
    };

    switch (currentTheme) {
      case 'transparent':
        return {
          ...baseStyles,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: isScrolled ? `blur(${blurAmount}px)` : 'none',
          color: isScrolled ? '#000' : '#fff',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
        };
      
      case 'light':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: `blur(${blurAmount}px)`,
          color: '#000',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        };
      
      case 'dark':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: `blur(${blurAmount}px)`,
          color: '#fff',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        };
      
      case 'colored':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(209, 26, 70, 0.95)',
          backdropFilter: `blur(${blurAmount}px)`,
          color: '#fff',
          boxShadow: '0 4px 30px rgba(209, 26, 70, 0.3)',
        };
      
      default:
        return baseStyles;
    }
  };

  return (
    <motion.header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 ${className ?? ''}`}
      style={getHeaderStyles()}
      initial={false}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentTheme}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.header>
  );
}

// Hook for using adaptive header context
export function useHeaderTheme() {
  // This would typically use a context provider
  // Simplified version returns null for now
  return { currentTheme: 'light' as ThemeMode, isScrolled: false };
}

// Sticky header with hide-on-scroll behavior
interface SmartHeaderProps {
  children: React.ReactNode;
  hideOffset?: number;
  showOffset?: number;
  className?: string;
}

export function SmartHeader({
  children,
  hideOffset = 100,
  showOffset = 50,
  className,
}: SmartHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          setIsAtTop(currentScrollY < 10);

          if (Math.abs(currentScrollY - lastScrollY) < 10) {
            setLastScrollY(currentScrollY);
            ticking = false;
            return;
          }

          // Scrolling down and past threshold -> hide
          if (currentScrollY > lastScrollY && currentScrollY > hideOffset) {
            setIsVisible(false);
          }
          // Scrolling up or near top -> show
          else if (currentScrollY < lastScrollY || currentScrollY < showOffset) {
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOffset, showOffset]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 ${className ?? ''}`}
      initial={false}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.header>
  );
}
```

**Usage Example:**
```tsx
// Define your sections with themes
const sectionThemes: SectionTheme[] = [
  { id: 'hero', theme: 'transparent' },
  { id: 'about', theme: 'light' },
  { id: 'menu', theme: 'dark' },
  { id: 'gallery', theme: 'colored' },
  { id: 'contact', theme: 'light' },
];

// In layout
<AdaptiveHeader sections={sectionThemes} defaultTheme="transparent">
  <nav className="container mx-auto px-6 py-4">
    <Logo />
    <Navigation />
  </nav>
</AdaptiveHeader>
```

---

### Enhanced Magnetic Button Effect (Pinch-inspired Premium)

> Advanced magnetic button with proximity detection, smooth spring physics,
> and premium micro-interactions for luxury feel.

```tsx
// components/motion/enhanced-magnetic-button.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface EnhancedMagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number; // Detection radius multiplier
  springConfig?: {
    stiffness?: number;
    damping?: mass?: number;
  };
  glowEffect?: boolean;
  glowColor?: string;
  rippleEffect?: boolean;
  soundEnabled?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function EnhancedMagneticButton({
  children,
  className,
  strength = 50,
  radius = 1.5,
  springConfig = { stiffness: 150, damping: 15, mass: 0.1 },
  glowEffect = true,
  glowColor = 'rgba(209, 26, 70, 0.4)',
  rippleEffect = true,
  disabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: EnhancedMagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Motion values for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-based movement
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform values for visual effects
  const buttonScale = useTransform(mouseX, [-strength, 0, strength], [1, 1.02, 1]);
  const rotationX = useTransform(mouseY, [-strength, 0, strength], [5, 0, -5]);
  const rotationY = useTransform(mouseX, [-strength, 0, strength], [-5, 0, 5]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current || disabled) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = (rect.width / 2) * radius;

      // Only apply magnetic effect within radius
      if (distance < maxDistance) {
        const factor = 1 - distance / maxDistance;
        mouseX.set(deltaX * factor * (strength / (rect.width / 2)));
        mouseY.set(deltaY * factor * (strength / (rect.height / 2)));
      }
    },
    [disabled, mouseX, mouseY, strength, radius]
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    onMouseEnter?.();
  }, [disabled, onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    onMouseLeave?.();
  }, [mouseX, mouseY, onMouseLeave]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (rippleEffect && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    },
    [onClick, rippleEffect]
  );

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        x: springX,
        y: springY,
        scale: buttonScale,
        rotateX,
        rotateY,
        transformPerspective: 500,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      initial={false}
    >
      {/* Glow Effect */}
      {glowEffect && (
        <motion.div
          className='absolute inset-0 rounded-inherit pointer-events-none'
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? `0 0 60px ${glowColor}, 0 0 100px ${glowColor}`
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className='absolute rounded-full bg-white/30 pointer-events-none'
          initial={{
            x: ripple.x - 10,
            y: ripple.y - 10,
            width: 20,
            height: 20,
            opacity: 0.6,
            scale: 0,
          }}
          animate={{
            scale: 4,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ left: 0, top: 0 }}
        />
      ))}

      {/* Border Glow on Hover */}
      <motion.div
        className='absolute inset-0 rounded-inherit pointer-events-none'
        initial={false}
        animate={{
          background: isHovered
            ? `radial-gradient(circle at center, transparent 60%, ${glowColor}20 100%)`
            : 'transparent',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <span className='relative z-10'>{children}</span>
    </motion.button>
  );
}

// Magnetic Card Component
interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
  glareColor?: string;
}

export function MagneticCard({
  children,
  className,
  tiltAmount = 15,
  glareEnabled = true,
  glareColor = 'rgba(255, 255, 255, 0.15)',
}: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    rotateX.set(-percentY * tiltAmount);
    rotateY.set(percentX * tiltAmount);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative preserve-3d ${className ?? ''}`}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 30 }}
    >
      {/* Glare Effect */}
      {glareEnabled && (
        <motion.div
          className='absolute inset-0 rounded-inherit pointer-events-none overflow-hidden'
          style={{ zIndex: 1 }}
        >
          <motion.div
            className='absolute inset-0 rounded-inherit'
            animate={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glareColor}, transparent 60%)`,
            }}
            style={{
              '--mouse-x': useTransform(rotateY, [-tiltAmount, tiltAmount], ['0%', '100%']),
              '--mouse-y': useTransform(rotateX, [-tiltAmount, tiltAmount], ['0%', '100%']),
            } as React.CSSProperties}
          />
        </motion.div>
      )}

      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
}
```

**Usage Example:**
```tsx
<EnhancedMagneticButton
  strength={60}
  glowEffect
  rippleEffect
  className="px-8 py-4 bg-primary text-white rounded-full font-semibold"
  onClick={() => console.log('Clicked!')}
>
  Book Your Event
</EnhancedMagneticButton>

<MagneticCard className="p-8 bg-card rounded-2xl border">
  <h3>Premium Package</h3>
  <p>Luxury catering experience</p>
</MagneticCard>
```

---

### Font Loading Optimization (Squarespace pattern)

> Prevent Flash of Unstyled Text (FOUT) with smooth font loading animations.
> Ensures fonts load gracefully without layout shifts.

```tsx
// components/motion/font-loading.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Font Loading State Manager
 * Tracks document.fonts.ready and provides loading states
 */

type FontLoadingState = 'loading' | 'active' | 'loaded' | 'failed';

interface UseFontLoadingOptions {
  fontFamily?: string;
  timeout?: number;
}

export function useFontLoading(options: UseFontLoadingOptions = {}) {
  const { fontFamily, timeout = 5000 } = options;
  const [state, setState] = useState<FontLoadingState>('loading');

  useEffect(() => {
    // Check if fonts API is available
    if (typeof document === 'undefined' || !document.fonts) {
      setState('loaded');
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const checkFonts = async () => {
      try {
        setState('active');
        
        await document.fonts.ready;
        
        // If specific font family requested, verify it's loaded
        if (fontFamily) {
          const fontStatus = document.fonts.check(`12px "${fontFamily}"`);
          if (!fontStatus) {
            // Wait a bit more for specific font
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        setState('loaded');
      } catch (error) {
        console.warn('Font loading error:', error);
        setState('failed');
      }
    };

    // Set timeout fallback
    timeoutId = setTimeout(() => {
      if (state !== 'loaded') {
        setState('loaded'); // Continue anyway after timeout
      }
    }, timeout);

    checkFonts();

    return () => clearTimeout(timeoutId);
  }, [fontFamily, timeout, state]);

  return state;
}

// Font Loading Wrapper Component
interface FontLoadingWrapperProps {
  children: React.ReactNode;
  fontFamily?: string;
  fallbackClassName?: string;
  loadedClassName?: string;
  fadeInDuration?: number;
}

export function FontLoadingWrapper({
  children,
  fontFamily,
  fallbackClassName = 'font-loading-fallback',
  loadedClassName = 'font-loaded',
  fadeInDuration = 0.3,
}: FontLoadingWrapperProps) {
  const fontState = useFontLoading({ fontFamily });

  return (
    <>
      {/* Add CSS classes to body for global styling */}
      <FontStateClasses state={fontState} />

      <AnimatePresence mode='wait'>
        {fontState === 'loading' || fontState === 'active' ? (
          <motion.div
            key='font-loading'
            className={fallbackClassName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ visibility: fontState === 'loaded' ? 'hidden' : 'visible' }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key='font-loaded'
            className={loadedClassName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: fadeInDuration, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Inject font state classes into DOM
function FontStateClasses({ state }: { state: FontLoadingState }) {
  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('fonts-loading', 'fonts-active', 'fonts-loaded', 'fonts-failed');
    root.classList.add(`fonts-${state}`);

    return () => {
      root.classList.remove(`fonts-${state}`);
    };
  }, [state]);

  return null;
}

// Optimized Text Component with Font Awareness
interface OptimizedTextProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  waitForFont?: boolean;
}

export function OptimizedText({
  children,
  as: Tag = 'span',
  className,
  style,
  waitForFont = true,
}: OptimizedTextProps) {
  const fontState = useFontLoading();
  const shouldShow = !waitForFont || fontState === 'loaded' || fontState === 'failed';

  return (
    <motion.div
      as={Tag}
      className={className}
      style={{
        ...style,
        opacity: shouldShow ? undefined : 0,
      }}
      initial={false}
      animate={{ opacity: shouldShow ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

**CSS additions for globals.css:**
```css
/* ===== FONT LOADING OPTIMIZATION ===== */

/* Prevent FOIT/FOUT during font loading */
.fonts-loading body,
.fonts-active body {
  /* Show system fonts initially for faster perceived load */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Smooth transition when fonts load */
.fonts-loaded body {
  /* Your custom font will apply naturally */
  transition: font-rendering 0.3s ease;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Optional: Subtle fade when fonts swap */
@supports (font-display: swap) {
  .fonts-loading body * {
    /* Prevent layout shift by setting dimensions */
    text-rendering: optimizeSpeed;
  }
}

/* Font loading skeleton placeholder */
.font-loading-fallback {
  position: relative;
}

.font-loading-fallback::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.03) 50%,
    transparent 100%
  );
  animation: font-shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes font-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Critical font-face declarations with font-display */
/* @font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
} */
```

---

### Responsive Animation Patterns (GSAP matchMedia)

> Complex timeline control that adapts animations per breakpoint.
> Essential for mobile-first animation strategies.

```tsx
// lib/responsive-animations.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Responsive Animation Controller
 * Uses GSAP matchMedia to create breakpoint-specific animations
 */

interface ResponsiveAnimationOptions {
  // Breakpoints (defaults to common values)
  breakpoints?: {
    mobile?: number;   // Default: 480
    tablet?: number;   // Default: 768
    desktop?: number;  // Default: 1024
    wide?: number;     // Default: 1440
  };
  // Animation settings per breakpoint
  mobile?: gsap.TweenVars;
  tablet?: gsap.TweenVars;
  desktop?: gsap.TweenVars;
  wide?: gsap.TweenVars;
  // ScrollTrigger settings
  scrollTrigger?: {
    mobile?: ScrollTrigger.Vars;
    tablet?: ScrollTrigger.Vars;
    desktop?: ScrollTrigger.Vars;
    wide?: ScrollTrigger.Vars;
  };
}

export function createResponsiveAnimation(
  selector: string,
  options: ResponsiveAnimationOptions
) {
  const {
    breakpoints = {},
    mobile: mobileAnim,
    tablet: tabletAnim,
    desktop: desktopAnim,
    wide: wideAnim,
    scrollTrigger: scrollTriggerOptions,
  } = options;

  const bp = {
    mobile: breakpoints.mobile ?? 480,
    tablet: breakpoints.tablet ?? 768,
    desktop: breakpoints.desktop ?? 1024,
    wide: breakpoints.wide ?? 1440,
  };

  // Clean up any existing ScrollTriggers for this selector
  ScrollTrigger.getAll()
    .filter((st) => st.trigger === document.querySelector(selector))
    .forEach((st) => st.kill());

  // Create responsive animation with matchMedia
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: `(max-width: ${bp.mobile - 1}px)`,
      isTablet: `(min-width: ${bp.mobile}px) and (max-width: ${bp.tablet - 1}px)`,
      isDesktop: `(min-width: ${bp.desktop}px) and (max-width: ${bp.wide - 1}px)`,
      isWide: `(min-width: ${bp.wide}px)`,
    },
    (context) => {
      const { isMobile, isTablet, isDesktop, isWide } = context.conditions as Record<string, boolean>;

      let animVars: gsap.TweenVars = {};
      let stVars: ScrollTrigger.Vars | undefined;

      // Select appropriate animation vars based on breakpoint
      if (isWide && wideAnim) {
        animVars = { ...wideAnim };
        stVars = scrollTriggerOptions?.wide;
      } else if (isDesktop && desktopAnim) {
        animVars = { ...desktopAnim };
        stVars = scrollTriggerOptions?.desktop;
      } else if (isTablet && tabletAnim) {
        animVars = { ...tabletAnim };
        stVars = scrollTriggerOptions?.tablet;
      } else if (isMobile) {
        animVars = mobileAnim ?? { opacity: 1, y: 0 };
        stVars = scrollTriggerOptions?.mobile;
      }

      // Apply animation with optional ScrollTrigger
      if (stVars) {
        gsap.fromTo(
          selector,
          { opacity: 0, y: 50 },
          {
            ...animVars,
            scrollTrigger: {
              trigger: selector,
              start: stVars.start ?? 'top 80%',
              end: stVars.end ?? 'bottom 20%',
              ...stVars,
            },
          }
        );
      } else {
        gsap.fromTo(selector, { opacity: 0, y: 50 }, animVars);
      }

      // Return cleanup function
      return () => {
        ScrollTrigger.getAll()
          .filter((st) => st.trigger === document.querySelector(selector))
          .forEach((st) => st.kill());
      };
    }
  );

  return mm;
}

// Pre-built responsive patterns

/**
 * Hero Text Animation - Different effects per device
 */
export function createHeroTextAnimation() {
  const mm = gsap.matchMedia();

  mm.add({
    isMobile: '(max-width: 767px)',
    isDesktop: '(min-width: 768px)',
  }, (context) => {
    const { isMobile } = context.conditions as Record<string, boolean>;

    if (isMobile) {
      // Mobile: Simple fade up
      gsap.fromTo('.hero-title', 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    } else {
      // Desktop: Split text reveal with stagger
      const title = document.querySelector('.hero-title');
      if (title) {
        const words = title.textContent?.split(' ') ?? [];
        title.innerHTML = words.map(word => `<span class="hero-word">${word}</span>`).join(' ');

        gsap.fromTo('.hero-word',
          { opacity: 0, y: 60, rotateX: -30 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
          }
        );
      }
    }
  });

  return mm;
}

/**
 * Parallax Speed Adjustment - Slower on mobile for performance
 */
export function createResponsiveParallax(selector: string) {
  const mm = gsap.matchMedia();

  mm.add({
    isMobile: '(max-width: 767px)',
    isDesktop: '(min-width: 768px)',
  }, (context) => {
    const { isMobile } = context.conditions as Record<string, boolean>;

    const speed = isMobile ? 0.2 : 0.5;

    gsap.to(selector, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: selector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: isMobile ? 1 : 0.5, // Smoother on mobile
      },
    });
  });

  return mm;
}

/**
 * Gallery/Grid Animation - Columns change per breakpoint
 */
export function createGalleryAnimation(gridSelector: string, itemSelector: string) {
  const mm = gsap.matchMedia();

  mm.add({
    isMobile: '(max-width: 639px)',   // 1 column
    isTablet: '(min-width: 640px) and (max-width: 1023px)',  // 2 columns
    isDesktop: '(min-width: 1024px)',  // 3+ columns
  }, (context) => {
    const conditions = context.conditions as Record<string, boolean>;

    let staggerAmount = 0.15;
    
    if (conditions.isMobile) {
      staggerAmount = 0.1; // Faster on mobile
    } else if (conditions.isTablet) {
      staggerAmount = 0.12;
    } else {
      staggerAmount = 0.15;
    }

    gsap.fromTo(itemSelector,
      { opacity: 0, scale: 0.9, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: staggerAmount,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridSelector,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  return mm;
}

/**
 * Sticky Element - Disable on small screens
 */
export function createConditionalSticky(selector: string) {
  const mm = gsap.matchMedia();

  mm.add({
    canStick: '(min-width: 768px)',
  }, (context) => {
    const { canStick } = context.conditions as Record<string, boolean>;

    if (canStick) {
      ScrollTrigger.create({
        trigger: selector,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
      });
    }
  });

  return mm;
}

// React hook wrapper
// hooks/useResponsiveAnimation.ts
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useResponsiveAnimation(
  animationFactory: () => gsap.MatchMedia,
  deps: React.DependencyList = []
) {
  const mmRef = useRef<gsap.MatchMedia | null>(null);

  useEffect(() => {
    // Create animation
    mmRef.current = animationFactory();

    return () => {
      // Cleanup
      mmRef.current?.kill();
      mmRef.current = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

**React Usage Example:**
```tsx
// components/sections/HeroSection.tsx
'use client';

import { useResponsiveAnimation } from '@/hooks/useResponsiveAnimation';
import { createHeroTextAnimation } from '@/lib/responsive-animations';

export function HeroSection() {
  useResponsiveAnimation(createHeroTextAnimation);

  return (
    <section className="hero min-h-screen">
      <h1 className="hero-title text-5xl md:text-7xl font-bold">
        Extraordinary Catering Experiences
      </h1>
    </section>
  );
}

// components/sections/GallerySection.tsx
'use client';

import { useResponsiveAnimation } from '@/hooks/useResponsiveAnimation';
import { createGalleryAnimation } from '@/lib/responsive-animations';

export function GallerySection() {
  useResponsiveAnimation(
    () => createGalleryAnimation('.gallery-grid', '.gallery-item'),
    [] // Re-run if gallery items change
  );

  return (
    <section className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((img) => (
        <div key={img.id} className="gallery-item aspect-square overflow-hidden rounded-lg">
          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </section>
  );
}
```

---

## Performance Guidelines

1. **GPU-accelerated properties only**: `transform`, `opacity`
2. **Use `will-change` sparingly** — only on actively animating elements
3. **Batch animations** — use `layoutAnimation` for layout changes
4. **Lazy mount** — dynamic import heavy animation components
5. **Debounce scroll handlers** — use `requestAnimationFrame`
6. **Test on mobile** — check performance on real devices
7. **Use View Transitions API** — native browser optimization for page transitions
8. **Implement matchMedia** — serve simpler animations on mobile devices
9. **Prefer CSS animations** for simple, repeating effects over JS-driven ones
10. **Use `font-display: swap`** — prevent render blocking with font loading

## References

- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP ScrollTrigger](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Motion Principles](https://motion.dev/principles)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [GSAP MatchMedia](https://greensock.com/docs/v3/GSAP/Core/matchMedia())
- [Splide.js Documentation](https://splidejs.com/)
