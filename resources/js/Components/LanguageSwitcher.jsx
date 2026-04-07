import { useTranslation } from "react-i18next";

/**
 * Language select (FR/AR). Uses i18n.changeLanguage for instant updates.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const resolved = i18n.resolvedLanguage || i18n.language || "fr";
  const value = resolved.startsWith("ar") ? "ar" : "fr";

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label="Language"
        className="h-9 rounded-lg border border-amber-600/30 bg-white/40 pl-3 pr-9 text-[0.7rem] font-bold uppercase tracking-wider text-stone-700 backdrop-blur-sm outline-none transition-colors hover:bg-white/60 focus:ring-2 focus:ring-amber-400/40 dark:border-amber-500/25 dark:bg-slate-900/40 dark:text-stone-100 dark:hover:bg-slate-900/60"
      >
        <option value="fr">{`🇫🇷 ${t("navbar.lang_fr")}`}</option>
        <option value="ar">{`🇲🇦 ${t("navbar.lang_ar")}`}</option>
      </select>

      {/* chevron */}
      <span
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-300"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}
