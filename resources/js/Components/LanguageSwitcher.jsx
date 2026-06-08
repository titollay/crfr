import { useTranslation } from "react-i18next";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Language switcher with a premium dropdown and globe icon.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const resolved = i18n.resolvedLanguage || i18n.language || "fr";
  const currentLang = resolved.startsWith("ar") ? "ar" : "fr";

  const languages = [
    { code: "fr", label: t("navbar.lang_fr"), flag: "🇫🇷" },
    { code: "ar", label: t("navbar.lang_ar"), flag: "🇲🇦" },
  ];

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      {({ open }) => (
        <>
          <Menu.Button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-600/30 bg-white/40 text-amber-600 backdrop-blur-md transition-all duration-300 hover:bg-amber-600 hover:text-white dark:border-amber-500/20 dark:bg-slate-900/40 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-slate-900 shadow-sm hover:shadow-amber-500/20"
            aria-label="Select Language"
          >
            <i className={`fa-solid fa-earth-americas transition-transform duration-500 ${open ? 'rotate-180' : ''}`}></i>
          </Menu.Button>

          <AnimatePresence>
            {open && (
              <Menu.Items
                static
                as={motion.div}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white/80 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 focus:outline-none dark:divide-gray-800 dark:bg-slate-900/80 dark:ring-white/10 z-[60]"
              >
                <div className="px-1 py-1">
                  {languages.map((lang) => (
                    <Menu.Item key={lang.code}>
                      {({ active }) => (
                        <button
                          onClick={() => i18n.changeLanguage(lang.code)}
                          className={`${
                            active || currentLang === lang.code
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                              : "text-gray-700 dark:text-gray-200"
                          } group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.label}</span>
                          </div>
                          {currentLang === lang.code && (
                            <i className="fa-solid fa-check text-xs"></i>
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  );
}
