"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, animate, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./reveal";
import { MEDIA } from "@/lib/media";
import { Sparkles, Award, Users, Calendar, ChefHat } from "lucide-react";

const STATS = [
  { value: 16, suffix: "", label: "лет на рынке", icon: Award },
  { value: 2400, suffix: "+", label: "мероприятий", icon: Calendar },
  { value: 50000, suffix: "+", label: "гостей", icon: Users },
  { value: 150, suffix: "+", label: "сотрудников", icon: ChefHat },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!inView || hasAnimated) return;
    setHasAnimated(true);
    const controls = animate(count, to, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("ru-RU")),
      onComplete: () => setDisplay(to.toLocaleString("ru-RU")),
    });
    return () => controls.stop();
  }, [inView, to, count, hasAnimated]);

  // Fallback: show final value after mount if animation didn't trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (display === "0") {
        setDisplay(to.toLocaleString("ru-RU"));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [to, display]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {display}
      {suffix}
    </span>
  );
}

/**
 * Animated stat card with hover effects
 */
function StatCard({ 
  stat, 
  index 
}: { 
  stat: typeof STATS[0]; 
  index: number;
}) {
  const Icon = stat.icon;
  
  return (
    <motion.div
      className="group relative p-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-gold/10 transition-all duration-500 hover:bg-white/80 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10"
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/0 to-terracotta/0 group-hover:from-gold/5 group-hover:to-terracotta/5 transition-all duration-500" />
      
      {/* Icon */}
      <div className="relative flex items-center gap-2 mb-2">
        <motion.div 
          className="p-2 rounded-lg bg-gold/10 text-gold"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon size={18} />
        </motion.div>
        <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-gold/30 group-hover:bg-gold/60 transition-colors duration-300" />
      </div>
      
      {/* Number */}
      <div
        className="font-display gradient-text relative"
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
          fontWeight: 600,
        }}
      >
        <CountUp to={stat.value} suffix={stat.suffix} />
        
        {/* Underline animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold to-terracotta origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.8, duration: 0.6 }}
        />
      </div>
      
      {/* Label */}
      <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink/50 font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
}

/**
 * About section — LIGHT THEME with elegant cinematic animations
 * 
 * Inspired by MyRadish, Ridgewells, and Wolfgang Puck:
 * - Warm cream background with subtle gradients
 * - Gold accent stats with animated counters
 * - Image parallax and zoom effects
 * - Floating decorative elements
 * - Staggered reveal animations
 * - Glass morphism cards
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Parallax for image container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const decorRotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-cream py-28 md:py-40"
    >
      {/* Multi-layer decorative backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-gold/8 via-gold/3 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-terracotta/6 via-terracotta/2 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <motion.div
        className="absolute top-32 right-[20%] w-3 h-3 rounded-full bg-gold/20 hidden lg:block"
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 left-[15%] w-2 h-2 rounded-full bg-terracotta/25 hidden lg:block"
        animate={{ y: [15, -15, 15], x: [5, -5, 5], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-16 md:grid-cols-2 md:items-center md:gap-24">
          
          {/* Image side — with parallax and decorative frame */}
          <Reveal>
            <div className="relative" ref={imageRef}>
              {/* Decorative frame elements */}
              <motion.div 
                className="absolute -inset-5 border border-gold/20 rounded-3xl -rotate-3"
                style={{ rotate: decorRotate }}
              />
              <motion.div 
                className="absolute -inset-2 border border-terracotta/10 rounded-2xl rotate-2"
                style={{ rotate: decorRotate }}
              />
              
              {/* Main image with parallax */}
              <motion.div 
                className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl shadow-ink/10"
                style={{ y: imageY }}
              >
                <Image
                  src={MEDIA.about.src}
                  alt={MEDIA.about.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent mix-blend-overlay" />
                
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </motion.div>

              {/* Floating badge — enhanced with glow */}
              <motion.div
                className="absolute -bottom-6 -right-4 md:-right-8 bg-white/90 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-xl shadow-ink/10 border border-gold/20 glow-pulse z-10"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(196,149,106,0.25)" }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 rounded-xl bg-gradient-to-br from-gold to-terracotta text-white"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Award size={20} />
                  </motion.div>
                  <div>
                    <div className="font-display text-xl font-semibold text-ink">С 2014</div>
                    <div className="font-mono text-xs text-ink/50 uppercase tracking-wider">года</div>
                  </div>
                </div>
              </motion.div>

              {/* Corner accent */}
              <motion.div
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-gold/40 rounded-tl-xl hidden lg:block"
                initial={{ width: 0, height: 0 }}
                whileInView={{ width: 48, height: 48 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </div>
          </Reveal>

          {/* Text side */}
          <div>
            {/* Section label */}
            <Reveal>
              <motion.span 
                className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-gold bg-gradient-to-r from-gold/10 to-terracotta/10 px-5 py-2.5 rounded-full border border-gold/20"
                whileHover={{ borderColor: "rgba(196,149,106,0.4)", backgroundColor: "rgba(196,149,106,0.15)" }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={12} />
                </motion.span>
                О компании
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              </motion.span>
            </Reveal>

            {/* Headline with word reveal */}
            <Reveal delay={0.1}>
              <motion.h2
                className="mt-8 font-display text-ink leading-tight"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                }}
              >
                {"Кейтеринг, в котором".split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                <motion.span 
                  className="gradient-text italic inline-block mt-1"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  чувствуют
                </motion.span>
                <motion.span 
                  className="text-ink inline-block"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {" "}радость
                </motion.span>
              </motion.h2>
            </Reveal>

            {/* Description paragraphs */}
            <Reveal delay={0.2}>
              <motion.p 
                className="mt-8 max-w-lg text-lg leading-relaxed text-ink/70"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Interfood Catering — петербургская команда, которая превращает
                любое мероприятие в{" "}
                <span className="text-ink font-medium relative">
                  ритуал застолья
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gold/50 origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
                . Сезонные продукты, руки поваров и выездная магия.
              </motion.p>
            </Reveal>

            <Reveal delay={0.3}>
              <motion.p 
                className="mt-5 max-w-lg text-base leading-relaxed text-ink/60"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                От фуршета на 20 человек до банкета на 500 гостей — мы привозим всё:
                посуду, мебель, текстиль, обслуживание. Вы получаете ресторан под открытым небом или в вашем офисе.
              </motion.p>
            </Reveal>

            {/* Feature highlights */}
            <Reveal delay={0.35}>
              <motion.div 
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {["Сезонные продукты", "Выездной сервис", "Полный цикл"].map((feature, i) => (
                  <motion.span
                    key={feature}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-gold/15 text-sm text-ink/70 font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
                    whileHover={{ backgroundColor: "rgba(196,149,106,0.1)", borderColor: "rgba(196,149,106,0.3)", y: -2 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    {feature}
                  </motion.span>
                ))}
              </motion.div>
            </Reveal>

            {/* Stats grid — enhanced cards */}
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
