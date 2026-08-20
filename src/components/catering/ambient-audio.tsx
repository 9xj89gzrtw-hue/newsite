"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

/**
 * AmbientAudio — procedural ambient sound via Web Audio API.
 *
 * Phase 10 P2 wow-factor pattern (AGENTS.md §14 "Manifesto ambient audio cue").
 *
 * No audio file needed — generates procedural ambient sound using:
 * - Low-frequency brown noise (kitchen hum / ventilation sound)
 * - Soft oscillator tones (random sine waves at low frequencies, like
 *   distant kitchen clinks)
 * - Gentle gain envelope (3s fade-in, 1.5s fade-out)
 *
 * Audio starts when user clicks the "Enable sound" button (browser autoplay
 * policy requires user gesture). Once enabled, audio continues while the
 * parent section is in viewport. When section exits viewport, audio fades
 * out. When section re-enters, audio fades back in.
 *
 * Mute button in top-right corner toggles audio on/off.
 *
 * Reduced-motion users: no audio button shown (vestibular safety — audio
 * can trigger sensory overload for some users). The data-audio-cue attribute
 * is still set on the section for screen readers.
 *
 * RULES §3 compliance: no audio file hosted in /public. All sound is
 * synthesized at runtime via Web Audio API. No external CDN dependency.
 */

export function AmbientAudio() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Detect when manifesto section is in viewport
  useEffect(() => {
    if (!mounted) return;
    const section = document.getElementById("manifesto");
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setInView(e.isIntersecting);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [mounted]);

  // Create / destroy audio graph based on `enabled` state
  useEffect(() => {
    if (!enabled) {
      // Tear down audio graph
      if (audioCtxRef.current) {
        oscillatorsRef.current.forEach((osc) => osc.stop());
        oscillatorsRef.current = [];
        if (noiseSourceRef.current) {
          noiseSourceRef.current.stop();
          noiseSourceRef.current = null;
        }
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        masterGainRef.current = null;
      }
      return;
    }

    // Build audio graph (procedural ambient sound)
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    // Master gain (initially 0, fade in)
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // 1. Brown noise (kitchen hum) — generated from random buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise: integrate white noise with 0.02 leak
      lastOut = (lastOut + 0.02 * white) / 1.02;
      output[i] = lastOut * 3.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 400; // Cut high frequencies — just the rumble
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08; // Subtle
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);
    noiseSource.start();
    noiseSourceRef.current = noiseSource;

    // 2. Random soft sine tones (distant kitchen clinks)
    // 3 oscillators at low frequencies, randomly retriggered
    const baseFreqs = [110, 165, 220]; // A2, E3, A3 — soft chord
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0;
      osc.connect(oscGain).connect(master);
      osc.start();

      // Random amplitude envelope — gentle pulsing
      const pulseGain = () => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        const now = ctx.currentTime;
        const target = 0.015 + Math.random() * 0.025; // 0.015-0.04 gain
        const attackTime = 0.5 + Math.random() * 1.5;
        oscGain.gain.cancelScheduledValues(now);
        oscGain.gain.setValueAtTime(oscGain.gain.value, now);
        oscGain.gain.linearRampToValueAtTime(target, now + attackTime);
        oscGain.gain.linearRampToValueAtTime(0, now + attackTime + 2 + Math.random() * 3);

        // Schedule next pulse with random delay
        const nextDelay = (attackTime + 5 + Math.random() * 8) * 1000;
        const timerId = setTimeout(pulseGain, nextDelay);
        timersRef.current.push(timerId);
      };
      // Stagger initial pulses
      setTimeout(pulseGain, i * 1500 + Math.random() * 2000);

      oscillatorsRef.current.push(osc);
    });

    return () => {
      // Clear all pending timers to prevent memory leaks
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      oscillatorsRef.current.forEach((osc) => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
      oscillatorsRef.current = [];
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch { /* already stopped */ }
        noiseSourceRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      masterGainRef.current = null;
    };
  }, [enabled]);

  // Fade in/out based on `inView` (when audio is enabled)
  useEffect(() => {
    if (!enabled || !masterGainRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const target = inView ? 0.5 : 0; // 0.5 = audible but subtle; 0 = silent
    const fadeTime = inView ? 3 : 1.5;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
    masterGainRef.current.gain.linearRampToValueAtTime(target, now + fadeTime);
  }, [inView, enabled]);

  // Reduced-motion users: no audio button (vestibular safety)
  if (prefersReducedMotion) return null;

  return (
    <button
      type="button"
      onClick={() => setEnabled((e) => !e)}
      aria-pressed={enabled}
      aria-label={enabled ? "Выключить ambient звук манифеста" : "Включить ambient звук манифеста"}
      title={enabled ? "Звук включен — нажмите чтобы выключить" : "Включить ambient звук (мягкий кухонный гул)"}
      className="fixed right-6 top-24 z-50 inline-flex size-10 items-center justify-center rounded-full border border-gold/40 bg-ink/85 text-gold backdrop-blur-md transition-all hover:scale-110 hover:border-gold hover:bg-ink hover:shadow-lg hover:shadow-gold/30 min-h-[44px] min-w-[44px] hidden md:flex"
    >
      {enabled ? (
        <Volume2 className="size-4" />
      ) : (
        <VolumeX className="size-4 opacity-60" />
      )}
      {/* Pulsing ring when audio is active */}
      {enabled && inView && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full border border-gold/60"
          style={{
            animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
      )}
    </button>
  );
}
