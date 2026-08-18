# Interactive Components Skill

> Библиотека интерактивных компонентов для премиального кейтеринг-сайта.
> Паттерны извлечены из анализа top-32 мировых кейтеринг-брендов.

## Когда использовать

- При создании интерактивных элементов
- При работе с формами, галереями, навигацией
- При добавлении hover/focus/scroll взаимодействий
- При создании сложных UI паттернов

## Navigation Patterns

### 1. Sticky Header with Scroll Effect (M Culinary style)

```tsx
// components/catering/site-header.tsx (enhanced)
'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(26, 22, 20, 0)', 'rgba(26, 22, 20, 0.95)']
  );
  const headerBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(20px)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'О нас', href: '#about' },
    { label: 'Меню', href: '#menu' },
    { label: 'Услуги', href: '#services' },
    { label: 'Галерея', href: '#gallery' },
    { label: 'Отзывы', href: '#testimonials' },
    { label: 'Контакты', href: '#contact' },
  ];

  return (
    <>
      <motion.header
        style={{ backgroundColor: headerBg, backdropFilter: headerBlur }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3 shadow-lg' : 'py-6'
        }`}
      >
        <nav className='container mx-auto px-4 md:px-6 flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='relative z-10'>
            <span className='font-display text-2xl font-bold'>Название</span>
          </Link>

          {/* Desktop Nav */}
          <div className='hidden lg:flex items-center gap-8'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='text-sm uppercase tracking-wider text-cream/80 hover:text-bordeaux transition-colors relative group'
              >
                {item.label}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-bordeaux transition-all duration-300 group-hover:w-full' />
              </Link>
            ))}
            <MagneticButton className='bg-bordeaux text-white px-6 py-3 rounded-full text-sm font-semibold'>
              Рассчитать
            </MagneticButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='lg:hidden relative z-10 w-10 h-10 flex items-center justify-center'
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <div className='flex flex-col gap-1.5'>
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className='w-6 h-0.5 bg-current block'
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className='w-6 h-0.5 bg-current block'
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className='w-6 h-0.5 bg-current block'
              />
            </div>
          </button>
        </nav>
      </motion.header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-40 bg-night flex flex-col items-center justify-center gap-8'
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='text-4xl font-display text-cream hover:text-bordeaux transition-colors'
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 2. Chapter Navigation (Progress Indicator)

```tsx
// components/catering/chapter-nav.tsx (enhanced)
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface Chapter {
  id: string;
  label: string;
}

const chapters: Chapter[] = [
  { id: 'hero', label: 'Главная' },
  { id: 'about', label: 'О нас' },
  { id: 'menu', label: 'Меню' },
  { id: 'services', label: 'Услуги' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'calculator', label: 'Калькулятор' },
  { id: 'contact', label: 'Контакты' },
];

export function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    chapters.forEach((chapter) => {
      const element = document.getElementById(chapter.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveChapter(chapters.indexOf(chapter));
          }
        },
        { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const scrollToChapter = (index: number) => {
    const element = document.getElementById(chapters[index].id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className='fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-4'
    >
      {/* Progress line */}
      <div className='absolute top-0 bottom-0 w-0.5 bg-sand/30 -z-10'>
        <motion.div
          className='w-full bg-bordeaux'
          style={{ height: smoothProgress }}
        />
      </div>

      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          onClick={() => scrollToChapter(index)}
          className={`group relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
            activeChapter === index
              ? 'bg-bordeaux text-white'
              : 'bg-transparent text-muted hover:text-foreground'
          }`}
          aria-label={`Перейти к разделу ${chapter.label}`}
        >
          <span className='text-xs font-mono'>{String(index + 1).padStart(2, '0')}</span>
          
          {/* Tooltip on hover */}
          <span className='absolute right-full mr-4 px-3 py-1.5 bg-charcoal text-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
            {chapter.label}
          </span>
        </button>
      ))}
    </motion.nav>
  );
}
```

## Gallery Components

### 3. Interactive Gallery with Lightbox

```tsx
// components/catering/events-gallery.tsx (enhanced)
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  title?: string;
}

export function EventsGallery({ items }: { items: GalleryItem[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categories = ['all', ...new Set(items.map((i) => i.category))];

  const filteredItems =
    activeFilter === 'all'
      ? items
      : items.filter((i) => i.category === activeFilter);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    const newIndex =
      direction === 'prev'
        ? (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
        : (lightboxIndex + 1) % filteredItems.length;
    setLightboxIndex(newIndex);
  };

  return (
    <>
      {/* Filter tabs */}
      <div className='flex flex-wrap justify-center gap-3 mb-12'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-5 py-2 rounded-full text-sm capitalize transition-all duration-300 ${
              activeFilter === category
                ? 'bg-bordeaux text-white'
                : 'bg-parchment text-espresso hover:bg-sand'
            }`}
          >
            {category === 'all' ? 'Все' : category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      >
        <AnimatePresence mode='popLayout'>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className='group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer'
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-110'
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent 
                  flex items-end p-6 transition-opacity duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <div>
                  {item.title && (
                    <h3 className='text-white font-display text-xl'>{item.title}</h3>
                  )}
                  <p className='text-cream/70 text-sm capitalize'>{item.category}</p>
                </div>
              </div>

              {/* Zoom icon */}
              <div
                className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                  flex items-center justify-center transition-all duration-300 ${
                    hoveredIndex === index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-2'
                  }`}
              >
                <svg className='w-5 h-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7' />
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] bg-night/95 flex items-center justify-center p-4'
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className='absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10'
              aria-label='Закрыть'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='relative max-w-5xl max-h-[80vh] aspect-video'
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].alt}
                fill
                className='object-contain'
              />

              {/* Caption */}
              <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-night to-transparent'>
                <h3 className='text-white font-display text-xl'>
                  {filteredItems[lightboxIndex].title || filteredItems[lightboxIndex].alt}
                </h3>
              </div>
            </motion.div>

            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors'
              aria-label='Предыдущее изображение'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors'
              aria-label='Следующее изображение'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>

            {/* Counter */}
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm'>
              {lightboxIndex + 1} / {filteredItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 4. Testimonial Carousel (Ridgewells style)

```tsx
// components/catering/testimonials.tsx (enhanced)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  company: string;
  text: string;
  author: string;
  role: string;
  rating: number;
  image?: string;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    }),
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className='relative max-w-4xl mx-auto'>
      {/* Quote icon */}
      <div className='absolute -top-8 left-1/2 -translate-x-1/2 text-bordeaux/20'>
        <Quote className='w-16 h-16' />
      </div>

      {/* Carousel */}
      <div className='overflow-hidden min-h-[300px] flex items-center'>
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 25 },
              opacity: { duration: 0.3 },
            }}
            className='w-full text-center px-8'
          >
            {/* Stars */}
            <div className='flex justify-center gap-1 mb-6'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < testimonials[current].rating
                      ? 'fill-gold text-gold'
                      : 'text-sand'
                  }`}
                />
              ))}
            </div>

            {/* Text */}
            <blockquote className='text-xl md:text-2xl font-light leading-relaxed text-cream/90 mb-8 italic'>
              &ldquo;{testimonials[current].text}&rdquo;
            </blockquote>

            {/* Author */}
            <div className='flex items-center justify-center gap-4'>
              {testimonials[current].image && (
                <div className='w-14 h-14 rounded-full overflow-hidden'>
                  <Image
                    src={testimonials[current].image!}
                    alt={testimonials[current].author}
                    width={56}
                    height={56}
                    className='object-cover'
                  />
                </div>
              )}
              <div className='text-left'>
                <cite className='not-italic font-semibold text-white'>
                  {testimonials[current].author}
                </cite>
                <p className='text-sm text-cream/60'>
                  {testimonials[current].role}, {testimonials[current].company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className='flex items-center justify-center gap-6 mt-8'>
        <button
          onClick={prev}
          className='w-12 h-12 rounded-full border border-sand/30 flex items-center justify-center text-cream/60 hover:text-bordeau hover:border-bordeaux transition-colors'
          aria-label='Предыдущий отзыв'
        >
          <ChevronLeft className='w-5 h-5' />
        </button>

        {/* Dots */}
        <div className='flex gap-2'>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-bordeaux' : 'bg-sand/30 hover:bg-sand/60'
              }`}
              aria-label={`Перейти к отзыву ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className='w-12 h-12 rounded-full border border-sand/30 flex items-center justify-center text-cream/60 hover:text-bordeau hover:border-bordeaux transition-colors'
          aria-label='Следующий отзыв'
        >
          <ChevronRight className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}
```

## Form Components

### 5. Animated Contact Form

```tsx
// components/catering/contact-form.tsx (enhanced)
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  guests: string;
  date: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    guests: '',
    date: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClasses = (field: string) =>
    `w-full pt-6 pb-2 bg-transparent border-b-2 transition-colors duration-300 outline-none
     ${focusedField === field ? 'border-bordeaux' : 'border-sand'}
     ${status === 'success' ? 'border-success' : ''}`;

  return (
    <form onSubmit={handleSubmit} className='max-w-lg mx-auto space-y-8'>
      <AnimatePresence mode='wait'>
        {status === 'success' ? (
          <motion.div
            key='success'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='text-center py-16'
          >
            <CheckCircle className='w-16 h-16 text-success mx-auto mb-4' />
            <h3 className='text-2xl font-display mb-2'>Заявка отправлена!</h3>
            <p className='text-muted'>Мы свяжемся с вами в ближайшее время</p>
          </motion.div>
        ) : (
          <motion.div key='form'>
            {/* Name */}
            <div className='relative'>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder=' '
                className={inputClasses('name')}
                required
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'name || formData.name
                    ? 'top-1 text-xs text-bordeaux'
                    : 'top-4 text-muted'
                }`}
              >
                Ваше имя *
              </label>
            </div>

            {/* Phone */}
            <div className='relative'>
              <input
                type='tel'
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder=' '
                className={inputClasses('phone')}
                required
              />
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'phone || formData.phone
                    ? 'top-1 text-xs text-bordeaux'
                    : 'top-4 text-muted'
                }`}
              >
                Телефон *
              </label>
            </div>

            {/* Event Type */}
            <div className='relative'>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                onFocus={() => setFocusedField('eventType')}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses('eventType')} appearance-none cursor-pointer`}
                required
              >
                <option value='' disabled>Тип мероприятия</option>
                <option value='banquet'>Банкет</option>
                <option value='furshet'>Фуршет</option>
                <option value='wedding'>Свадьба</option>
                <option value='corporate'>Корпоратив</option>
                <option value='other'>Другое</option>
              </select>
              <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === 'eventType || formData.eventType
                    ? 'top-1 text-xs text-bordeaux'
                    : 'top-4 text-muted'
                }`}
              >
              Тип мероприятия *
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type='submit'
              disabled={status === 'submitting'}
              className='w-full py-4 bg-bordeaux text-white rounded-full font-semibold
                flex items-center justify-center gap-2
                hover:bg-bordeaux-dark transition-colors disabled:opacity-70'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className='w-5 h-5' />
                  Отправить заявку
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
```

