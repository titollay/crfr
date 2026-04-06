import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import FeatureCard, { cardVariant } from "./FeatureCard";

/* ─────────────────────────────────────────────
   Animation system
   ───────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(5px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

/* ─────────────────────────────────────────────
   Feature data
   ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "🎓",
    title: "Formations continues",
    description: "Programmes de perfectionnement professionnel continus",
    accent: "amber",
  },
  {
    icon: "🤝",
    title: "Séminaires & Conférences",
    description: "Espaces d'échange et de partage des expertises",
    accent: "blue",
  },
  {
    icon: "📋",
    title: "Réunions pédagogiques",
    description: "Cadre institutionnel dédié aux conseils et commissions",
    accent: "emerald",
  },
  {
    icon: "📝",
    title: "Concours & Examens",
    description: "Salles équipées pour toute épreuve officielle",
    accent: "rose",
  },
  {
    icon: "🏠",
    title: "Hébergement",
    description: "Capacité d'hébergement confortable pour les déplacements",
    accent: "violet",
  },
  {
    icon: "✅",
    title: "Encadrement professionnel",
    description: "Équipe qualifiée au service de chaque activité",
    accent: "teal",
  },
];

/* ─────────────────────────────────────────────
   Stat pill sub-component
   ───────────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md ring-1 ring-amber-200/50 dark:ring-amber-700/40 shadow-sm"
    >
      <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-500 leading-none">
        {value}
      </span>
      <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
        {label}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Decorative illustration panel (right side)
   ───────────────────────────────────────────── */
function IllustrationPanel({ prefersReduced }) {
  const motionProps = prefersReduced
    ? {}
    : {
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <motion.div
      variants={prefersReduced ? undefined : containerVariants}
      {...motionProps}
      className="flex flex-col gap-4"
      aria-label="Points clés du centre"
    >
      {/* Top decorative card — overview image placeholder */}
      <motion.div
        variants={prefersReduced ? undefined : fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 ring-1 ring-amber-200/40 dark:ring-amber-700/30 shadow-[0_4px_24px_-6px_rgba(217,119,6,0.15)] dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.3)] p-6 flex items-center gap-5"
      >
        {/* Blob accent */}
        <div
          className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Building icon */}
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-[0_4px_16px_-4px_rgba(217,119,6,0.4)]">
          🏛️
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
            Région de l'Oriental
          </p>
          <p className="text-base font-bold text-stone-800 dark:text-stone-100 leading-snug">
            Pôle éducatif<br />d'excellence
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Oujda · المغرب العربي</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={prefersReduced ? undefined : containerVariants}
        className="grid grid-cols-3 gap-3"
      >
        <StatPill value="6+" label="Services" />
        <StatPill value="100%" label="Institutionnel" />
        <StatPill value="∞" label="Capacité" />
      </motion.div>

      {/* Feature cards grid — staggered */}
      <motion.div
        variants={prefersReduced ? undefined : containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   About — Main Export
   ───────────────────────────────────────────── */
export default function About() {
  const prefersReduced = useReducedMotion();

  const leftMotion = useMemo(
    () =>
      prefersReduced
        ? {}
        : {
            variants: containerVariants,
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, margin: "-80px" },
          },
    [prefersReduced],
  );

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden  px-5 sm:px-8 lg:px-10 py-24 sm:py-32"
    >
      {/* ── Subtle background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 dark:via-amber-700/30 to-transparent" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full opacity-30 dark:opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-50 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120,70,20,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 80%)",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ════════════════ LEFT — Text content ════════════════ */}
          <motion.div
            {...leftMotion}
            className="flex flex-col gap-8"
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
              À propos du centre
            </motion.p>

            {/* Main heading */}
            <motion.div variants={prefersReduced ? undefined : fadeUp} className="space-y-2">
              <h2
                id="about-heading"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-5xl lg:text-7xl font-light leading-[1.05] text-gray-900 dark:text-gray-100"
              >
                Un pôle régional<br />
                <em style={{ color: '#D97706' }} className="not-italic">
                  d&apos;excellence
                </em>
              </h2>
            </motion.div>



            {/* Description paragraphs */}
            <div className="space-y-5">
              <motion.p
                variants={prefersReduced ? undefined : fadeUp}
                className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed"
              >
                Le{" "}
                <strong className="font-semibold text-stone-800 dark:text-stone-200">
                  Centre Régional des Formations et des Rencontres El-Maghrib
                  Al Arabi d'Oujda
                </strong>{" "}
                est un espace institutionnel polyvalent mis à la disposition des
                acteurs du secteur éducatif et des organismes partenaires de la{" "}
                <em className="not-italic font-medium text-amber-700 dark:text-amber-500">
                  région de l'Oriental
                </em>
                .
              </motion.p>

              <motion.p
                variants={prefersReduced ? undefined : fadeUp}
                className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed"
              >
                Il offre des{" "}
                <strong className="font-semibold text-stone-800 dark:text-stone-200">
                  infrastructures d'avant-garde
                </strong>{" "}
                pour accueillir formations continues, séminaires, réunions
                pédagogiques, concours et examens dans les meilleures conditions
                d'encadrement et d'hébergement.
              </motion.p>
            </div>

            {/* Trust indicators row */}
            <motion.ul
              variants={prefersReduced ? undefined : containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
              role="list"
              aria-label="Engagements du centre"
            >
              {[
                { icon: "🏅", text: "Excellence académique" },
                { icon: "🌍", text: "Rayonnement régional" },
                { icon: "🔒", text: "Cadre institutionnel" },
                { icon: "📐", text: "Équipements modernes" },
              ].map(({ icon, text }) => (
                <motion.li
                  key={text}
                  variants={prefersReduced ? undefined : cardVariant}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 ring-1 ring-stone-200/60 dark:ring-slate-600/60 text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  <span aria-hidden="true">{icon}</span>
                  {text}
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA link */}
            <motion.div variants={prefersReduced ? undefined : fadeUp} className="pt-2">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-bold text-sm tracking-wide shadow-[0_6px_28px_-6px_rgba(217,119,6,0.35)] hover:shadow-[0_10px_36px_-4px_rgba(217,119,6,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf2ea] dark:focus-visible:ring-offset-slate-900"
                aria-label="Nous contacter"
              >
                <span>Nous contacter</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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
              </a>
            </motion.div>
          </motion.div>

          {/* ════════════════ RIGHT — Visual panel ════════════════ */}
          <IllustrationPanel prefersReduced={prefersReduced} />
        </div>
      </div>

      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 dark:via-amber-700/30 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
