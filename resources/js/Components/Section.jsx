import { motion, useReducedMotion } from "framer-motion";
import { useRef, useCallback, useMemo } from "react";
import hero from "../../assets/hero.png";
/* ═══════════════════════════════════════════════
   Animation System
   ═══════════════════════════════════════════════ */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
};

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

/** Decorative background layer — zero interactivity, hidden from a11y tree */
function BackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Primary warm orb — top-left */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], x: [0, 35, 0], y: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-32 w-[32rem] h-[32rem] rounded-full bg-amber-300/20 dark:bg-amber-500/10 mix-blend-multiply dark:mix-blend-screen blur-[100px]"
      />

      {/* Secondary warm orb — bottom-right */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-28 w-[30rem] h-[30rem] rounded-full bg-orange-300/15 dark:bg-orange-500/10 mix-blend-multiply dark:mix-blend-screen blur-[100px]"
      />

      {/* Tertiary accent orb — center right (adds depth) */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], y: [0, -15, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/3 right-[10%] w-72 h-72 rounded-full bg-rose-200/10 dark:bg-rose-400/5 mix-blend-multiply dark:mix-blend-screen blur-[80px]"
      />

      {/* Dot grid with soft radial mask */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(120,70,20,0.045) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}

function Badge() {
  return (
    <motion.div variants={fadeUp} className="flex justify-center lg:justify-start">
      <div className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-amber-200/40 dark:border-amber-700/40 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl shadow-[0_2px_16px_-4px_rgba(120,80,20,0.06)] transition-colors duration-300 hover:bg-white/70 dark:hover:bg-slate-700/60 cursor-default select-none">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-500/20" />
          <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
          <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
        </span>
        <span className="text-xs sm:text-[0.8rem] font-semibold tracking-widest text-stone-600 dark:text-stone-300 uppercase">
          المركز الجهوي · Oujda · وجدة
        </span>
      </div>
    </motion.div>
  );
}

/** Primary + secondary CTA buttons */
function CTAButtons({ onPrimary, onSecondary }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2 lg:justify-start justify-center"
    >
      {/* Primary CTA */}
      <button
        type="button"
        onClick={onPrimary}
        className="group relative inline-flex justify-center items-center gap-2.5 w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-bold text-base sm:text-[1.05rem] tracking-wide shadow-[0_8px_32px_-6px_rgba(217,119,6,0.35)] hover:shadow-[0_12px_40px_-4px_rgba(217,119,6,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf2ea] dark:focus-visible:ring-offset-slate-900 overflow-hidden"
      >
        <span className="relative z-10">Découvrir le centre</span>
        <svg
          className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
        {/* Shine sweep on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out" />
      </button>

      {/* Secondary CTA */}
      <button
        type="button"
        onClick={onSecondary}
        className="w-full sm:w-auto px-9 py-4 rounded-full bg-white/40 dark:bg-slate-800/40 border-2 border-stone-200/60 dark:border-slate-600/60 backdrop-blur-sm text-stone-700 dark:text-stone-200 font-bold text-base sm:text-[1.05rem] tracking-wide hover:border-amber-400/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-stone-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf2ea] dark:focus-visible:ring-offset-slate-900"
      >
        Prendre contact
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Hero — Main Export
   ═══════════════════════════════════════════════ */

export default function Section() {
  const sectionRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Smooth-scroll helper accounting for fixed nav (~80px)
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  // Derive animation variants from reduced-motion preference
  const motionProps = useMemo(
    () =>
      prefersReduced
        ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
        : {
            variants: container,
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, margin: "-60px" },
          },
    [prefersReduced],
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate flex flex-col justify-center items-center min-h-[100svh] px-5 sm:px-8 lg:px-10 py-28 sm:py-36 overflow-hidden selection:bg-amber-200/50 selection:text-amber-900 dark:selection:bg-amber-800/50 dark:selection:text-amber-100"
      aria-label="Accueil — Centre Régional"
    >
      <BackgroundEffects />

      {/* ── Content container ── */}
      <div className="relative z-10 w-full max-w-6xl lg:max-w-7xl mx-auto flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center text-center lg:text-left">
        <motion.div {...motionProps} className="flex flex-col gap-8 sm:gap-10">
          <Badge />

          {/* ── Headline group ── */}
          <div className="space-y-3 sm:space-y-4">
            <motion.h1
              variants={prefersReduced ? undefined : fadeUp}
              className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.25rem] font-extrabold tracking-[-0.025em] leading-[1.05]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-700 via-amber-500 to-orange-500">
                Centre Régional
              </span>
            </motion.h1>

            <motion.p
              variants={prefersReduced ? undefined : fadeUp}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.25rem] font-semibold tracking-tight text-stone-800 dark:text-stone-100 leading-snug"
            >
              Formations{" "}
              <span className="text-stone-300 dark:text-stone-500 font-light">&amp;</span>{" "}
              Rencontres
            </motion.p>
          </div>

          {/* ── Arabic sub-heading ── */}
          <motion.h2
            variants={prefersReduced ? undefined : fadeUp}
            className="text-lg sm:text-xl md:text-2xl font-bold text-stone-500 dark:text-stone-400 leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            المركز الجهوي للتكوينات والملتقيات — المغرب العربي وجدة
          </motion.h2>

          {/* ── Value proposition ── */}
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-base sm:text-lg md:text-xl text-stone-400 dark:text-stone-500 lg:mr-auto leading-relaxed max-w-xl"
          >
            Un espace institutionnel d'excellence dédié à la formation, à
            l'échange intellectuel et au développement des compétences au cœur
            de la région de l'Oriental.
          </motion.p>

          {/* ── CTAs ── */}
          <CTAButtons
            onPrimary={() => scrollTo("about")}
            onSecondary={() => scrollTo("contact")}
          />
        </motion.div>

        {/* ── Hero Image ── */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md lg:max-w-none mx-auto"
        >
          {/* Subtle glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 dark:from-amber-500/10 dark:to-orange-500/10 blur-3xl rounded-full scale-90" />

          <img
            src={hero}
            alt="Présentation CRFR"
            className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
          />
        </motion.div>
      </div>
    </section>
  );
}