### 6. Accordion / FAQ Component

```tsx
// components/ui/accordion.tsx (enhanced)
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='space-y-3'>
      {items.map((item, index) => (
        <div
          key={index}
          className='rounded-2xl overflow-hidden bg-card border border-border'
        >
          <button
            onClick={() => toggle(index)}
            className='w-full flex items-center justify-between p-6 text-left'
            aria-expanded={openIndex === index}
          >
            <span className='font-medium pr-4'>{item.question}</span>
            <motion.span
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className='flex-shrink-0'
            >
              <ChevronDown className='w-5 h-5 text-muted' />
            </motion.span>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className='px-6 pb-6 text-muted'>
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
```

## Scroll Effects

### 7. Scroll Progress Bar

```tsx
// components/motion/scroll-progress.tsx
'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className='fixed top-0 left-0 right-0 h-1 bg-bordeaux origin-left z-[60]'
      style={{ scaleX }}
    />
  );
}
```

### 8. Back to Top Button

```tsx
// components/motion/back-to-top.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-bordeaux text-white
            flex items-center justify-center shadow-lg hover:bg-bordeaux-dark transition-colors'
          aria-label='Наверх'
        >
          <ArrowUp className='w-5 h-5' />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
```

## Usage Examples

```tsx
// page.tsx — assembling all interactive components
import { CustomCursor } from '@/components/motion/custom-cursor';
import { SiteHeader } from '@/components/catering/site-header';
import { ChapterNav } from '@/components/catering/chapter-nav';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { BackToTop } from '@/components/motion/back-to-top';
import { ParallaxLayer } from '@/components/motion/parallax-layers';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { TextScramble } from '@/components/motion/text-scramble';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <SiteHeader />
      <ChapterNav />
      
      <main>
        {/* Hero with parallax */}
        <section id='hero' className='relative h-screen'>
          <ParallaxLayer speed={0.3}>
            <HeroContent />
          </ParallaxLayer>
        </section>

        {/* Stats section */}
        <section id='about'>
          <AnimatedStats stats={[
            { value: 16, suffix: '+', label: 'Лет опыта' },
            { value: 2400, suffix: '+', label: 'Мероприятий' },
            { value: 50000, suffix: '+', label: 'Гостей обслужено' },
            { value: 98, suffix: '%', label: 'Довольных клиентов' },
          ]} />
        </section>

        {/* CTA with magnetic effect */}
        <MagneticButton className='bg-bordeaux text-white px-8 py-4 rounded-full'>
          Рассчитать стоимость
        </MagneticButton>
      </main>

      <BackToTop />
    </>
  );
}
```

## Performance Notes

1. **Lazy mount** — dynamic import heavy components
2. **will-change** — only on actively animating elements
3. **requestAnimationFrame** — for scroll handlers
4. **Debounce** — resize/input handlers
5. **GPU compositing** — transform/opacity only

## Advanced Interaction Patterns (from 23-site analysis)

> Новые паттерны, извлечённые из анализа 23 мировых кейтеринг-сайтов:
> Salt Block, Wolfgang Puck, Queen of Hearts, GG Catering и др.

### 9. Dismissible Announcement Bar (Salt Block pattern)

Сезонный баннер с возможностью закрытия и localStorage персистентностью.

```tsx
// components/catering/announcement-bar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar } from 'lucide-react';

interface AnnouncementBarProps {
  message: string;
  link?: string;
  linkText?: string;
  storageKey?: string;
  variant?: 'default' | 'urgent' | 'seasonal';
}

export function AnnouncementBar({
  message,
  link = '/contact',
  linkText = 'Забронировать →',
  storageKey = 'catering_announcement_dismissed',
  variant = 'seasonal',
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user previously dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    // Store dismissal for 7 days
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(storageKey, expiry.toString());
  }, [storageKey]);

  if (!isMounted) return null;

  const variantStyles = {
    default: 'bg-charcoal text-cream',
    urgent: 'bg-bordeaux text-white',
    seasonal: 'bg-gradient-to-r from-gold/90 to-bordeaux text-white',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`relative overflow-hidden ${variantStyles[variant]}`}
        >
          <div className='container mx-auto px-4 py-3 flex items-center justify-center gap-4'>
            {variant === 'seasonal' && (
              <Calendar className='w-4 h-4 flex-shrink-0 hidden sm:block' />
            )}
            <p className='text-sm sm:text-base text-center font-light'>
              {message}
            </p>
            <a
              href={link}
              className='inline-flex items-center gap-1 text-sm font-semibold 
                underline underline-offset-4 hover:no-underline transition-all'
            >
              {linkText}
              <ArrowRight className='w-4 h-4' />
            </a>
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 
              rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center
              transition-colors'
            aria-label='Закрыть уведомление'
          >
            <X className='w-4 h-4' />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Usage:
// <AnnouncementBar
//   message='Теперь принимаем заявки на 2026 и 2027 годы'
//   link='/booking'
//   linkText='Оставить заявку →'
//   variant='seasonal'
// />
```

### 10. Mega Menu System (Wolfgang Puck pattern)

Многоколоночное выпадающее меню с featured контентом и превью изображений.

