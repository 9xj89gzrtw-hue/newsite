/**
 * EXTRACTED GSAP ANIMATIONS FROM CATERING REFERENCE SITES
 * =======================================================
 * Source: 15 catering websites (Wolfgang Puck, Gamma Catering, etc.)
 * Libraries: GSAP 3.x + ScrollTrigger + Lenis (smooth scroll)
 * 
 * USAGE: Copy/paste these patterns into your Next.js project.
 *        Install: npm install gsap @gsap/react (for hooks)
 */

// ============================================================================
// 1. HERO ANIMATION WITH RESPONSIVE BREAKPOINTS (from gammacatering.com)
// ============================================================================
// Pattern: Staggered card entrance animation that adapts to mobile/tablet/desktop

/*
 * FULL IMPLEMENTATION PATTERN:
 * - Uses gsap.matchMedia() for responsive breakpoints
 * - Sets initial states with gsap.set()
 * - Creates timeline with power3.out easing
 * - Respects prefers-reduced-motion
 */
(function() {
  var root = document.getElementById('hero-section');
  if (!root) return;
  
  function initHeroAnim() {
    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('anim-complete'); // Fallback: show end state via CSS
      return;
    }
    
    var left = root.querySelector('.card--left');
    var right = root.querySelector('.card--right');
    var center = root.querySelector('.card--center');
    var intro = root.querySelector('.intro-text');
    var actions = root.querySelector('.cta-actions');
    
    // Responsive position config
    gsap.matchMedia().add({
      isMobile: '(max-width: 47.9375rem)',
      isTablet: '(min-width: 48rem) and (max-width: 63.9375rem)',
      isDesktop: '(min-width: 64rem)'
    }, function(ctx) {
      var c = ctx.conditions;
      // Different positions per breakpoint
      var P = c.isMobile 
        ? { lX:'-5.05rem', lY:'-1.85rem', rX:'2.27rem', rY:'-1.25rem', cY:'0rem', stackY:'1.5rem', startY:'4rem' }
        : { /* desktop values */ };
      
      // Set initial hidden state
      gsap.set([left, right], { x: '-.25rem', y: P.stackY, rotation: 0, opacity: 0, scale: .96 });
      gsap.set(center, { x: '-.25rem', y: P.startY, rotation: 0, opacity: 0 });
      gsap.set([intro, actions], { opacity: 0 });
      
      // Animate in
      var tl = gsap.timeline({ delay: .35, defaults: { ease: 'power3.out' } });
      tl.to(center, { opacity: 1, duration: .8 })
        .to([left, right], { opacity: 1, scale: 1, duration: .7 }, '-=0.4')
        .to([intro, actions], { opacity: 1, duration: .5 }, '-=0.3');
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAnim);
  } else {
    initHeroAnim();
  }
})();

// ============================================================================
// 2. INFINITE MARQUEE / TEXT SCROLL (from gammacatering.com)
// ============================================================================
// Pattern: Continuous horizontal scroll for images or text

/*
 * IMPLEMENTATION:
 * - Uses GSAP for seamless infinite loop
 * - No external slider library needed for text
 * - For image marquee, they use Splide with AutoScroll extension
 */

// Text Marquee (GSAP only)
function initTextMarquee() {
  document.querySelectorAll('.marquee-text').forEach(function(container) {
    var el = container.querySelector('.marquee-content');
    if (!el) return;
    
    // Clone content for seamless loop
    var clone = el.cloneNode(true);
    el.parentNode.appendChild(clone);
    
    // Animate both original and clone
    gsap.to([el, clone], {
      xPercent: -50,
      ease: 'none',
      duration: 35,
      repeat: -1
    });
  });
}

// Image Marquee (Splide + AutoScroll)
function initImageMarquee() {
  if (typeof Splide === 'undefined') return;
  
  document.querySelectorAll('.marquee-slider').forEach(function(wrapper) {
    var track = wrapper.querySelector('.marquee-track');
    if (!track || track.dataset.initialized) return;
    
    track.classList.add('splide');
    new Splide(track, {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      perPage: 1,
      autoWidth: true,
      gap: '12px',
      arrows: false,
      pagination: false,
      autoScroll: {
        speed: 0.5,
        pauseOnHover: true,
        pauseOnFocus: false
      }
    }).mount(window.SplideAutoscroll);
    
    track.dataset.initialized = 'true';
  });
}

