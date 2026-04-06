import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
   Card animation variant (consumed by stagger container)
   ───────────────────────────────────────────── */
export const cardVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─────────────────────────────────────────────
   InfrastructureCard
   Props:
     icon       — emoji / React node
     titleFr    — French title
     titleAr    — Arabic title
     accent     — Tailwind colour prefix
   ───────────────────────────────────────────── */
export default function InfrastructureCard({
  icon,
  titleFr,
  subtitle,
  accent = "amber",
}) {
  /* ── Colour maps ── */
  const iconGradient = {
    amber:   "from-amber-500 to-orange-500 shadow-amber-500/25",
    blue:    "from-blue-500 to-indigo-500 shadow-blue-500/25",
    emerald: "from-emerald-500 to-teal-500 shadow-emerald-500/25",
    rose:    "from-rose-500 to-pink-500 shadow-rose-500/25",
    violet:  "from-violet-500 to-purple-500 shadow-violet-500/25",
  }[accent] ?? "from-amber-500 to-orange-500 shadow-amber-500/25";

  const borderHover = {
    amber:   "hover:border-amber-300/80",
    blue:    "hover:border-blue-300/80",
    emerald: "hover:border-emerald-300/80",
    rose:    "hover:border-rose-300/80",
    violet:  "hover:border-violet-300/80",
  }[accent] ?? "hover:border-amber-300/80";

  const glowBg = {
    amber:   "bg-amber-400/8",
    blue:    "bg-blue-400/8",
    emerald: "bg-emerald-400/8",
    rose:    "bg-rose-400/8",
    violet:  "bg-violet-400/8",
  }[accent] ?? "bg-amber-400/8";

  return (
    <motion.article
      variants={cardVariant}
      className={[
        "group relative flex flex-col items-center text-center gap-5",
        "rounded-3xl p-7 sm:p-8",
        "bg-white/55 backdrop-blur-xl",
        "border border-stone-200/50",
        "shadow-[0_2px_20px_-6px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.1)]",
        "hover:-translate-y-1",
        "transition-all duration-300 ease-out",
        borderHover,
      ].join(" ")}
      aria-label={titleFr}
    >
      {/* ── Hover glow background ── */}
      <span
        className={`absolute inset-0 rounded-3xl ${glowBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        aria-hidden="true"
      />

      {/* ── Corner shine dot ── */}
      <span
        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/80 opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Icon container ── */}
      <div
        className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* ── French title ── */}
      <p className="relative z-10 text-base sm:text-lg font-bold text-stone-800 leading-snug tracking-tight">
        {titleFr}
      </p>

      {/* ── French subtitle ── */}
      <p className="relative z-10 text-sm font-medium text-stone-400 leading-relaxed tracking-wide">
        {subtitle}
      </p>

      {/* ── Bottom accent bar ── */}
      <span
        className={`w-8 h-1 rounded-full bg-gradient-to-r ${iconGradient.split(" shadow")[0]} opacity-40 group-hover:opacity-80 group-hover:w-12 transition-all duration-300`}
        aria-hidden="true"
      />
    </motion.article>
  );
}
