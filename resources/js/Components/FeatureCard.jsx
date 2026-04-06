import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
   Shared fade-up variant (consumed by parent container)
   ───────────────────────────────────────────── */
export const cardVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─────────────────────────────────────────────
   FeatureCard
   Props:
     icon      — React node (SVG / emoji / lucide icon)
     title     — short label string
     description — one-line description string
     accent    — Tailwind colour class prefix, e.g. "amber" | "blue" | "emerald"
   ───────────────────────────────────────────── */
export default function FeatureCard({ icon, title, description, accent = "amber" }) {
  const ringColour = {
    amber:   "ring-amber-200/60   group-hover:ring-amber-300/80   dark:ring-amber-700/50 dark:group-hover:ring-amber-600/70",
    blue:    "ring-blue-200/60    group-hover:ring-blue-300/80    dark:ring-blue-700/50  dark:group-hover:ring-blue-600/70",
    emerald: "ring-emerald-200/60 group-hover:ring-emerald-300/80 dark:ring-emerald-700/50 dark:group-hover:ring-emerald-600/70",
    rose:    "ring-rose-200/60    group-hover:ring-rose-300/80    dark:ring-rose-700/50  dark:group-hover:ring-rose-600/70",
    violet:  "ring-violet-200/60  group-hover:ring-violet-300/80  dark:ring-violet-700/50 dark:group-hover:ring-violet-600/70",
    teal:    "ring-teal-200/60    group-hover:ring-teal-300/80    dark:ring-teal-700/50  dark:group-hover:ring-teal-600/70",
  }[accent] ?? "ring-amber-200/60 group-hover:ring-amber-300/80 dark:ring-amber-700/50 dark:group-hover:ring-amber-600/70";

  const iconBg = {
    amber:   "bg-amber-50   text-amber-600   dark:bg-amber-900/40 dark:text-amber-400",
    blue:    "bg-blue-50    text-blue-600    dark:bg-blue-900/40  dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    rose:    "bg-rose-50    text-rose-600    dark:bg-rose-900/40  dark:text-rose-400",
    violet:  "bg-violet-50  text-violet-600  dark:bg-violet-900/40 dark:text-violet-400",
    teal:    "bg-teal-50    text-teal-600    dark:bg-teal-900/40  dark:text-teal-400",
  }[accent] ?? "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400";

  return (
    <motion.article
      variants={cardVariant}
      className={[
        "group relative flex items-start gap-4 rounded-2xl p-5",
        "bg-white/60 backdrop-blur-md dark:bg-slate-800/60",
        "ring-1 transition-all duration-300",
        "shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.3)]",
        "hover:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 dark:hover:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.4)]",
        ringColour,
      ].join(" ")}
      aria-label={title}
    >
      {/* Icon container */}
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg} transition-transform duration-300 group-hover:scale-110`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Subtle top-right shine dot */}
      <span
        className="absolute top-3 right-3.5 w-1.5 h-1.5 rounded-full bg-white/70 dark:bg-white/20 pointer-events-none"
        aria-hidden="true"
      />
    </motion.article>
  );
}
