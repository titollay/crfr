import { useState, useEffect, useRef, useCallback } from "react";
import { statsData } from "../../data/homeData";
import { useTranslation } from "react-i18next";

/* ═══════════════════════════════════════════════
   Easing helper — easeOutExpo for smooth deceleration
   ═══════════════════════════════════════════════ */

const COUNTER_DURATION_MS = 1800;

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* ═══════════════════════════════════════════════
   Counter — rAF-based animated number
   ═══════════════════════════════════════════════ */

function Counter({ to, label, suffix = "+", colorClass = "red" }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const hasStarted = useRef(false);

  const runAnimation = useCallback(() => {
    let startTime = null;
    let rafId;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
      const eased = easeOutExpo(progress);

      setDisplayValue(Math.round(eased * to));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [to]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          setIsVisible(true);
          runAnimation();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [runAnimation]);

  // Color mapping based on colorClass from data
  const accentColors = {
    red:    "from-red-600 via-red-500 to-red-400",
    blue:   "from-blue-700 via-blue-500 to-blue-400",
    yellow: "from-amber-600 via-amber-500 to-yellow-400",
  };

  const borderColors = {
    red:    "border-red-200/50 dark:border-red-800/40",
    blue:   "border-blue-200/50 dark:border-blue-800/40",
    yellow: "border-amber-200/50 dark:border-amber-800/40",
  };

  return (
    <article
      ref={cardRef}
      className={`
        group relative flex flex-col items-center gap-3 px-6 py-8 sm:py-10
        rounded-2xl border ${borderColors[colorClass] || "border-stone-200/40 dark:border-slate-600/40"}
        bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl
        shadow-[0_2px_24px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_-6px_rgba(0,0,0,0.3)]
        hover:bg-white/80 dark:hover:bg-slate-700/70 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.4)]
        hover:-translate-y-1 transition-all duration-300
        cursor-default select-none
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        transition-[opacity,transform] duration-700 ease-out
      `}
    >
      {/* Number */}
      <span
        className={`text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br ${accentColors[colorClass] || accentColors.red} leading-none tabular-nums`}
        aria-live="polite"
        aria-atomic="true"
      >
        {displayValue.toLocaleString("fr-FR")}
        <span className="text-stone-300 dark:text-slate-600 font-bold text-3xl">{suffix}</span>
      </span>

      {/* Label */}
      <span className="text-sm sm:text-[0.9rem] font-semibold text-stone-500 dark:text-stone-400 tracking-wide text-center leading-snug">
        {label}
      </span>

      {/* Decorative bottom accent line on hover */}
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-500 rounded-full ${
          colorClass === "red" ? "text-red-400" : colorClass === "blue" ? "text-blue-400" : "text-amber-400"
        }`}
        aria-hidden="true"
      />
    </article>
  );
}

/* ═══════════════════════════════════════════════
   Stats — Main Export
   ═══════════════════════════════════════════════ */

export default function Stats() {
  const { t } = useTranslation();

  return (
    <section
      className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10"
      aria-label={t("stats.aria")}
    >
      {/* Section heading */}
      <div className="mb-16 sm:mb-20 max-w-6xl mx-auto">
        <p
          className="text-xs uppercase tracking-[0.3em] mb-4"
          style={{ color: '#D97706' }}
        >
          <span
            style={{
              width: 40,
              height: 1,
              background: '#D97706',
              display: 'inline-block',
              verticalAlign: 'middle',
              marginRight: 12,
            }}
          />
          {t("stats.kicker")}
        </p>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-5xl lg:text-7xl font-light leading-[1.05] text-gray-900 dark:text-gray-100"
        >
          {t("stats.title")}{" "}
          <em style={{ color: '#D97706' }} className="not-italic">
            {t("stats.title_em")}
          </em>
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {statsData.map((stat, i) => (
          <Counter
            key={stat.label || i}
            {...stat}
            label={t(`stats.cards.${i}`)}
          />
        ))}
      </div>
    </section>
  );
}
