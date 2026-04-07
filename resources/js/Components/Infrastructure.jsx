import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import InfrastructureCard from "./InfrastructureCard";

/* ─────────────────────────────────────────────
   Animation variants
   ───────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

/* ─────────────────────────────────────────────
   Infrastructure data
   ───────────────────────────────────────────── */
const ITEMS = [
  {
    id: "admin",
    icon: "🏛️",
    accent: "amber",
  },
  {
    id: "lounge",
    icon: "🛋️",
    accent: "blue",
  },
  {
    id: "prayer",
    icon: "🕌",
    accent: "emerald",
  },
  {
    id: "training_rooms",
    icon: "📚",
    accent: "amber",
  },
  {
    id: "amphitheaters",
    icon: "🎓",
    accent: "blue",
  },
  {
    id: "accommodation",
    icon: "🏨",
    accent: "emerald",
  },
  {
    id: "restaurant",
    icon: "🍽️",
    accent: "rose",
  },
  {
    id: "kitchen",
    icon: "👨‍🍳",
    accent: "violet",
  },
];

/* ─────────────────────────────────────────────
   Infrastructure — Main Export
   ───────────────────────────────────────────── */
export default function Infrastructure() {
  const prefersReduced = useReducedMotion();
  const { t } = useTranslation();

  const headerMotion = useMemo(
    () =>
      prefersReduced
        ? {}
        : {
            variants: container,
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, margin: "-60px" },
          },
    [prefersReduced],
  );

  const gridMotion = useMemo(
    () =>
      prefersReduced
        ? {}
        : {
            variants: container,
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, margin: "-80px" },
          },
    [prefersReduced],
  );

  return (
    <section
      id="infrastructures"
      aria-labelledby="infra-heading"
      className="relative isolate overflow-hidden px-5 sm:px-8 lg:px-10 py-24 sm:py-32"
    >
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Top edge line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

        {/* Large radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 65%)",
          }}
        />

        {/* Floating orb — left */}
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { y: [0, -18, 0], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -left-24 w-80 h-80 rounded-full bg-amber-200/15 blur-[90px]"
        />

        {/* Floating orb — right */}
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { y: [0, 14, 0], scale: [1, 1.1, 1] }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute -bottom-12 -right-20 w-72 h-72 rounded-full bg-orange-200/12 blur-[80px]"
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120,70,20,0.04) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 65% at 50% 50%, black 15%, transparent 75%)",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 50%, black 15%, transparent 75%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* ════════ Header block ════════ */}
        <motion.div
          {...headerMotion}
          className="flex flex-col items-start gap-5 mb-16 sm:mb-20"
        >
          {/* Section label */}
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="text-xs uppercase tracking-[0.3em] mb-1"
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
            {t("infra.kicker")}
          </motion.p>

          {/* Heading */}
          <motion.div variants={prefersReduced ? undefined : fadeUp} className="space-y-2">
            <h2
              id="infra-heading"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-5xl lg:text-7xl font-light leading-[1.05] text-gray-900"
            >
              {t("infra.title")}{" "}
              <em style={{ color: '#D97706' }} className="not-italic">
                {t("infra.title_em")}
              </em>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="max-w-xl text-base sm:text-lg text-stone-500 leading-relaxed"
          >
            {t("infra.subtitle")}
          </motion.p>
        </motion.div>

        {/* ════════ Cards grid ════════ */}
        <motion.div
          {...gridMotion}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          role="list"
          aria-label={t("infra.list_aria")}
        >
          {ITEMS.map((item) => (
            <InfrastructureCard
              key={item.id}
              icon={item.icon}
              accent={item.accent}
              titleFr={t(`infra.items.${item.id}.title`)}
              subtitle={t(`infra.items.${item.id}.subtitle`)}
            />
          ))}
        </motion.div>

        {/* ════════ Bottom accent badge ════════ */}
        <motion.div
          {...headerMotion}
          className="flex justify-center mt-14 sm:mt-16"
        >
          <motion.div
            variants={prefersReduced ? undefined : fadeUp}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/50 backdrop-blur-md ring-1 ring-stone-200/50 shadow-sm"
          >
            <span className="text-lg" aria-hidden="true">
              🏛️
            </span>
            <span className="text-sm font-semibold text-stone-600">
              {t("infra.badge_fr")}
            </span>
            <span
              className="text-sm text-stone-400 font-semibold"
              dir="rtl"
              lang="ar"
            >
              {t("infra.badge_ar")}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
