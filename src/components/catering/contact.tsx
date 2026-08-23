"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Send,
  ShieldCheck,
  Send as Telegram,
  Users as VkIcon,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  PartyPopper,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import { Reveal } from "./reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { CONTACTS, YANDEX_MAPS } from "@/lib/media";
import { MENU_TYPES } from "@/lib/pricing";

const STEPS = ["Тип мероприятия", "Гости и дата", "Контакты", "Отправить"];
const DRAFT_KEY = "catering-lead-draft";

// Russian phone regex. Matches +7/7/8 prefix + 10 digits, or bare 10/11 digits.
// The validation in stepValid() strips everything except + and digits first,
// so this runs against the compact form: "+79991234567" / "89991234567" / "79991234567".
const PHONE_REGEX = /^(\+7|7|8)?\d{10}$/;

/**
 * Cycle 40 fix (CRITICAL): the client regex accepts bare 10-digit input
 * ("9991234567") but /api/lead rejects it with 400 — the most common way
 * people type phone numbers KILLED the lead submission. Normalize every
 * accepted shape to the canonical +7XXXXXXXXXX before POST.
 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "+7" + digits;
  if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
  return raw.trim();
}

/** Snapshot from the calculator (catering:calc-lead) — appended to the
 *  lead message so the manager sees the estimate the client saw. */
type CalcSnapshot = {
  total?: number;
  addons?: string[];
};

type LeadData = {
  eventType: string;
  guests: number;
  date: string;
  name: string;
  phone: string;
  email: string;
  preferredTime: string;
  consent: boolean;
};

type FormStatus = "idle" | "loading" | "success" | "error";

const EMPTY: LeadData = {
  eventType: "",
  guests: 50,
  date: "",
  name: "",
  phone: "",
  email: "",
  preferredTime: "",
  consent: false,
};

// Office hours configuration
const OFFICE_HOURS = {
  weekdays: "Пн–Пт: 9:00 – 19:00",
  saturday: "Сб: 10:00 – 16:00",
  sunday: "Вс: закрыто",
  note: "Экстренные заявки принимаем 24/7",
};

/**
 * Compute whether the office is currently open.
 * Returns { open: boolean; nextLabel: string } for the badge.
 */
