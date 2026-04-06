import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
   Stagger variant (consumed by parent container)
   ───────────────────────────────────────────── */
export const cardVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─────────────────────────────────────────────
   ActivityCard
   Props:
     icon        — emoji or React node
     title       — activity name (French)
     description — short description
     accent      — colour key
   ───────────────────────────────────────────── */
export default function ActivityCard({
  icon,
  title,
  description,
  accent = "amber",
}) {
  /* ── Colour maps ── */
  const iconGradient = {
    amber:   "from-amber-500 to-orange-500",
    blue:    "from-blue-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    rose:    "from-rose-500 to-pink-500",
    violet:  "from-violet-500 to-purple-500",
    sky:     "from-sky-500 to-cyan-500",
  }[accent] ?? "from-amber-500 to-orange-500";

  const iconShadow = {
    amber:   "shadow-amber-500/20",
    blue:    "shadow-blue-500/20",
    emerald: "shadow-emerald-500/20",
    rose:    "shadow-rose-500/20",
    violet:  "shadow-violet-500/20",
    sky:     "shadow-sky-500/20",
  }[accent] ?? "shadow-amber-500/20";

  const hoverBorder = {
    amber:   "hover:border-amber-300/70",
    blue:    "hover:border-blue-300/70",
    emerald: "hover:border-emerald-300/70",
    rose:    "hover:border-rose-300/70",
    violet:  "hover:border-violet-300/70",
    sky:     "hover:border-sky-300/70",
  }[accent] ?? "hover:border-amber-300/70";

  const glowBg = {
    amber:   "bg-amber-400/6",
    blue:    "bg-blue-400/6",
    emerald: "bg-emerald-400/6",
    rose:    "bg-rose-400/6",
    violet:  "bg-violet-400/6",
    sky:     "bg-sky-400/6",
  }[accent] ?? "bg-amber-400/6";

  const accentLine = {
    amber:   "from-amber-500 to-orange-400",
    blue:    "from-blue-500 to-indigo-400",
    emerald: "from-emerald-500 to-teal-400",
    rose:    "from-rose-500 to-pink-400",
    violet:  "from-violet-500 to-purple-400",
    sky:     "from-sky-500 to-cyan-400",
  }[accent] ?? "from-amber-500 to-orange-400";

  return (
    <motion.article
      variants={cardVariant}
      className={[
        "group relative flex flex-col gap-4",
        "rounded-3xl p-7 sm:p-8",
        "bg-white/55 dark:bg-slate-800/80 backdrop-blur-xl",
        "border border-stone-200/50 dark:border-slate-700/50",
        "shadow-[0_2px_20px_-6px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_14px_44px_-10px_rgba(0,0,0,0.1)]",
        "hover:-translate-y-1.5",
        "transition-all duration-300 ease-out",
        hoverBorder,
      ].join(" ")}
    >
      {/* ── Hover glow ── */}
      <span
        className={`absolute inset-0 rounded-3xl ${glowBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        aria-hidden="true"
      />

      {/* ── Top accent line ── */}
      <span
        className={`absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r ${accentLine} opacity-0 group-hover:opacity-60 transition-opacity duration-400`}
        aria-hidden="true"
      />

      {/* ── Icon ── */}
      <div
        className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} ${iconShadow} shadow-lg flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* ── Title ── */}
      <h3 className="relative z-10 text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight leading-snug">
        {title}
      </h3>

      {/* ── Description ── */}
      <p className="relative z-10 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
        {description}
      </p>

      {/* ── Bottom accent dot ── */}
      <span
        className={`relative z-10 w-6 h-[3px] rounded-full bg-gradient-to-r ${accentLine} opacity-30 group-hover:opacity-70 group-hover:w-10 transition-all duration-300 mt-auto`}
        aria-hidden="true"
      />
    </motion.article>
  );
}
