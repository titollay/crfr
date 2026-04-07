import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr/translation.json";
import ar from "./locales/ar/translation.json";

/**
 * Extending languages: add `locales/<lng>/translation.json`, import it above,
 * add it to `resources` + `supportedLngs`, and set RTL in `applyDocumentDirection` if needed.
 */

/**
 * RTL/LTR + lang on <html>. Safe for non-browser contexts.
 */
function applyDocumentDirection(lng) {
  if (typeof document === "undefined") return;
  const code = String(lng || "fr").split("-")[0];
  const dir = code === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", code);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "ar"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: {
      useSuspense: false,
    },
  });

applyDocumentDirection(i18n.language);
i18n.on("languageChanged", applyDocumentDirection);

export default i18n;