function useOfficeStatus() {
  const [status, setStatus] = useState<{ open: boolean; nextLabel: string }>({
    open: false,
    nextLabel: "",
  });
  useEffect(() => {
    const compute = () => {
      const now = new Date();
      // Use Europe/Moscow timezone per project convention (Russian company).
      // For simplicity, treat SPb local time (UTC+3) via Europe/Moscow.
      const fmt = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = fmt.formatToParts(now);
      const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
      const hr = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const min = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const time = hr * 60 + min;
      const day = wd.toLowerCase();
      let open = false;
      let nextLabel = "";
      if (["mon", "tue", "wed", "thu", "fri"].includes(day)) {
        open = time >= 9 * 60 && time < 19 * 60;
        nextLabel = open ? "до 19:00" : (time < 9 * 60 ? "откроется в 9:00" : "откроется в пн в 9:00");
      } else if (day === "sat") {
        open = time >= 10 * 60 && time < 16 * 60;
        nextLabel = open ? "до 16:00" : (time < 10 * 60 ? "откроется в 10:00" : "откроется в пн в 9:00");
      } else {
        // Sun
        open = false;
        nextLabel = "откроется в пн в 9:00";
      }
      setStatus({ open, nextLabel });
    };
    compute();
    const id = setInterval(compute, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/**
 * Floating label input component with gold focus glow + real-time validation.
 * On blur: if a `validate` prop is passed and the value passes, show a sage
 * CheckCircle2 next to the input. This rewards correct typing and reduces
 * "submit → error → fix" round-trips.
 */
function FloatingInput({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  icon: Icon,
  validate,
  ariaLabelText,
  required,
  pattern,
}: {
  id: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  validate?: (value: string) => boolean;
  ariaLabelText?: string;
  required?: boolean;
  pattern?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  // Real-time validation on blur: if validator passes, mark valid
  const onBlur = () => {
    setFocused(false);
    setTouched(true);
    if (validate && value) {
      setIsValid(validate(value));
    } else {
      setIsValid(false);
    }
  };

  // Show sage check only when: not focused (so user finished typing), value present, validator passed
  const showValidCheck = !focused && touched && hasValue && isValid && !error;

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border bg-cream/50 transition-all duration-300 ${
          error
            ? "border-bordeaux/50 bg-bordeaux/5"
            : focused
            ? "border-gold bg-white shadow-[0_0_20px_rgba(196,149,106,0.15)]"
            : "border-border-line"
        }`}
      >
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            focused ? "text-gold" : "text-ink/70"
          }`}>
            <Icon className="size-4" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `error-${id}` : undefined}
          aria-label={ariaLabelText || placeholder}
          aria-required={required ? "true" : undefined}
          required={required}
          pattern={pattern}
          className={`w-full rounded-xl px-${Icon ? '11' : '4'} py-3.5 ${showValidCheck ? 'pr-12' : 'pr-4'} text-ink outline-none transition-all placeholder:text-transparent ${
            Icon ? 'pl-11' : ''
          }`}
        />
        {/* Real-time validation check — sage CheckCircle2 on blur if valid */}
        <AnimatePresence>
          {showValidCheck && (
            <motion.span
              key="valid-check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sage"
              aria-hidden="true"
            >
              <CheckCircle2 className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-${Icon ? '11' : '4'} top-1/2 -translate-y-1/2 text-sm transition-all duration-300 ${
            Icon ? 'left-11' : 'left-4'
          } ${
            focused || hasValue
              ? `-top-2.5 ${Icon ? 'left-8' : 'left-3'} bg-white px-1 text-sm font-medium text-ink`
              : `text-ink/70 ${Icon ? 'text-ink/70' : ''}`
          }`}
        >
          {placeholder}
        </label>
      </div>
      {/* Error shake animation */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`error-${id}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-bordeaux"
          >
            <AlertCircle className="size-3" />
            Проверьте поле «{placeholder}»
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Enhanced contact card with hover lift, glow, and tooltip
 */
function ContactCard({
  icon: Icon,
  href,
  label,
  sublabel,
  external,
  highlight,
  isStatic,
  badge,
  tooltip,
  ariaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  label: string;
  sublabel?: string;
  external?: boolean;
  highlight?: boolean;
  isStatic?: boolean;
  badge?: string;
  tooltip?: string;
  ariaLabel?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const content = (
    <motion.div
      tabIndex={-1}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300"
      style={{
        borderColor: highlight && hovered ? "rgba(196,149,106,0.6)" : undefined,
        transform: hovered && !prefersReducedMotion ? "translateY(-4px)" : undefined,
        boxShadow: hovered 
          ? "0 12px 40px -10px rgba(196,149,106,0.25), 0 0 0 1px rgba(196,149,106,0.1)" 
          : "0 4px 20px -5px rgba(0,0,0,0.05)",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          background: highlight 
            ? "linear-gradient(135deg, rgba(196,149,106,0.08), rgba(196,112,74,0.04))" 
            : "linear-gradient(135deg, rgba(196,149,106,0.05), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon container */}
      <motion.div
        className="relative flex size-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
        style={{
          borderColor: highlight 
            ? hovered ? "rgba(196,149,106,0.8)" : "rgba(196,149,106,0.3)"
            : hovered ? "rgba(196,149,106,0.5)" : "var(--border-line)",
          background: highlight 
            ? hovered ? "rgba(196,149,106,0.15)" : "rgba(196,149,106,0.08)"
            : hovered ? "rgba(196,149,106,0.06)" : "white",
        }}
        animate={
          !prefersReducedMotion && hovered
            ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
            : {}
        }
        transition={{ duration: 0.4 }}
      >
        <Icon
          className={`size-5 transition-colors duration-300 ${
            highlight || hovered ? "text-gold" : "text-ink/70"
          }`}
        />
        
        {/* Pulse ring on hover */}
        {!prefersReducedMotion && highlight && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-gold/40"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={hovered ? { scale: 1.4, opacity: 0 } : {}}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={`truncate transition-colors duration-300 ${
            highlight ? "font-display text-lg text-ink" : "text-sm font-medium text-ink/80"
          }`}
        >
          {label}
        </span>
        {badge && (
          <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            {badge}
          </span>
        )}
      </div>

      {/* Sublabel / Tooltip */}
      <AnimatePresence>
        {(sublabel || (tooltip && hovered)) && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="shrink-0 text-xs text-gold/80"
          >
            {hovered ? (tooltip || sublabel) : sublabel}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Arrow indicator */}
      {href && !isStatic && (
        <motion.span
          aria-hidden="true"
          className="shrink-0 text-ink/30 transition-colors group-hover:text-gold"
          animate={!prefersReducedMotion && hovered ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          →
        </motion.span>
      )}
    </motion.div>
  );

  if (isStatic) return content;

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel || label} className="block">
        {content}
      </a>
    );
  }

  if (href) {
    return <a href={href} aria-label={ariaLabel || label} className="block">{content}</a>;
  }

  return null;
}

/** Success confetti particles */
function ConfettiParticles() {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return (
      <div className="flex items-center justify-center py-8">
        <CheckCircle2 className="size-16 text-sage" />
      </div>
    );
  }

  const colors = ["#C4956A", "#C4704A", "#7D8470", "#D4915A", "#E8B889"];
  
  return (
    <div className="relative h-32 w-full overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: "-10px",
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: [0, 120 + Math.random() * 80],
            opacity: [1, 1, 0],
            rotate: [0, Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Central checkmark */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-sage/15 shadow-lg">
          <CheckCircle2 className="size-8 text-sage" />
        </div>
      </motion.div>
    </div>
  );
}

/** Summary row for the review step */
function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm text-ink/70">
        <Icon className="size-4 text-gold" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </li>
  );
}

/**
 * Office hours display component
 */
function OfficeHours() {
  const status = useOfficeStatus();
  return (
    <div className="rounded-xl border border-border-line bg-cream/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-gold" />
          <span className="text-sm font-medium text-ink">Часы работы</span>
        </div>
        {/* Live "open/closed" badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${
            status.open
              ? "border-sage/40 bg-sage/15 text-sage"
              : "border-bordeaux/30 bg-bordeaux/5 text-bordeaux"
          }`}
          title={status.nextLabel}
        >
          <motion.span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${status.open ? "bg-sage" : "bg-bordeaux"}`}
            animate={status.open ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {status.open ? "Открыто" : "Закрыто"}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm text-ink/70">
        <li className="flex justify-between">
          <span>{OFFICE_HOURS.weekdays}</span>
        </li>
        <li className="flex justify-between">
          <span>{OFFICE_HOURS.saturday}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-ink/70">{OFFICE_HOURS.sunday}</span>
        </li>
      </ul>
      <p className="mt-3 border-t border-border-line pt-3 text-xs text-gold/80 italic">
        ✨ {OFFICE_HOURS.note}
      </p>
      {!status.open && status.nextLabel && (
        <p className="mt-1 text-[12px] text-ink/70">
          {status.nextLabel}
        </p>
      )}
    </div>
  );
}

/**
 * Social proof badge near form
 */
function SocialProofBadge() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      className="flex items-center gap-3 rounded-full border border-gold/20 bg-gold/5 px-4 py-2.5"
      animate={!prefersReducedMotion ? {
        boxShadow: [
          "0 0 0 0 rgba(196,149,106,0.1)",
          "0 0 15px 2px rgba(196,149,106,0.15)",
          "0 0 0 0 rgba(196,149,106,0.1)",
        ],
      } : {}}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      <div className="relative">
        <Sparkles className="size-4 text-gold" />
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-sage animate-pulse" />
      </div>
      <span className="text-sm font-medium text-ink/80">
        Ответим в течение <span className="text-gold font-semibold">15 минут</span>
      </span>
    </motion.div>
  );
}

/**
 * Decorative gold line element
 */
function GoldLine({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent ${className}`} />
  );
}

/**
 * Decorative dot pattern
 */
function DotPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`${className}`}
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[...Array(36)].map((_, i) => (
        <circle
          key={i}
          cx={(i % 6) * 12 + 6}
          cy={Math.floor(i / 6) * 12 + 6}
          r="1.5"
          fill="currentColor"
          className="text-gold/20"
        />
      ))}
    </svg>
  );
}

/**
 * Contact section — multi-step lead form with enhanced UX.
 *
 * Features:
 * - Animated contact cards with hover effects & tooltips
 * - Floating label inputs with gold focus glow
 * - Form submission states: loading spinner, success confetti, error shake
 * - Office hours display & social proof
 * - Decorative elements (gold lines, dots)
 * - Respects prefers-reduced-motion
 */
export function Contact() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LeadData>(EMPTY);
  // Cycle 40: estimate snapshot from the calculator — appended to the
  // outgoing lead so «Отправить заявку с расчётом» keeps its promise.
  const [calcSnapshot, setCalcSnapshot] = useState<CalcSnapshot | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Restore draft on mount + URL-param prefill (Cycle 39: ?type=X&guests=Y
  // from the calculator share-links / direct visits now seed the form too —
  // previously only the CustomEvent path prefilled).
  useEffect(() => {
    let restored: Partial<LeadData> = {};
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) restored = JSON.parse(raw) as Partial<LeadData>;
    } catch {
      // ignore — non-critical.
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      const guests = params.get("guests");
      if (type && MENU_TYPES.some((m) => m.id === type)) {
        restored.eventType = type;
      }
      if (guests) {
        const g = Number.parseInt(guests, 10);
        if (Number.isFinite(g) && g >= 1) restored.guests = g;
      }
    } catch {
      // ignore — non-critical.
    }
    if (Object.keys(restored).length > 0) {
      setData({ ...EMPTY, ...restored });
    }
  }, []);

  // Cycle 38 fix: pre-fill from the calculator ("Отправить заявку с расчётом"
  // dispatches catering:calc-lead with {typeId, guests, date}) — the user's
  // calculation is carried into the form instead of being silently dropped.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{
        typeId?: string;
        guests?: number;
        date?: string;
        total?: number;
        addons?: string[];
      }>).detail;
      if (!detail) return;
      setCalcSnapshot({ total: detail.total, addons: detail.addons });
      setData((d) => ({
        ...d,
        eventType:
          detail.typeId && MENU_TYPES.some((m) => m.id === detail.typeId)
            ? detail.typeId
            : d.eventType,
        guests:
          typeof detail.guests === "number" && detail.guests >= 1
            ? detail.guests
            : d.guests,
        date: detail.date || d.date,
      }));
    };
    window.addEventListener("catering:calc-lead", handler);
    return () => window.removeEventListener("catering:calc-lead", handler);
  }, []);

  // Persist draft on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      // ignore.
    }
  }, [data]);

  const set = useCallback(<K extends keyof LeadData>(key: K, value: LeadData[K]) =>
    setData((d) => ({ ...d, [key]: value })),
  []);

  const stepValid = (): boolean => {
    if (step === 0) return Boolean(data.eventType);
    if (step === 1) return data.guests >= 1;
    if (step === 2) {
      const nameValid = data.name.trim().length > 1;
      const phoneValid = PHONE_REGEX.test(data.phone.replace(/[^+0-9]/g, ""));
      return nameValid && phoneValid;
    }
    return data.consent;
  };

  const next = () => {
    if (step === 2) {
      const nameValid = data.name.trim().length > 1;
      const phoneValid = PHONE_REGEX.test(data.phone.replace(/[^+0-9]/g, ""));
      setValidationErrors({ name: !nameValid, phone: !phoneValid });
      if (!nameValid || !phoneValid) return;
    }
    if (stepValid()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      setValidationErrors({});
    }
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    setValidationErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }

    setFormStatus("loading");
    
    try {
      const menuType = MENU_TYPES.find((m) => m.id === data.eventType);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: normalizePhone(data.phone),
          email: data.email || undefined,
          eventType: data.eventType || undefined,
          guests: data.guests,
          message: [
            data.date && `Желаемая дата: ${data.date}`,
            data.preferredTime && `Желаемое время звонка: ${data.preferredTime}`,
            calcSnapshot?.total &&
              `Расчёт с сайта: ~${calcSnapshot.total.toLocaleString("ru-RU")} ₽` +
                (calcSnapshot.addons?.length
                  ? ` (доп. услуги: ${calcSnapshot.addons.join(", ")})`
                  : ""),
          ].filter(Boolean).join("\n") || undefined,
          consentAccepted: true,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setFormStatus("success");
      toast.success("Заявка отправлена! Перезвоним в течение 15 минут.");
      
      // Reset after showing success state (Cycle 39: 2.5s was too fast —
      // the visitor never registered the confirmation before it vanished).
      setTimeout(() => {
        setData(EMPTY);
        setStep(0);
        setFormStatus("idle");
        try {
          window.localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore.
        }
      }, 6000);
    } catch (err) {
      setFormStatus("error");
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        toast.error("Нет связи с сервером. Проверьте интернет-соединение.");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не удалось отправить. Позвоните нам напрямую.");
      }
      
      setTimeout(() => setFormStatus("idle"), 2000);
    }
  };

  const menuLabel =
    MENU_TYPES.find((m) => m.id === data.eventType)?.label ?? "—";

  return (
    <section
      id="contact"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-cream-2 py-24 md:py-36"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-l from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-r from-terracotta/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Decorative gold lines */}
      <GoldLine className="absolute top-24 left-0 right-0" />
      <GoldLine className="absolute bottom-24 left-0 right-0" />

      {/* Decorative dots */}
      <DotPattern className="absolute top-32 right-8 hidden md:block opacity-40" />
      <DotPattern className="absolute bottom-32 left-8 hidden md:block opacity-40" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <div className="mb-14 text-center md:mb-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-gold animate-pulse" />
              Контакты
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.1 }}
              aria-label="Поговорим о вашем мероприятии"
            >
              Поговорим о вашем{" "}
              <span className="gradient-text italic">мероприятии</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink/70">
              Позвоните, напишите или оставьте заявку — отвечаем быстро и составим смету под ваш бюджет.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-12 lg:gap-20 md:grid-cols-2">
          {/* Left column: Contact info cards */}
          <div className="space-y-8">
            {/* Primary contact cards */}
            <Reveal delay={0.1}>
              <div className="space-y-3">
                {/* Phone - primary CTA */}
                <ContactCard
                  icon={Phone}
                  href={CONTACTS.phoneHref}
                  label={CONTACTS.phone}
                  ariaLabel={`Позвонить: ${CONTACTS.phone}`}
                  tooltip="📞 Позвоните нам!"
                  highlight
                />

                {/* WhatsApp removed — Sopranos uses phone + email only */}
                {/* Instagram - prominent handle */}
                <ContactCard
                  icon={Instagram}
                  href={CONTACTS.instagramHref}
                  label={CONTACTS.instagram}
                  ariaLabel={`Instagram: ${CONTACTS.instagram}`}
                  sublabel="Instagram"
                  tooltip="✨ Смотреть работы"
                  external
                />

                {/* Secondary contacts in compact row */}
                <div className="pt-2">
                  <p className="mb-3 font-mono text-xs uppercase tracking-wider text-ink/70">
                    Другие способы связи
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <ContactCard
                      icon={Telegram}
                      href={CONTACTS.telegramHref}
                      label={CONTACTS.telegram}
                      ariaLabel={`Telegram: ${CONTACTS.telegram}`}
                      sublabel="Telegram"
                      external
                    />
                    <ContactCard
                      icon={MessageCircle}
                      href={CONTACTS.whatsappHref}
                      label={CONTACTS.whatsapp}
                      ariaLabel={`WhatsApp: ${CONTACTS.whatsapp}`}
                      sublabel="WhatsApp"
                      external
                    />
                  </div>
                </div>

                {/* Email & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <ContactCard
                    icon={Mail}
                    href={`mailto:${CONTACTS.email}`}
                    label={CONTACTS.email}
                    ariaLabel={`Написать на email: ${CONTACTS.email}`}
                    sublabel="Эл. почта"
                  />
                  <ContactCard
                    icon={MapPin}
                    label={CONTACTS.city}
                    isStatic
                  />
                </div>
              </div>
            </Reveal>

            {/* Office hours */}
            <Reveal delay={0.2}>
              <OfficeHours />
            </Reveal>

            {/* Social proof */}
            <Reveal delay={0.3}>
              <SocialProofBadge />
            </Reveal>
          </div>

          {/* Right column: Multi-step form */}
          <Reveal delay={0.2}>
            <form
              ref={formRef}
              onSubmit={submit}
              aria-label="Многошаговая форма заявки на кейтеринг"
              className="relative overflow-hidden rounded-3xl border border-border-line bg-white p-6 shadow-xl shadow-ink/5 md:p-9"
            >
              {/* Success overlay */}
              <AnimatePresence mode="wait">
                {formStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white rounded-3xl"
                  >
                    <ConfettiParticles />
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 text-center font-display text-xl text-ink"
                    >
                      Заявка отправлена!
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-2 text-sm text-ink/70"
                    >
                      Мы получили вашу заявку и перезвоним в течение 15 минут
                      в рабочее время (Пн–Пт 9:00–19:00, Сб 10:00–16:00).
                    </motion.p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Error shake effect wrapper */}
              <motion.div
                animate={
                  formStatus === "error" && !prefersReducedMotion
                    ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl text-ink">Оставить заявку</h3>
                    <p className="mt-1 text-sm text-ink/70">
                      Шаг {step + 1} из {STEPS.length} — {STEPS[step]}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="font-display text-3xl text-ink/10"
                  >
                    0{step + 1}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-5 flex gap-1.5" aria-hidden="true">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i <= step
                          ? "bg-gradient-to-r from-gold to-terracotta"
                          : "bg-border-line"
                      }`}
                    />
                  ))}
                </div>

                {/* Steps content */}
                <div className="mt-7 min-h-[16rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Step 0: Event type selection */}
                      {step === 0 && (
                        <fieldset className="space-y-3">
                          <legend className="mb-2 font-mono text-xs uppercase tracking-wider text-ink/70">
                            Тип мероприятия
                          </legend>
                          <div className="grid grid-cols-2 gap-2">
                            {MENU_TYPES.map((m) => {
                              const active = data.eventType === m.id;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => set("eventType", m.id)}
                                  aria-pressed={active}
                                  className={`group flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                                    active
                                      ? "border-gold bg-gold/8 ring-2 ring-gold/25 shadow-md shadow-gold/10"
                                      : "border-border-line bg-cream/40 hover:border-gold/50 hover:bg-gold/5"
                                  }`}
                                >
                                  <span className="text-sm font-medium text-ink">
                                    {m.label}
                                  </span>
                                  <span className="font-mono text-[12px] text-ink/70">
                                    от {m.perGuest.toLocaleString("ru-RU")} ₽{m.priceUnit ?? "/чел"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}

                      {/* Step 1: Guests & Date */}
                      {step === 1 && (
                        <fieldset className="space-y-6">
                          <div>
                            <label
                              htmlFor="lead-guests"
                              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink/70"
                            >
                              <Users className="size-3.5" />
                              Количество гостей
                            </label>
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  set("guests", Math.max(1, data.guests - 10))
                                }
                                aria-label="Уменьшить на 10"
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line text-ink/70 transition-all hover:border-gold hover:bg-gold/10 hover:text-gold"
                              >
                                <ChevronLeft className="size-5" />
                              </button>
                              <input
                                id="lead-guests"
                                type="number"
                                min={1}
                                max={1000}
                                value={data.guests}
                                onChange={(e) =>
                                  set(
                                    "guests",
                                    Math.max(1, Number(e.target.value) || 1),
                                  )
                                }
                                className="w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-center font-display text-xl text-ink outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 focus:shadow-[0_0_20px_rgba(196,149,106,0.15)]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  set("guests", data.guests + 10)
                                }
                                aria-label="Увеличить на 10"
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line text-ink/70 transition-all hover:border-gold hover:bg-gold/10 hover:text-gold"
                              >
                                <ChevronRight className="size-5" />
                              </button>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={500}
                              step={5}
                              value={Math.min(data.guests, 500)}
                              onChange={(e) => set("guests", Number(e.target.value))}
                              className="mt-4 w-full accent-gold"
                              aria-label="Количество гостей"
                            />
                          </div>

                          <div role="group" aria-label="Желаемая дата мероприятия">
                            <div
                              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink/70"
                            >
                              <Calendar className="size-3.5" />
                              Желаемая дата
                            </div>
                            <input
                              id="lead-date"
                              type="date"
                              value={data.date}
                              min={new Date().toISOString().split("T")[0]}
                              aria-label="Желаемая дата мероприятия"
                              onChange={(e) => set("date", e.target.value)}
                              className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 focus:shadow-[0_0_20px_rgba(196,149,106,0.15)]"
                            />
                            <p className="mt-2 text-xs text-ink/70">
                              Необязательно — уточним по звонку.
                            </p>
                          </div>
                        </fieldset>
                      )}

                      {/* Step 2: Contact details with floating labels */}
                      {step === 2 && (
                        <fieldset className="space-y-5">
                          <FloatingInput
                            id="lead-name"
                            name="name"
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="Ваше имя"
                            ariaLabelText="Ваше имя"
                            required
                            error={validationErrors.name}
                            icon={Users}
                            validate={(v) => v.trim().length >= 2}
                          />
                          
                          <FloatingInput
                            id="lead-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            pattern="^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$"
                            value={data.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            placeholder="+7 (___) ___-__-__"
                            ariaLabelText="Номер телефона"
                            required
                            error={validationErrors.phone}
                            icon={Phone}
                            validate={(v) => /^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(v.replace(/[^+0-9]/g, ""))}
                          />
                          
                          <FloatingInput
                            id="lead-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="Эл. почта (необязательно)"
                            icon={Mail}
                            validate={(v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
                          />

                          {/* New field: Preferred call time */}
                          <FloatingInput
                            id="lead-preferred-time"
                            name="preferredTime"
                            value={data.preferredTime}
                            onChange={(e) => set("preferredTime", e.target.value)}
                            placeholder="Желаемое время звонка (необязательно)"
                            icon={Clock}
                          />
                        </fieldset>
                      )}

                      {/* Step 3: Review & Submit */}
                      {step === 3 && (
                        <fieldset className="space-y-5">
                          <legend className="mb-2 font-mono text-xs uppercase tracking-wider text-ink/70">
                            Проверьте заявку
                          </legend>
                          <ul className="divide-y divide-border-line rounded-xl border border-border-line bg-cream/40">
                            <SummaryRow icon={Users} label="Имя" value={data.name} />
                            <SummaryRow icon={PartyPopper} label="Тип" value={menuLabel} />
                            <SummaryRow icon={Users} label="Гости" value={String(data.guests)} />
                            <SummaryRow
                              icon={Calendar}
                              label="Дата"
                              value={data.date || "уточним по звонку"}
                            />
                            <SummaryRow icon={Phone} label="Телефон" value={data.phone} />
                            <SummaryRow
                              icon={Mail}
                              label="Эл. почта"
                              value={data.email || "—"}
                            />
                            {data.preferredTime && (
                              <SummaryRow
                                icon={Clock}
                                label="Звонок"
                                value={data.preferredTime}
                              />
                            )}
                          </ul>

                          {/* Consent checkbox */}
                          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70">
                            <input
                              type="checkbox"
                              id="consent"
                              name="consent"
                              checked={data.consent}
                              onChange={(e) => set("consent", e.target.checked)}
                              className="mt-0.5 size-4 shrink-0 rounded accent-gold transition-colors focus:ring-2 focus:ring-gold/30"
                              required
                            />
                            <span>
                              Я соглашаюсь на обработку моих персональных данных в соответствии с{" "}
                              <a
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold underline underline-offset-2 hover:text-terracotta transition-colors py-1.5 -my-1.5 inline-block"
                              >
                                Политикой конфиденциальности
                              </a>
                              .
                            </span>
                          </label>
                        </fieldset>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Step navigation buttons */}
                <div className="mt-7 flex items-center gap-3">
                  {step > 0 && (
                    <motion.button
                      type="button"
                      onClick={back}
                      whileHover={!prefersReducedMotion ? { x: -3 } : undefined}
                      whileTap={!prefersReducedMotion ? { scale: 0.97 } : undefined}
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-border-line px-5 py-3 text-sm font-medium text-ink/70 transition-all hover:border-gold hover:bg-gold/5 hover:text-gold"
                    >
                      <ChevronLeft className="size-4" />
                      Назад
                    </motion.button>
                  )}

                  {step < STEPS.length - 1 ? (
                    <motion.button
                      type="button"
                      onClick={next}
                      disabled={!stepValid()}
                      aria-disabled={!stepValid()}
                      whileHover={!prefersReducedMotion && stepValid() ? { y: -2 } : undefined}
                      whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                      className="group flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:shadow-gold/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      Далее
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
                  ) : (
                    <Magnetic strength={0.25} className="flex-1 flex">
                    <motion.button
                      type="submit"
                      disabled={formStatus !== "idle" || !data.consent}
                      aria-disabled={formStatus !== "idle" || !data.consent}
                      data-cursor="submit"
                      whileHover={!prefersReducedMotion && formStatus === "idle" ? { y: -2 } : undefined}
                      whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                      className="group relative flex min-h-[44px] min-w-[44px] w-full flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:shadow-gold/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      {formStatus === "loading" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Отправляем…
                        </>
                      ) : (
                        <>
                          Отправить заявку
                          <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                      
                      {/* Button loading shimmer */}
                      {formStatus === "loading" && (
                        <motion.span
                          className="absolute inset-0 rounded-full overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </motion.span>
                      )}
                    </motion.button>
                    </Magnetic>
                  )}
                </div>

                {/* Cycle 38 fix: explain WHY «Далее» is disabled instead of a
                    dead button — step-specific actionable hints. */}
                {!stepValid() && formStatus === "idle" && (
                  <p
                    className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-terracotta/90"
                    role="status"
                  >
                    <Sparkles className="size-3.5" />
                    {step === 0 && "Выберите тип мероприятия, чтобы продолжить"}
                    {step === 2 && !data.name.trim() && "Введите имя, чтобы продолжить"}
                    {step === 2 && data.name.trim() && !PHONE_REGEX.test(data.phone.replace(/[^+0-9]/g, "")) && "Введите корректный телефон"}
                    {step === 3 && "Подтвердите согласие на обработку данных"}
                  </p>
                )}

                {/* Security notice */}
                <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-ink/70">
                  <ShieldCheck className="size-3.5 text-sage" />
                  Данные защищены · обрабатываются по 152-ФЗ
                </p>
              </motion.div>
            </form>
          </Reveal>
        </div>
      </div>

      {/* Yandex Maps embed */}
      <div className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border-line shadow-lg shadow-ink/5">
            <iframe
              src={YANDEX_MAPS.embedSrc}
              title="Interfood Catering на карте — Санкт-Петербург, ул. Большая Морская, 18"
              className="h-[360px] w-full md:h-[440px]"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              role="img"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <a
              href={YANDEX_MAPS.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Яндекс.Карты (откроется в новой вкладке)"
              className="flex min-h-[44px] items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors group"
            >
              <MapPin className="size-4 transition-transform group-hover:scale-110" />
              {YANDEX_MAPS.address} — открыть на Яндекс.Картах →
            </a>
            <span className="font-mono text-xs text-ink/70">
              {CONTACTS.city} · {CONTACTS.phone}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