```tsx
// components/catering/mega-menu.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  description?: string;
  image?: string;
  badge?: string;
}

interface MenuColumn {
  title: string;
  items: MenuItem[];
}

interface MegaMenuData {
  columns: MenuColumn[];
  featured?: {
    title: string;
    description: string;
    image: string;
    cta: { text: string; href: string };
  };
}

const megaMenuData: Record<string, MegaMenuData> = {
  menu: {
    columns: [
      {
        title: 'По типу мероприятия',
        items: [
          { label: 'Свадебные банкеты', href: '/menu/weddings', description: 'От интимных до грандиозных' },
          { label: 'Корпоративные события', href: '/menu/corporate', description: 'Бизнес-ланчи, конференции' },
          { label: 'Частные вечеринки', href: '/menu/private', description: 'Дни рождения, юбилеи' },
          { label: 'Социальные события', href: '/menu/social', description: 'Гала-ужины, благотворительность' },
        ],
      },
      {
        title: 'Кухни мира',
        items: [
          { label: 'Европейская', href: '/menu/european', badge: 'Популярно' },
          { label: 'Азиатская', href: '/menu/asian' },
          { label: 'Средиземноморская', href: '/menu/mediterranean' },
          { label: 'Фьюжн', href: '/menu/fusion', badge: 'Новинка' },
        ],
      },
    ],
    featured: {
      title: 'Сезонное меню весны 2025',
      description: 'Свежие локальные ингредиенты и авторские блюда шеф-повара',
      image: '/images/seasonal-menu.jpg',
      cta: { text: 'Смотреть меню', href: '/menu/seasonal' },
    },
  },
  services: {
    columns: [
      {
        title: 'Услуги кейтеринга',
        items: [
          { label: 'Выездной сервис', href: '/services/off-site' },
          { label: 'Кейтеринг на площадке', href: '/services/on-site' },
          { label: 'Аренда оборудования', href: '/services/rental' },
          { label: 'Обслуживание персонала', href: '/services/staff' },
        ],
      },
      {
        title: 'Дополнительно',
        items: [
          { label: 'Декор и флористика', href: '/services/decor' },
          { label: 'Музыка и шоу', href: '/services/entertainment' },
          { label: 'Фотосессия', href: '/services/photo' },
          { label: 'Транспорт', href: '/services/transport' },
        ],
      },
    ],
  },
};

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((menuId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuTriggers = [
    { id: 'menu', label: 'Меню', hasMega: true },
    { id: 'services', label: 'Услуги', hasMega: true },
    { id: 'about', label: 'О нас', hasMega: false },
    { id: 'gallery', label: 'Галерея', hasMega: false },
    { id: 'contact', label: 'Контакты', hasMega: false },
  ];

  return (
    <div
      ref={menuRef}
      className='relative'
      onMouseLeave={handleMouseLeave}
    >
      <nav className='flex items-center gap-8'>
        {menuTriggers.map((trigger) => (
          <div
            key={trigger.id}
            onMouseEnter={() => trigger.hasMega && handleMouseEnter(trigger.id)}
            className='relative'
          >
            <Link
              href={trigger.hasMega ? '#' : `/${trigger.id}`}
              className={`flex items-center gap-1 text-sm uppercase tracking-wider 
                transition-colors py-6 ${
                activeMenu === trigger.id
                  ? 'text-bordeaux'
                  : 'text-cream/80 hover:text-bordeaux'
              }`}
            >
              {trigger.label}
              {trigger.hasMega && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeMenu === trigger.id ? 'rotate-180' : ''
                  }`}
                />
              )}
            </Link>
          </div>
        ))}
      </nav>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu && megaMenuData[activeMenu] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className='absolute top-full left-0 right-0 bg-night/95 backdrop-blur-xl 
              border-t border-sand/10 shadow-2xl z-50'
            onMouseEnter={() => handleMouseEnter(activeMenu)}
          >
            <div className='container mx-auto px-6 py-8'>
              <div className='flex gap-12'>
                {/* Columns */}
                <div className='flex-1 flex gap-12'>
                  {megaMenuData[activeMenu].columns.map((column, colIndex) => (
                    <div key={colIndex} className='min-w-[200px]'>
                      <h4 className='text-xs uppercase tracking-widest text-bordeaux mb-4 font-semibold'>
                        {column.title}
                      </h4>
                      <ul className='space-y-3'>
                        {column.items.map((item, itemIndex) => (
                          <motion.li
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              className='group flex items-start gap-2 text-cream/70 
                                hover:text-white transition-colors'
                            >
                              <span className='group-hover:translate-x-1 transition-transform'>→</span>
                              <span>
                                {item.label}
                                {item.badge && (
                                  <span className='ml-2 text-xs px-2 py-0.5 rounded-full bg-bordeaux/20 text-bordeaux'>
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                            </Link>
                            {item.description && (
                              <p className='text-xs text-muted mt-1 ml-5'>{item.description}</p>
                            )}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured Card */}
                {megaMenuData[activeMenu].featured && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className='w-80 flex-shrink-0'
                  >
                    <div className='relative rounded-2xl overflow-hidden group'>
                      <Image
                        src={megaMenuData[activeMenu].featured!.image}
                        alt={megaMenuData[activeMenu].featured!.title}
                        width={320}
                        height={200}
                        className='w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent' />
                      <div className='absolute bottom-0 left-0 right-0 p-5'>
                        <h4 className='text-white font-display text-lg mb-1'>
                          {megaMenuData[activeMenu].featured!.title}
                        </h4>
                        <p className='text-cream/70 text-sm mb-3'>
                          {megaMenuData[activeMenu].featured!.description}
                        </p>
                        <Link
                          href={megaMenuData[activeMenu].featured!.cta.href}
                          className='inline-flex items-center gap-2 text-sm font-semibold text-bordeaux 
                            hover:text-gold transition-colors'
                        >
                          {megaMenuData[activeMenu].featured!.cta.text}
                          <ArrowRight className='w-4 h-4' />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 11. Enhanced Gallery with Lightbox (Multi-touch support)

Продвинутая галерея с поддержкой свайпов, pinch-to-zoom и клавиатурной навигации.

```tsx
// components/catering/enhanced-gallery.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3 } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  title?: string;
  width?: number;
  height?: number;
}

type ViewMode = 'grid' | 'lightbox';

export function EnhancedGallery({ images }: { images: GalleryImage[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'lightbox') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          navigate('prev');
          break;
        case 'ArrowRight':
          navigate('next');
          break;
        case 'Escape':
          closeLightbox();
          break;
        case 'z':
          toggleZoom();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeIndex]);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setViewMode('lightbox');
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setViewMode('grid');
    setIsZoomed(false);
    document.body.style.overflow = '';
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setActiveIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? images.length - 1 : prev - 1;
      }
      return prev === images.length - 1 ? 0 : prev + 1;
    });
    setIsZoomed(false);
  }, [images.length]);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomPosition({ x: 0, y: 0 });
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isZoomed) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStart.y);
    
    // Horizontal swipe (ignore vertical scroll)
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) navigate('prev');
      else navigate('next');
    }
    
    setTouchStart(null);
  };

  // Pinch-to-zoom simulation for mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'lightbox') return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (!isZoomed && e.deltaY < 0) {
        setIsZoomed(true);
      } else if (isZoomed && e.deltaY > 0) {
        setIsZoomed(false);
      }
    }
  };

  // Handle zoom position on mouse move when zoomed
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {images.map((image, index) => (
            <motion.button
              key={image.src}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className='relative aspect-[4/3] overflow-hidden rounded-xl group cursor-pointer'
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className='object-cover transition-transform duration-500 group-hover:scale-110'
                sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
              />
              
              {/* Hover overlay */}
              <div className='absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                <div>
                  {image.title && <h3 className='text-white font-medium'>{image.title}</h3>}
                  <p className='text-cream/70 text-sm capitalize'>{image.category}</p>
                </div>
                
                {/* Zoom icon */}
                <div className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                  <ZoomIn className='w-4 h-4 text-white' />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox View */}
      <AnimatePresence>
        {viewMode === 'lightbox' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] bg-night/98 flex flex-col'
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-sand/10'>
              <button
                onClick={closeLightbox}
                className='flex items-center gap-2 text-cream/70 hover:text-white transition-colors'
              >
                <Grid3X3 className='w-5 h-5' />
                <span className='text-sm'>К галерее</span>
              </button>
              
              <div className='text-cream/50 text-sm'>
                {activeIndex + 1} / {images.length}
              </div>
              
              <button
                onClick={closeLightbox}
                className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                  text-white hover:bg-white/20 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Main image area */}
            <div
              ref={containerRef}
              className='flex-1 relative overflow-hidden cursor-move'
              onMouseMove={handleMouseMove}
              onClick={toggleZoom}
            >
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='absolute inset-0 flex items-center justify-center p-4'
                >
                  <div
                    className={`relative max-w-full max-h-full ${
                      isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'
                    }`}
                    style={
                      isZoomed
                        ? { transform: `translate(${zoomPosition.x}%, ${zoomPosition.y}%) scale(2)` }
                        : {}
                    }
                  >
                    <Image
                      src={images[activeIndex].src}
                      alt={images[activeIndex].alt}
                      width={images[activeIndex].width || 1200}
                      height={images[activeIndex].height || 800}
                      className='max-h-[70vh] w-auto object-contain'
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
                className='absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full 
                  bg-white/10 backdrop-blur-sm flex items-center justify-center text-white 
                  hover:bg-white/20 transition-colors'
              >
                <ChevronLeft className='w-7 h-7' />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('next'); }}
                className='absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full 
                  bg-white/10 backdrop-blur-sm flex items-center justify-center text-white 
                  hover:bg-white/20 transition-colors'
              >
                <ChevronRight className='w-7 h-7' />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className='h-24 border-t border-sand/10 flex items-center gap-2 p-4 overflow-x-auto'>
              {images.map((image, index) => (
                <button
                  key={image.src}
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden 
                    transition-all duration-200 ${
                    index === activeIndex
                      ? 'ring-2 ring-bordeaux ring-offset-2 ring-offset-night'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className='object-cover'
                    sizes='64px'
                  />
                </button>
              ))}
            </div>

            {/* Caption */}
            <div className='px-4 pb-4 text-center'>
              <h3 className='text-white font-medium'>
                {images[activeIndex].title || images[activeIndex].alt}
              </h3>
              <p className='text-cream/50 text-sm capitalize'>{images[activeIndex].category}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 12. Multi-Step Booking Form (Premium pattern)

Форма бронирования с пошаговым индикатором прогресса и валидацией на каждом шаге.

```tsx
// components/catering/multi-step-form.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Calendar, 
  UtensilsCrossed, 
  FileText,
  Loader2,
  Send
} from 'lucide-react';

interface FormData {
  // Step 1: Contact
  name: string;
  email: string;
  phone: string;
  company?: string;
  
  // Step 2: Event Details
  eventType: string;
  eventDate: string;
  guestCount: string;
  venueType: string;
  
  // Step 3: Menu Preferences
  cuisine: string;
  serviceStyle: string;
  dietaryRequirements: string;
  budgetRange: string;
  
  // Step 4: Additional Info
  message: string;
  additionalServices: string[];
}

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const steps: StepConfig[] = [
  { id: 1, title: 'Контакты', subtitle: 'Ваши данные', icon: <User className='w-5 h-5' /> },
  { id: 2, title: 'Мероприятие', subtitle: 'Детали события', icon: <Calendar className='w-5 h-5' /> },
  { id: 3, title: 'Меню', subtitle: 'Предпочтения', icon: <UtensilsCrossed className='w-5 h-5' /> },
  { id: 4, title: 'Детали', subtitle: 'Дополнительно', icon: <FileText className='w-5 h-5' /> },
];

const initialState: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  eventType: '',
  eventDate: '',
  guestCount: '',
  venueType: '',
  cuisine: '',
  serviceStyle: '',
  dietaryRequirements: '',
  budgetRange: '',
  message: '',
  additionalServices: [],
};

export function MultiStepBookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Введите имя';
        if (!formData.email.trim()) newErrors.email = 'Введите email';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Неверный формат';
        if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
        break;
      case 2:
        if (!formData.eventType) newErrors.eventType = 'Выберите тип';
        if (!formData.eventDate) newErrors.eventDate = 'Укажите дату';
        if (!formData.guestCount) newErrors.guestCount = 'Укажите гостей';
        break;
      case 3:
        if (!formData.cuisine) newErrors.cuisine = 'Выберите кухню';
        if (!formData.serviceStyle) newErrors.serviceStyle = 'Выберите формат';
        break;
      case 4:
        // Optional step - no required fields
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    // Only allow going back or to completed steps
    if (step < currentStep) setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className={`relative ${errors.name ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-2'>Имя *</label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-card border transition-colors
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none
                  ${errors.name ? 'border-red-500' : 'border-border'}`}
                placeholder='Как к вам обращаться?'
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
            </div>

            <div className={`relative ${errors.email ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-2'>Email *</label>
              <input
                type='email'
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-card border transition-colors
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none
                  ${errors.email ? 'border-red-500' : 'border-border'}`}
                placeholder='Для отправки подтверждения'
              />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
            </div>

            <div className={`relative ${errors.phone ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-2'>Телефон *</label>
              <input
                type='tel'
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-card border transition-colors
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none
                  ${errors.phone ? 'border-red-500' : 'border-border'}`}
                placeholder='+7 (___) ___-__-__'
              />
              {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Компания</label>
              <input
                type='text'
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className='w-full px-4 py-3 rounded-xl bg-card border border-border 
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none transition-colors'
                placeholder='Необязательно'
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className={`relative ${errors.eventType ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-3'>Тип мероприятия *</label>
              <div className='grid grid-cols-2 gap-3'>
                {['Свадьба', 'Корпоратив', 'День рождения', 'Другое'].map(type => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => updateField('eventType', type)}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      formData.eventType === type
                        ? 'border-bordeaux bg-bordeaux/10 text-bordeaux'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.eventType && <p className='text-red-500 text-sm mt-1'>{errors.eventType}</p>}
            </div>

            <div className={`relative ${errors.eventDate ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-2'>Дата мероприятия *</label>
              <input
                type='date'
                value={formData.eventDate}
                onChange={(e) => updateField('eventDate', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-card border transition-colors
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none
                  ${errors.eventDate ? 'border-red-500' : 'border-border'}`}
              />
              {errors.eventDate && <p className='text-red-500 text-sm mt-1'>{errors.eventDate}</p>}
            </div>

            <div className={`relative ${errors.guestCount ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-2'>Количество гостей *</label>
              <select
                value={formData.guestCount}
                onChange={(e) => updateField('guestCount', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-card border transition-colors
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none
                  ${errors.guestCount ? 'border-red-500' : 'border-border'}`}
              >
                <option value=''>Выберите диапазон</option>
                <option value='10-30'>10-30 гостей</option>
                <option value='31-50'>31-50 гостей</option>
                <option value='51-100'>51-100 гостей</option>
                <option value='101-200'>101-200 гостей</option>
                <option value='200+'>200+ гостей</option>
              </select>
              {errors.guestCount && <p className='text-red-500 text-sm mt-1'>{errors.guestCount}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Тип площадки</label>
              <div className='grid grid-cols-3 gap-3'>
                {['Локация клиента', 'Наша площадка', 'Определимся позже'].map(venue => (
                  <button
                    key={venue}
                    type='button'
                    onClick={() => updateField('venueType', venue)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      formData.venueType === venue
                        ? 'border-bordeaux bg-bordeaux/10 text-bordeaux'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className={`relative ${errors.cuisine ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-3'>Предпочтительная кухня *</label>
              <div className='flex flex-wrap gap-2'>
                {['Европейская', 'Азиатская', 'Средиземноморская', 'Русская', 'Фьюжн'].map(cuisine => (
                  <button
                    key={cuisine}
                    type='button'
                    onClick={() => updateField('cuisine', cuisine)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.cuisine === cuisine
                        ? 'border-bordeaux bg-bordeaux text-white'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              {errors.cuisine && <p className='text-red-500 text-sm mt-1'>{errors.cuisine}</p>}
            </div>

            <div className={`relative ${errors.serviceStyle ? 'error' : ''}`}>
              <label className='block text-sm font-medium mb-3'>Формат обслуживания *</label>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { value: 'buffet', label: 'Фуршет/Буфет' },
                  { value: 'seated', label: 'Посадочный банкет' },
                  { value: 'family', label: 'Семейный стиль' },
                  { value: 'cocktail', label: 'Коктейльная вечеринка' },
                ].map(style => (
                  <button
                    key={style.value}
                    type='button'
                    onClick={() => updateField('serviceStyle', style.value)}
                    className={`px-4 py-3 rounded-xl border text-left transition-all ${
                      formData.serviceStyle === style.value
                        ? 'border-bordeaux bg-bordeaux/10 text-bordeaux'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    <span className='font-medium'>{style.label}</span>
                  </button>
                ))}
              </div>
              {errors.serviceStyle && <p className='text-red-500 text-sm mt-1'>{errors.serviceStyle}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Диетические требования</label>
              <input
                type='text'
                value={formData.dietaryRequirements}
                onChange={(e) => updateField('dietaryRequirements', e.target.value)}
                className='w-full px-4 py-3 rounded-xl bg-card border border-border 
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none transition-colors'
                placeholder='Например: веган, без глютена...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Бюджет на человека</label>
              <div className='grid grid-cols-4 gap-2'>
                {['до 3000₽', '3-5 тыс.₽', '5-10 тыс.₽', '10+ тыс.₽'].map(budget => (
                  <button
                    key={budget}
                    type='button'
                    onClick={() => updateField('budgetRange', budget)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      formData.budgetRange === budget
                        ? 'border-bordeaux bg-bordeaux/10 text-bordeaux'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>Расскажите подробнее</label>
              <textarea
                value={formData.message}
                onChange={(e) => updateField('message', e.target.value)}
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-card border border-border 
                  focus:border-bordeaux focus:ring-1 focus:ring-bordeaux outline-none transition-colors resize-none'
                placeholder='Особые пожелания, тематика, дополнительные вопросы...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-3'>Дополнительные услуги</label>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { value: 'decor', label: 'Декор оформление' },
                  { value: 'photo', label: 'Фотосъёмка' },
                  { value: 'music', label: 'Музыка/DJ' },
                  { value: 'flowers', label: 'Флористика' },
                  { value: 'show', label: 'Шоу программа' },
                  { value: 'transport', label: 'Трансфер гостей' },
                ].map(service => (
                  <label
                    key={service.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      formData.additionalServices.includes(service.value)
                        ? 'border-bordeaux bg-bordeaux/10'
                        : 'border-border hover:border-bordeaux/50'
                    }`}
                  >
                    <input
                      type='checkbox'
                      checked={formData.additionalServices.includes(service.value)}
                      onChange={(e) => {
                        const services = [...formData.additionalServices];
                        if (e.target.checked) {
                          services.push(service.value);
                        } else {
                          const idx = services.indexOf(service.value);
                          services.splice(idx, 1);
                        }
                        updateField('additionalServices', services);
                      }}
                      className='sr-only'
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      formData.additionalServices.includes(service.value)
                        ? 'bg-bordeaux border-bordeaux'
                        : 'border-border'
                    }`}>
                      {formData.additionalServices.includes(service.value) && (
                        <Check className='w-3 h-3 text-white' />
                      )}
                    </div>
                    <span className='text-sm'>{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className='p-4 rounded-xl bg-card border border-border'>
              <h4 className='font-medium mb-3'>Резервирование:</h4>
              <dl className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <dt className='text-muted'>Мероприятие:</dt>
                  <dd>{formData.eventType}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted'>Дата:</dt>
                  <dd>{formData.eventDate}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted'>Гости:</dt>
                  <dd>{formData.guestCount}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted'>Кухня:</dt>
                  <dd>{formData.cuisine}</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='text-center py-16'
      >
        <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6'>
          <Check className='w-10 h-10 text-green-600' />
        </div>
        <h3 className='text-2xl font-display mb-2'>Заявка отправлена!</h3>
        <p className='text-muted mb-6'>
          Наш менеджер свяжется с вами в течение 2 часов для уточнения деталей.
        </p>
        <p className='text-sm text-muted'>
          Подтверждение отправлено на: {formData.email}
        </p>
      </motion.div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={step.id > currentStep}
              className='flex flex-col items-center group disabled:opacity-50'
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentStep === step.id
                  ? 'bg-bordeaux text-white shadow-lg shadow-bordeaux/30'
                  : currentStep > step.id
                  ? 'bg-bordeaux/20 text-bordeaux'
                  : 'bg-card border border-border text-muted'
              }`}>
                {currentStep > step.id ? (
                  <Check className='w-5 h-5' />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${
                currentStep === step.id ? 'text-bordeaux' : 'text-muted'
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className='mt-4 h-1 bg-card rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-bordeaux'
            initial={false}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className='mb-6'>
            <h2 className='text-xl font-display'>
              Шаг {currentStep}: {steps[currentStep - 1].title}
            </h2>
            <p className='text-muted text-sm'>{steps[currentStep - 1].subtitle}</p>
          </div>

          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className='flex justify-between mt-8 pt-6 border-t border-border'>
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
            currentStep === 1
              ? 'border-border text-muted cursor-not-allowed'
              : 'border-border hover:border-bordeaux text-foreground'
          }`}
        >
          <ChevronLeft className='w-4 h-4' />
          Назад
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className='flex items-center gap-2 px-6 py-3 rounded-xl bg-bordeaux text-white 
              hover:bg-bordeaux-dark transition-colors'
          >
            Далее
            <ChevronRight className='w-4 h-4' />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={status === 'submitting'}
            className='flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white 
              hover:bg-green-700 transition-colors disabled:opacity-70'
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Отправка...
              </>
            ) : (
              <>
                <Send className='w-4 h-4' />
                Отправить заявку
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
```

### 13. Testimonial Carousel with Auto-Rotation

Карусель отзывов с автопрокруткой, паузой при наведении и расширенной навигацией.

```tsx
// components/catering/testimonial-carousel-enhanced.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote, Pause, Play } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  eventType: string;
  rating: number;
  image?: string;
  date?: string;
}

interface TestimonialCarouselEnhancedProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function TestimonialCarouselEnhanced({
  testimonials,
  autoPlayInterval = 6000,
  showDots = true,
  showArrows = true,
}: TestimonialCarouselEnhancedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance with pause control
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, autoPlayInterval, testimonials.length]);

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className='relative max-w-4xl mx-auto'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative quote mark */}
      <div className='absolute -top-6 left-1/2 -translate-x-1/2 text-bordeaux/10 pointer-events-none'>
        <Quote className='w-24 h-24' />
      </div>

      {/* Main carousel area */}
      <div className='overflow-hidden min-h-[350px] relative'>
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 25 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className='absolute inset-0 flex flex-col items-center justify-center px-4'
          >
            {/* Event type badge */}
            <span className='inline-block px-4 py-1 rounded-full bg-bordeaux/10 text-bordeaux 
              text-xs font-semibold uppercase tracking-wider mb-6'>
              {currentTestimonial.eventType}
            </span>

            {/* Stars rating */}
            <div className='flex gap-1 mb-6'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 transition-colors ${
                    i < currentTestimonial.rating
                      ? 'fill-gold text-gold'
                      : 'text-sand/30'
                  }`}
                />
              ))}
            </div>

            {/* Quote text */}
            <blockquote className='text-xl md:text-2xl lg:text-3xl font-light leading-relaxed 
              text-center text-cream/90 mb-8 max-w-3xl italic'>
              &ldquo;{currentTestimonial.quote}&rdquo;
            </blockquote>

            {/* Author info */}
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              {currentTestimonial.image && (
                <div className='w-16 h-16 rounded-full overflow-hidden ring-2 ring-bordeaux/30 ring-offset-2 ring-offset-night'>
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.author}
                    width={64}
                    height={64}
                    className='object-cover'
                  />
                </div>
              )}
              <div className='text-center sm:text-left'>
                <cite className='not-italic font-display text-lg text-white block'>
                  {currentTestimonial.author}
                </cite>
                <p className='text-cream/60 text-sm'>
                  {currentTestimonial.role}, {currentTestimonial.company}
                </p>
                {currentTestimonial.date && (
                  <p className='text-cream/40 text-xs mt-1'>{currentTestimonial.date}</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className='flex items-center justify-center gap-6 mt-10'>
        {/* Pause/Play button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className='w-10 h-10 rounded-full border border-sand/20 flex items-center justify-center
            text-cream/60 hover:text-white hover:border-sand/40 transition-colors'
          aria-label={isPaused ? 'Возпроизвести' : 'Пауза'}
        >
          {isPaused ? <Play className='w-4 h-4' /> : <Pause className='w-4 h-4' />}
        </button>

        {/* Previous arrow */}
        {showArrows && (
          <button
            onClick={prev}
            className='w-12 h-12 rounded-full border border-sand/30 flex items-center justify-center
              text-cream/60 hover:text-bordeaux hover:border-bordeaux transition-colors'
            aria-label='Предыдущий отзыв'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
        )}

        {/* Dots navigation */}
        {showDots && (
          <div className='flex gap-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-bordeaux'
                    : 'w-2 bg-sand/30 hover:bg-sand/50'
                }`}
                aria-label={`Перейти к отзыву ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
        )}

        {/* Next arrow */}
        {showArrows && (
          <button
            onClick={next}
            className='w-12 h-12 rounded-full border border-sand/30 flex items-center justify-center
              text-cream/60 hover:text-bordeaux hover:border-bordeaux transition-colors'
            aria-label='Следующий отзыв'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        )}

        {/* Counter */}
        <span className='text-cream/40 text-sm min-w-[48px] text-right'>
          {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
        </span>
      </div>

      {/* Progress bar for auto-play */}
      <div className='mt-4 h-0.5 bg-sand/10 rounded-full overflow-hidden'>
        <motion.div
          className='h-full bg-bordeaux rounded-full'
          initial={{ width: '0%' }}
          animate={!isPaused ? { width: '100%'' : { width: '0%' }}
          transition={{
            duration: autoPlayInterval / 1000,
            ease: 'linear',
          }}
          key={`${currentIndex}-${isPaused}`}
        />
      </div>
    </div>
  );
}
```

### 14. Image Hover Reveal (Gallery pattern)

Эффект смены изображения при наведении с плавным переходом.

```tsx
// components/catering/hover-reveal-image.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HoverRevealImageProps {
  defaultSrc: string;
  revealSrc: string;
  alt: string;
  defaultAlt?: string;
  revealAlt?: string;
  aspectRatio?: string;
  className?: string;
  overlay?: React.ReactNode;
}

export function HoverRevealImage({
  defaultSrc,
  revealSrc,
  alt,
  defaultAlt,
  revealAlt,
  aspectRatio = '4/3',
  className = '',
  overlay,
}: HoverRevealImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const handleTap = useCallback(() => {
    setIsTapped(!isTapped);
  }, [isTapped]);

  const showReveal = isHovered || isTapped;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Default image */}
      <motion.div
        className='absolute inset-0'
        animate={{ opacity: showReveal ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <Image
          src={defaultSrc}
          alt={defaultAlt || alt}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </motion.div>

      {/* Reveal image */}
      <motion.div
        className='absolute inset-0'
        animate={{ opacity: showReveal ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <Image
          src={revealSrc}
          alt={revealAlt || `${alt} - детальный вид`}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </motion.div>

      {/* Overlay content */}
      {overlay && (
        <motion.div
          className='absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent
            flex items-end p-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: showReveal ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {overlay}
        </motion.div>
      )}

      {/* Hint indicator for mobile */}
      <div className='absolute bottom-3 right-3 md:hidden'>
        <motion.span
          className='text-xs text-white/60 bg-black/30 px-2 py-1 rounded-full'
          animate={{ opacity: isTapped ? 0 : 1 }}
        >
          Нажмите
        </motion.span>
      </div>
    </motion.div>
  );
}

// Usage example in gallery:
// <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
//   <HoverRevealImage
//     defaultSrc='/images/banquet-wide.jpg'
//     revealSrc='/images/banquet-detail.jpg'
//     alt='Банкетный зал'
//     overlay={
//       <div>
//         <h3 className='text-white font-display text-lg'>Банкетный зал</h3>
//         <p className='text-cream/70 text-sm'>До 200 гостей</p>
//       </div>
     }
//   />
// </div>
```

### 15. Sticky CTA Sidebar (Conversion-focused)

Фиксированная кнопка CTA, появляющаяся после прокрутки.

```tsx
// components/catering/sticky-cta-sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Phone, CalendarDays } from 'lucide-react';

interface StickyCTAProps {
  text?: string;
  phone?: string;
  storageKey?: string;
  showAfterScroll?: number;
  position?: 'left' | 'right';
  variant?: 'button' | 'pill' | 'expanded';
}

export function StickyCTASidebar({
  text = 'Получить КП',
  phone = '+7 (999) 123-45-67',
  storageKey = 'sticky_cta_dismissed',
  showAfterScroll = 400,
  position = 'right',
  variant = 'pill',
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) {
      const expiry = parseInt(dismissed, 10);
      if (Date.now() < expiry) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed, showAfterScroll]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    // Store for 3 days
    const expiry = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem(storageKey, expiry.toString());
  }, [storageKey]);

  if (isDismissed) return null;

  const positionClasses = position === 'right' ? 'right-6' : 'left-6';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: position === 'right' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position === 'right' ? 50 : -50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className={`fixed bottom-6 ${positionClasses} z-50 flex flex-col items-end gap-3`}
        >
          {/* Expanded panel */}
          <AnimatePresence>
            {isExpanded && variant === 'expanded' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className='bg-night border border-sand/20 rounded-2xl p-4 shadow-2xl min-w-[240px]'
              >
                <p className='text-sm text-cream/80 mb-4'>
                  Оставьте заявку — перезвоним за 15 минут
                </p>
                
                <div className='space-y-3'>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className='flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-bordeaux/10 
                      transition-colors group'
                  >
                    <Phone className='w-5 h-5 text-bordeaux' />
                    <span className='text-sm group-hover:text-bordeaux transition-colors'>
                      {phone}
                    </span>
                  </a>
                  
                  <a
                    href='#contact'
                    className='flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-bordeaux/10 
                      transition-colors group'
                    onClick={() => setIsExpanded(false)}
                  >
                    <CalendarDays className='w-5 h-5 text-bordeaux' />
                    <span className='text-sm group-hover:text-bordeaux transition-colors'>
                      Забронировать дату
                    </span>
                  </a>
                  
                  <a
                    href='#contact'
                    className='flex items-center justify-center gap-2 w-full p-3 rounded-xl 
                      bg-bordeaux text-white hover:bg-bordeaux-dark transition-colors'
                    onClick={() => setIsExpanded(false)}
                  >
                    <MessageSquare className='w-4 h-4' />
                    <span className='text-sm font-medium'>Написать</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main button */}
          <div className='relative'>
            {/* Pulse animation */}
            <motion.div
              className='absolute inset-0 rounded-full bg-bordeaux/30'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.button
              onClick={() => {
                if (variant === 'expanded') {
                  setIsExpanded(!isExpanded);
                } else {
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className='relative flex items-center gap-2 px-6 py-4 bg-bordeaux text-white 
                rounded-full shadow-lg shadow-bordeaux/30 hover:bg-bordeaux-dark 
                transition-colors font-semibold'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className='w-5 h-5' />
              <span>{text}</span>
            </motion.button>

            {/* Dismiss button */}
            <button
              onClick={dismiss}
              className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sand text-night 
                flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity
                text-xs font-bold'
              aria-label='Скрыть'
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 16. Instagram Feed Integration (Social proof)

Интеграция ленты Instagram для демонстрации свежих работ.

```tsx
// components/catering/instagram-feed.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
  likeCount?: number;
  commentsCount?: number;
  timestamp?: string;
}

interface InstagramFeedProps {
  username?: string;
  limit?: number;
  showHeader?: boolean;
  showFollowButton?: boolean;
  gridCols?: 2 | 3 | 4 | 6;
}

// Mock data - replace with actual Instagram Graph API integration
const mockPosts: InstagramPost[] = Array.from({ length: 12 }, (_, i) => ({
  id: `post-${i}`,
  imageUrl: `/images/instagram/feed-${i + 1}.jpg`,
  permalink: `https://instagram.com/p/post${i + 1}`,
  caption: `Невероятное мероприятие! ✨ #catering #events #food`,
  likeCount: Math.floor(Math.random() * 500) + 50,
  commentsCount: Math.floor(Math.random() * 50),
}));

export function InstagramFeed({
  username = '@your_catering',
  limit = 9,
  showHeader = true,
  showFollowButton = true,
  gridCols = 3,
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchPosts = async () => {
      try {
        // In production, use Instagram Graph API:
        // const response = await fetch(`/api/instagram?limit=${limit}`);
        // const data = await response.json();
        // setPosts(data.data);
        
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        setPosts(mockPosts.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch Instagram posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    6: 'grid-cols-3 sm:grid-cols-6',
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses[gridCols]} gap-2`}>
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className='aspect-square bg-card rounded-lg animate-pulse'
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      {showHeader && (
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Instagram className='w-6 h-6 text-pink-500' />
            <div>
              <p className='font-medium'>{username}</p>
              <p className='text-sm text-muted'>Наши последние работы</p>
            </div>
          </div>
          
          {showFollowButton && (
            <a
              href={`https://instagram.com/${username.replace('@', '')}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-full 
                bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 
                text-white text-sm font-semibold hover:opacity-90 transition-opacity'
            >
              <Instagram className='w-4 h-4' />
              Подписаться
            </a>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${gridClasses[gridCols]} gap-2`}>
        {posts.map((post, index) => (
          <motion.a
            key={post.id}
            href={post.permalink}
            target='_blank'
            rel='noopener noreferrer'
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className='relative aspect-square group overflow-hidden rounded-lg'
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Instagram post'}
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-110'
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            />

            {/* Hover overlay */}
            <div
              className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center
                gap-3 transition-opacity duration-300 ${
                hoveredPost === post.id ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className='flex items-center gap-4 text-white'>
                <span className='flex items-center gap-1.5'>
                  <Heart className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    {post.likeCount?.toLocaleString()}
                  </span>
                </span>
                <span className='flex items-center gap-1.5'>
                  <MessageCircle className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    {post.commentsCount?.toLocaleString()}
                  </span>
                </span>
              </div>
              <ExternalLink className='w-5 h-5 text-white/80' />
            </div>

            {/* Instagram gradient overlay on corners */}
            <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r 
              from-purple-600 via-pink-600 to-orange-500 opacity-0 
              group-hover:opacity-100 transition-opacity' />
          </motion.a>
        ))}
      </div>

      {/* Footer link */}
      <div className='mt-6 text-center'>
        <a
          href={`https://instagram.com/${username.replace('@', '')}`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 text-muted hover:text-pink-500 transition-colors'
        >
          <span>Смотреть все фото в Instagram</span>
          <ExternalLink className='w-4 h-4' />
        </a>
      </div>
    </div>
  );
}
```

### 17. Content Filter System (GG Catering pattern)

Фильтрация галереи по типам мероприятий с анимированными переходами и URL-состоянием.

```tsx
// components/catering/content-filter-system.tsx
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface FilterableItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  subcategory?: string;
  title?: string;
  tags?: string[];
}

interface CategoryConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface ContentFilterSystemProps {
  items: FilterableItem[];
  categories?: CategoryConfig[];
  allowMultiple?: boolean;
  urlSync?: boolean;
  layout?: 'grid' | 'masonry';
}

const defaultCategories: CategoryConfig[] = [
  { id: 'all', label: 'Все работы' },
  { id: 'weddings', label: 'Свадьбы' },
  { id: 'corporate', label: 'Корпоративы' },
  { id: 'private', label: 'Частные' },
  { id: 'social', label: 'Социальные' },
];

export function ContentFilterSystem({
  items,
  categories = defaultCategories,
  allowMultiple = false,
  urlSync = true,
  layout = 'grid',
}: ContentFilterSystemProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [activeFilters, setActiveFilters] = useState<string[]>(
    allowMultiple ? [] : [initialCategory]
  );

  // Sync with URL
  useEffect(() => {
    if (urlSync && !allowMultiple) {
      const param = searchParams.get('category');
      if (param && param !== activeFilters[0]) {
        setActiveFilters([param]);
      }
    }
  }, [searchParams, urlSync, allowMultiple, activeFilters]);

  const toggleFilter = useCallback((categoryId: string) => {
    if (allowMultiple) {
      setActiveFilters(prev => {
        if (categoryId === 'all') return [];
        if (prev.includes(categoryId)) {
          return prev.filter(id => id !== categoryId);
        }
        return [...prev, categoryId];
      });
    } else {
      setActiveFilters([categoryId]);
      
      // Update URL without navigation
      if (urlSync && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (categoryId === 'all') {
          url.searchParams.delete('category');
        } else {
          url.searchParams.set('category', categoryId);
        }
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [allowMultiple, urlSync]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (allowMultiple) {
      if (activeFilters.length === 0) return items;
      return items.filter(item => activeFilters.includes(item.category));
    }
    
    if (activeFilters[0] === 'all' || activeFilters.length === 0) return items;
    return items.filter(item => item.category === activeFilters[0]);
  }, [items, activeFilters, allowMultiple]);

  // Update category counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? items.length : items.filter(i => i.category === cat.id).length,
    }));
  }, [categories, items]);

  const layoutClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    masonry: 'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4',
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className='flex flex-wrap justify-center gap-2 mb-10'>
        <AnimatePresence mode='popLayout'>
          {categoriesWithCounts.map(category => (
            <motion.button
              key={category.id}
              layout
              onClick={() => toggleFilter(category.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium
                transition-all duration-300 flex items-center gap-2 ${
                allowMultiple
                  ? activeFilters.includes(category.id)
                    ? 'bg-bordeaux text-white'
                    : 'bg-card border border-border hover:border-bordeaux/50'
                  : activeFilters[0] === category.id
                  ? 'bg-bordeaux text-white shadow-lg shadow-bordeaux/20'
                  : 'bg-card border border-border hover:border-bordeaux/50 text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.icon}
              <span>{category.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilters.includes(category.id)
                  ? 'bg-white/20 text-inherit'
                  : 'bg-sand/10 text-muted'
              }`}>
                {category.count}
              </span>

              {/* Active indicator animation */}
              {activeFilters.includes(category.id) && (
                <motion.div
                  layoutId='activeFilter'
                  className='absolute inset-0 rounded-full bg-bordeaux -z-10'
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Active filters display (for multi-select) */}
      {allowMultiple && activeFilters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='flex flex-wrap justify-center gap-2 mb-6'
        >
          {activeFilters.map(filterId => {
            const cat = categories.find(c => c.id === filterId);
            return (
              <span
                key={filterId}
                className='inline-flex items-center gap-1 px-3 py-1 rounded-full 
                  bg-bordeaux/10 text-bordeaux text-sm'
              >
                {cat?.label}
                <button
                  onClick={() => toggleFilter(filterId)}
                  className='hover:text-bordeaux-dark ml-1'
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            onClick={() => setActiveFilters([])}
            className='text-sm text-muted hover:text-foreground underline'
          >
            Сбросить
          </button>
        </motion.div>
      )}

      {/* Results count */}
      <p className='text-center text-muted text-sm mb-6'>
        Показано: {filteredItems.length} из {items.length} работ
      </p>

      {/* Items grid */}
      <motion.div
        layout
        className={layoutClasses[layout]}
      >
        <AnimatePresence mode='popLayout'>
          {filteredItems.map((item, index) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                layout === 'masonry' ? 'break-inside-avoid' : ''
              }`}
            >
              <div className='relative aspect-[4/3]'>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-110'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />

                {/* Hover overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5'>
                  <div>
                    {item.title && (
                      <h3 className='text-white font-display text-lg mb-1'>{item.title}</h3>
                    )}
                    <span className='text-cream/70 text-sm capitalize'>
                      {categories.find(c => c.id === item.category)?.label}
                    </span>
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {item.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className='text-xs px-2 py-0.5 rounded-full bg-white/10 text-cream/80'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center py-16'
        >
          <p className='text-muted text-lg mb-2'>Нет работ в этой категории</p>
          <button
            onClick={() => allowMultiple ? setActiveFilters([]) : toggleFilter('all')}
            className='text-bordeaux hover:underline'
          >
            Показать все работы
          </button>
        </motion.div>
      )}
    </div>
  );
}
```

### 18. Mobile-First Full-Screen Menu (67% of sites pattern)

Полноэкранное мобильное меню с анимацией появления элементов.

```tsx
// components/catering/mobile-fullscreen-menu.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

interface MobileMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: MobileMenuItem[];
}

interface MobileFullscreenMenuProps {
  items: MobileMenuItem[];
  logo?: React.ReactNode;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  socialLinks?: { platform: 'instagram' | 'facebook'; url: string }[];
}

const menuVariants = {
  closed: {
    clipPath: 'circle(0% at calc(100% - 40px) 40px)',
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  open: {
    clipPath: 'circle(150% at calc(100% - 40px) 40px)',
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: 20 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.075,
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
    },
  }),
};

export function MobileFullscreenMenu({
  items,
  logo,
  phone = '+7 (999) 123-45-67',
  email = 'info@catering.ru',
  address = 'Москва, ул. Примерная, 1',
  hours = 'Пн-Вс: 09:00 - 21:00',
  socialLinks = [],
}: MobileFullscreenMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={toggleMenu}
        className='lg:hidden relative z-50 w-11 h-11 flex items-center justify-center'
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isOpen}
      >
        <div className='flex flex-col gap-1.5 w-6'>
          <motion.span
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className='block h-0.5 w-full bg-current origin-center'
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
            className='block h-0.5 w-full bg-current'
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className='block h-0.5 w-full bg-current origin-center'
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          />
        </div>
      </button>

      {/* Full-screen menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='fixed inset-0 z-40 bg-night/95 backdrop-blur-xl lg:hidden'
              onClick={closeMenu}
            />

            {/* Menu content */}
            <motion.nav
              variants={menuVariants}
              initial='closed'
              animate='open'
              exit='closed'
              className='fixed inset-0 z-50 bg-night lg:hidden flex flex-col overflow-hidden'
            >
              {/* Header */}
              <div className='flex items-center justify-between p-6 pb-0'>
                {logo || (
                  <Link href='/' className='font-display text-2xl font-bold text-white'>
                    Logo
                  </Link>
                )}
                
                <button
                  onClick={closeMenu}
                  className='w-11 h-11 rounded-full border border-sand/20 flex items-center justify-center
                    text-white hover:bg-white/10 transition-colors'
                  aria-label='Закрыть меню'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Menu items */}
              <div className='flex-1 flex flex-col justify-center px-8 py-12'>
                <ul className='space-y-2'>
                  {items.map((item, index) => (
                    <motion.li
                      key={item.href}
                      custom={index}
                      variants={itemVariants}
                      initial='closed'
                      animate='open'
                      exit='closed'
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className='block py-4 text-4xl md:text-5xl font-display font-medium
                          text-white hover:text-bordeaux transition-colors group'
                      >
                        <span className='flex items-center gap-4'>
                          <span className='text-bordeaux/30 group-hover:text-bordeaux/60 
                            transition-colors text-2xl font-mono'>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {item.label}
                          <span className='ml-auto opacity-0 group-hover:opacity-100 
                            transition-opacity transform translate-x-4 group-hover:translate-x-0'>
                            →
                          </span>
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Footer info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className='px-8 pb-8 space-y-4'
              >
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-cream/60'>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className='flex items-center gap-3 hover:text-bordeaux transition-colors'
                  >
                    <Phone className='w-4 h-4' />
                    {phone}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className='flex items-center gap-3 hover:text-bordeaux transition-colors'
                  >
                    <Mail className='w-4 h-4' />
                    {email}
                  </a>
                  <span className='flex items-center gap-3'>
                    <MapPin className='w-4 h-4' />
                    {address}
                  </span>
                  <span className='flex items-center gap-3'>
                    <Clock className='w-4 h-4' />
                    {hours}
                  </span>
                </div>

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <div className='flex items-center gap-4 pt-4 border-t border-sand/10'>
                    {socialLinks.map(link => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='w-10 h-10 rounded-full border border-sand/20 flex items-center justify-center
                          text-cream/60 hover:text-bordeaux hover:border-bordeaux transition-colors'
                      >
                        {link.platform === 'instagram' ? (
                          <Instagram className='w-5 h-5' />
                        ) : (
                          <Facebook className='w-5 h-5' />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

## Usage Examples (Updated)

```tsx
// page.tsx — assembling all interactive components including new patterns
import { CustomCursor } from '@/components/motion/custom-cursor';
import { SiteHeader } from '@/components/catering/site-header';
import { ChapterNav } from '@/components/catering/chapter-nav';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { BackToTop } from '@/components/motion/back-to-top';
import { ParallaxLayer } from '@/components/motion/parallax-layers';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { TextScramble } from '@/components/motion/text-scramble';

// New components from 23-site analysis
import { AnnouncementBar } from '@/components/catering/announcement-bar';
import { MegaMenu } from '@/components/catering/mega-menu';
import { EnhancedGallery } from '@/components/catering/enhanced-gallery';
import { MultiStepBookingForm } from '@/components/catering/multi-step-form';
import { TestimonialCarouselEnhanced } from '@/components/catering/testimonial-carousel-enhanced';
import { HoverRevealImage } from '@/components/catering/hover-reveal-image';
import { StickyCTASidebar } from '@/components/catering/sticky-cta-sidebar';
import { InstagramFeed } from '@/components/catering/instagram-feed';
import { ContentFilterSystem } from '@/components/catering/content-filter-system';
import { MobileFullscreenMenu } from '@/components/catering/mobile-fullscreen-menu';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      
      {/* Seasonal announcement */}
      <AnnouncementBar
        message='Принимаем бронирования на 2026 год — ранние брони со скидкой 10%'
        variant='seasonal'
      />
      
      <SiteHeader />
      <ChapterNav />
      
      <main>
        {/* Hero with parallax */}
        <section id='hero' className='relative h-screen'>
          <ParallaxLayer speed={0.3}>
            <HeroContent />
          </ParallaxLayer>
        </section>

        {/* Stats section */}
        <section id='about'>
          <AnimatedStats stats={[
            { value: 16, suffix: '+', label: 'Лет опыта' },
            { value: 2400, suffix: '+', label: 'Мероприятий' },
            { value: 50000, suffix: '+', label: 'Гостей обслужено' },
            { value: 98, suffix: '%', label: 'Довольных клиентов' },
          ]} />
        </section>

        {/* Filterable gallery */}
        <section id='gallery'>
          <ContentFilterSystem items={galleryImages} />
        </section>

        {/* Enhanced testimonials */}
        <section id='testimonials'>
          <TestimonialCarouselEnhanced testimonials={testimonialsData} />
        </section>

        {/* Instagram feed */}
        <section id='social'>
          <InstagramFeed username='@your_catering' limit={9} />
        </section>

        {/* Multi-step booking form */}
        <section id='booking'>
          <MultiStepBookingForm />
        </section>

        {/* CTA with magnetic effect */}
        <MagneticButton className='bg-bordeaux text-white px-8 py-4 rounded-full'>
          Рассчитать стоимость
        </MagneticButton>
      </main>

      {/* Conversion-focused sticky sidebar */}
      <StickyCTASidebar text='Получить КП' variant='expanded' />
      
      <BackToTop />
    </>
  );
}
```

## Performance Notes (Updated)

1. **Lazy mount** — dynamic import heavy components (especially Gallery, Carousel)
2. **will-change** — only on actively animating elements
3. **requestAnimationFrame** — for scroll handlers
4. **Debounce** — resize/input handlers
5. **GPU compositing** — transform/opacity only
6. **Image optimization** — use next/image with proper sizes for all gallery images
7. **Intersection Observer** — lazy load off-screen carousels/galleries
8. **localStorage persistence** — cache user preferences (dismissed bars, etc.)
9. **Touch event handling** — passive listeners for mobile performance
10. **Animation cleanup** — clear intervals/timeouts on unmount

## References

- [Framer Motion Examples](https://www.framer.com/motion/examples/)
- [Interaction Design Patterns](https://www.interaction-design.org/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Google Web Dev Interaction Patterns](https://web.dev/patterns/)
