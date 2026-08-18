"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Check, Sparkles, ArrowRight } from "lucide-react";
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
  Flame: "/media/menu-bbq.jpg",
};

/**
 * Service Card Component — with enhanced hover effects
 */
function ServiceCard({ 
  service, 
  index,
  onClick 
}: { 
  service: typeof SERVICES[0]; 
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        onClick={onClick}
        data-cursor="подробнее"
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-cream text-left"
        whileHover={{ y: -12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          boxShadow: "0 4px 20px -4px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 25px 60px -15px rgba(196,149,106,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px -4px rgba(0,0,0,0.08)";
        }}
      >
        {/* Photo with zoom on hover */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={SERVICE_PHOTOS[service.icon] ?? "/media/event-02.jpg"}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        </div>

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 via-40% to-transparent" />
        
        {/* Hover shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 45%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Grain texture on hover */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 grain" />

        {/* Number badge — top-left with elegant styling */}
        <motion.span 
          className="absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.3em] text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        {/* Index badge — top-right with gold accent on hover */}
        <motion.span 
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-md transition-all duration-500 group-hover:border-gold/60 group-hover:bg-gold/90 group-hover:text-white group-hover:shadow-lg group-hover:shadow-gold/30"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {index + 1} / {SERVICES.length}
        </motion.span>

        {/* Bottom content area */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          {/* Animated gold line — appears on hover */}
          <motion.div 
            className="mb-3 h-0.5 bg-gradient-to-r from-gold to-terracotta origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 + 0.4, duration: 0.6 }}
          />
          
          {/* Title */}
          <h3 className="font-display text-xl leading-tight text-white sm:text-2xl transition-colors duration-300 group-hover:text-white">
            {service.title}
          </h3>
          
          {/* Subtitle */}
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/60 sm:text-xs">
            {service.short}
          </p>
          
          {/* CTA hint — slides up on hover */}
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gold opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            Подробнее
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            
            {/* Arrow line animation */}
            <motion.span
              className="ml-1 w-8 h-px bg-gold origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.5, duration: 0.4 }}
            />
          </span>
        </div>

        {/* Corner decorations on hover */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-gold to-transparent" />
          <div className="absolute top-0 right-0 w-0.5 h-8 bg-gradient-to-b from-gold to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-gold to-transparent" />
          <div className="absolute bottom-0 left-0 w-0.5 h-8 bg-gradient-to-t from-gold to-transparent" />
        </div>
      </motion.button>
    </motion.div>
  );
}

/**
 * Services section — LIGHT THEME with cinematic card animations
 * 
 * Inspired by Ridgewells, Wolfgang Puck, and MyRadish:
 * - Image cards with dramatic hover lift & glow
 * - Gold accent badges with animated transitions
 * - Smooth modal with spring physics
 * - Clean white/cream backgrounds
 * - Staggered entrance animations
 */
export function Services() {
  const [open, setOpen] = useState<number | null>(null);
  const current = open !== null ? SERVICES[open] : null;

  return (
    <section id="services" className="relative overflow-hidden bg-white py-28 md:py-40">
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

        {/* Services grid — 4 columns */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <ServiceCard
              key={s.title}
              service={s}
              index={i}
              onClick={() => setOpen(i)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal (LIGHT THEME) — Enhanced with spring animation */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(null)}
          >
            {/* Backdrop with blur */}
            <motion.div 
              className="absolute inset-0 bg-ink/60 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Modal content */}
            <motion.div
              className="scroll-warm relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
              initial={{ scale: 0.9, opacity: 0, y: 50, borderRadius: "2rem" }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button — enhanced */}
              <motion.button
                onClick={() => setOpen(null)}
                className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full bg-cream/90 text-ink/70 backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-gold hover:text-white hover:scale-110 hover:rotate-90"
                aria-label="Закрыть"
                whileHover={{ boxShadow: "0 8px 24px rgba(196,149,106,0.35)" }}
              >
                <X className="size-5" />
              </motion.button>

              {/* Two-column layout: image + content */}
              <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                {/* Image side */}
                <div className="relative aspect-square md:aspect-auto md:min-h-[450px] rounded-t-[2rem] sm:rounded-l-[2rem] sm:rounded-tr-none overflow-hidden">
                  <Image
                    src={SERVICE_PHOTOS[current.icon] ?? "/media/event-02.jpg"}
                    alt={current.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 42vw"
                    className="object-cover"
                  />
                  
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent md:bg-gradient-to-r md:from-ink/20 md:to-transparent" />
                  
                  {/* Service number overlay */}
                  <div className="absolute bottom-6 left-6 font-display text-6xl text-white/20 font-bold">
                    {String((open ?? 0) + 1).padStart(2, "0")}
                  </div>
                </div>

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
              
              {/* Title */}
              <motion.h3 
                className="mt-5 font-display text-3xl text-ink md:text-4xl leading-tight"
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
              
              {/* Divider */}
              <motion.div 
                className="mt-6 h-px bg-gradient-to-r from-gold/50 to-transparent"
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

              {/* Features list */}
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {current.features.map((f, fIndex) => (
                  <motion.li 
                    key={f} 
                    className="flex items-center gap-3 text-sm text-ink/75"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + fIndex * 0.07, duration: 0.5 }}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-terracotta/20 text-gold border border-gold/20">
                      <Check className="size-3.5" />
                    </span>
                    {f}
                  </motion.li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="mt-auto flex flex-wrap gap-4 pt-10">
                <motion.a
                  href="#calculator"
                  onClick={() => setOpen(null)}
                  data-cursor="считать"
                  className="group pulse-glow flex flex-1 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold via-terracotta to-gold px-7 py-4 text-sm font-bold text-white shadow-lg shadow-gold/25 transition-all duration-300 hover:shadow-xl hover:shadow-gold/35 hover:-translate-y-0.5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Рассчитать стоимость
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </motion.a>
                
                <motion.a
                  href="#contact"
                  onClick={() => setOpen(null)}
                  data-cursor="заявка"
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-ink/15 px-7 py-4 text-sm font-medium text-ink transition-all duration-300 hover:border-gold/50 hover:bg-gold/5 hover:-translate-y-0.5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
