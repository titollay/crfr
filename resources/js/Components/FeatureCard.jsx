import { motion } from "framer-motion";

export const cardVariant = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const ACCENT_MAP = {
  amber:   { bg: "bg-amber-50   dark:bg-amber-900/20",  ring: "ring-amber-200/60  dark:ring-amber-700/40",  icon: "bg-amber-100  dark:bg-amber-800/40  text-amber-600  dark:text-amber-400" },
  blue:    { bg: "bg-blue-50    dark:bg-blue-900/20",   ring: "ring-blue-200/60   dark:ring-blue-700/40",   icon: "bg-blue-100   dark:bg-blue-800/40   text-blue-600   dark:text-blue-400"  },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20",ring: "ring-emerald-200/60 dark:ring-emerald-700/40",icon: "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400"},
  rose:    { bg: "bg-rose-50    dark:bg-rose-900/20",   ring: "ring-rose-200/60   dark:ring-rose-700/40",   icon: "bg-rose-100   dark:bg-rose-800/40   text-rose-600   dark:text-rose-400"  },
  violet:  { bg: "bg-violet-50  dark:bg-violet-900/20", ring: "ring-violet-200/60 dark:ring-violet-700/40", icon: "bg-violet-100 dark:bg-violet-800/40 text-violet-600 dark:text-violet-400"},
  teal:    { bg: "bg-teal-50    dark:bg-teal-900/20",   ring: "ring-teal-200/60   dark:ring-teal-700/40",   icon: "bg-teal-100   dark:bg-teal-800/40   text-teal-600   dark:text-teal-400"  },
};

export default function FeatureCard({ icon, accent = "amber", title, description }) {
  const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.amber;

  return (
    <motion.div
      variants={cardVariant}
      className={`flex items-start gap-3 p-4 rounded-2xl ring-1 ${colors.bg} ${colors.ring} shadow-sm`}
    >
      <span
        className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-lg ${colors.icon}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">
          {title}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
