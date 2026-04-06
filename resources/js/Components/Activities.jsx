import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import ActivityCard from "./ActivityCard";

/* ─────────────────────────────────────────────
   Animation variants
   ───────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ─────────────────────────────────────────────
   Activities data
   ───────────────────────────────────────────── */
const ACTIVITIES = [
  {
    icon: "📖",
    title: "Formations continues",
    description:
      "Sessions de perfectionnement professionnel pour les fonctionnaires et les éducateurs dans divers domaines de compétences.",
    accent: "amber",
  },
  {
    icon: "🎤",
    title: "Séminaires pédagogiques",
    description:
      "Ateliers interactifs animés par des experts pour explorer les dernières approches et pratiques pédagogiques.",
    accent: "blue",
  },
  {
    icon: "🏛️",
    title: "Conférences éducatives",
    description:
      "Interventions thématiques réunissant experts nationaux et internationaux autour de l'innovation éducative.",
    accent: "emerald",
  },
  {
    icon: "🤝",
    title: "Réunions professionnelles",
    description:
      "Rencontres stratégiques entre cadres et partenaires pour coordonner les projets et piloter la transformation.",
    accent: "violet",
  },
  {
    icon: "✍️",
    title: "Concours et examens",
    description:
      "Organisation et supervision de concours professionnels et examens de certification dans un cadre rigoureux.",
    accent: "rose",
  },
  {
    icon: "🎉",
    title: "Événements institutionnels",
    description:
      "Cérémonies, journées portes ouvertes et activités culturelles qui renforcent la cohésion de la communauté éducative.",
    accent: "sky",
  },
];

/* ─────────────────────────────────────────────
   Activities section — Main Export
   ───────────────────────────────────────────── */
export default function Activities() {
  const prefersReduced = useReducedMotion();

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
      id="activites"
      aria-labelledby="activities-heading"
      className="relative isolate overflow-hidden bg-[#fdf2ea] dark:bg-gray-900 transition-colors duration-300 px-5 sm:px-8 lg:px-10 py-24 sm:py-32"
    >
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Top edge */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/20 to-transparent" />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72rem] h-[72rem] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 60%)",
          }}
        />

        {/* Floating orb — top-right */}
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { y: [0, -16, 0], scale: [1, 1.07, 1] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-amber-200/12 blur-[100px]"
        />

        {/* Floating orb — bottom-left */}
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { y: [0, 12, 0], scale: [1, 1.08, 1] }
          }
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-200/10 blur-[90px]"
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120,70,20,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 10%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 10%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* ════════ Header ════════ */}
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
            Ce que nous offrons
          </motion.p>

          {/* Heading */}
          <motion.div variants={prefersReduced ? undefined : fadeUp} className="space-y-2">
            <h2
              id="activities-heading"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-5xl lg:text-7xl font-light leading-[1.05] text-gray-900 dark:text-gray-100"
            >
              Nos{" "}
              <em style={{ color: '#D97706' }} className="not-italic">
                activités
              </em>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={prefersReduced ? undefined : fadeUp}
            className="max-w-2xl text-base sm:text-lg text-stone-500 leading-relaxed"
          >
            Nos principales activités et événements professionnels au service du
            développement des compétences et de l&apos;excellence éducative.
          </motion.p>
        </motion.div>

        {/* ════════ Cards grid ════════ */}
        <motion.div
          {...gridMotion}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          role="list"
          aria-label="Liste des activités"
        >
          {ACTIVITIES.map((activity) => (
            <ActivityCard key={activity.title} {...activity} />
          ))}
        </motion.div>
      </div>

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/20 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