// ============================================================================
// 3. SMOOTH SCROLL WITH LENIS + GSAP INTEGRATION (from gammacatering.com)
// ============================================================================
// Pattern: Smooth scrolling synced with ScrollTrigger

/*
 * CONFIGURATION:
 * - Lenis for smooth scroll behavior
 * - GSAP ScrollTrigger integration
 * - Respects prefers-reduced-motion
 * - Anchor link smooth scroll support
 */

function initSmoothScroll() {
  var allowSmooth = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!allowSmooth) return;
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  
  var lenis = new Lenis({
    duration: 1.8,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.6,
    touchMultiplier: 1.8,
    infinite: false
  });
  
  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  
  // Handle anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.8 });
      }
    });
  });
  
  window.lenis = lenis; // Expose globally if needed
}

// ============================================================================
// 4. HEADER STATE ON SCROLL (from gammacatering.com)
// ============================================================================
// Pattern: Toggle header class based on hero visibility

/*
 * Uses IntersectionObserver to detect when hero leaves viewport
 * Toggles class like 'header-onred' for style changes
 */
(function() {
  var root = document.getElementById('hero');
  if (!root) return;
  
  var sentinel = root.querySelector('.sentinel-element');
  if (!sentinel || !('IntersectionObserver' in window)) return;
  
  var io = new IntersectionObserver(function(entries) {
    document.body.classList.toggle('header-scrolled', !entries[0].isIntersecting);
  }, { threshold: 0 });
  
  io.observe(sentinel);
})();

// ============================================================================
// 5. UTILITY PATTERNS FOR NEXT.JS REACT COMPONENTS
// ============================================================================

// Convert to React hook pattern:
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Hero Animation Hook
export function useHeroAnimation(heroRef, options = {}) {
  const { delay = 0.35, ease = 'power3.out' } = options;
  
  useEffect(() => {
    if (!heroRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const ctx = gsap.context(() => {
      const elements = heroRef.current.querySelectorAll('[data-animate]');
      
      gsap.set(elements, { opacity: 0, y: 30 });
      
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        delay,
        ease,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 80%'
        }
      });
    }, heroRef);
    
    return () => ctx.revert();
  }, [delay, ease]);
}

// Marquee Component Pattern
export function useMarquee(marqueeRef, speed = 35) {
  useEffect(() => {
    if (!marqueeRef.current) return;
    
    const content = marqueeRef.current.querySelector('.marquee-content');
    if (!content) return;
    
    const clone = content.cloneNode(true);
    marqueeRef.current.appendChild(clone);
    
    const ctx = gsap.context(() => {
      gsap.to([content, clone], {
        xPercent: -50,
        ease: 'none',
        duration: speed,
        repeat: -1
      });
    }, marqueeRef);
    
    return () => ctx.revert();
  }, [speed]);
}

// Smooth Scroll Hook
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const allowSmooth = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!allowSmooth) return;
    
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.6,
      touchMultiplier: 1.8
    });
    
    lenis.on('scroll', ScrollTrigger.update);
    
    const raf = (time) => {
      lenis.raf(time * 1000);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    
    return () => lenis.destroy();
  }, []);
}

// ============================================================================
// 6. COMMON GSAP SNIPPETS (Quick Reference)
// ============================================================================

// Fade in element
gsap.from(element, { opacity: 0, duration: 0.5 });

// Slide up with fade
gsap.from(element, { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out' });

// Stagger children
gsap.from(children, { 
  opacity: 0, 
  y: 30, 
  stagger: 0.1, 
  duration: 0.6,
  ease: 'power2.out'
});

// Scroll-triggered animation
gsap.to(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  },
  opacity: 1,
  x: 0
});

// Parallax effect
gsap.to(background, {
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  },
  y: -100
});

// Infinite loop (marquee)
gsap.to(element, {
  xPercent: -50,
  ease: 'none',
  duration: 20,
  repeat: -1
});

// Timeline sequence
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from(header, { y: -100, opacity: 0 })
  .from(content, { opacity: 0, y: 50 }, '-=0.3')
  .from(cta, { opacity: 0, scale: 0.9 }, '-=0.2');

// Match media responsive
gsap.matchMedia().add({
  isMobile: '(max-width: 768px)',
  isDesktop: '(min-width: 769px)'
}, (context) => {
  const { isMobile, isDesktop } = context.conditions;
  // Different animations per breakpoint
});
