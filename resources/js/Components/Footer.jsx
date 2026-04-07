import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.png";

// ─── Data (labels via i18n: footer.quickLinks.* / footer.services.*) ───────────

const QUICK_LINKS = [
  { id: "home", href: "/" },
  { id: "about", href: "#about" },
  { id: "formations", href: "/formations" },
  { id: "activities", href: "/activites" },
  { id: "infrastructures", href: "/infrastructures" },
  { id: "contact", href: "#contact" },
];

const SERVICES = [
  { id: "training_rooms" },
  { id: "amphitheaters" },
  { id: "accommodation" },
  { id: "restaurant" },
  { id: "prayer" },
  { id: "spaces" },
];

const socials = [
  {
    label: "Facebook",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const contactInfo = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    value: "+212 ─── ──── ──",
    href: "tel:+212000000000",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    value: "contact@crfr-oujda.ma",
    href: "mailto:contact@crfr-oujda.ma",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    value: "Oujda, Maroc · المغرب",
    href: "#",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const { t } = useTranslation();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLink = (e, href) => {
    if (!href.startsWith("#")) return; // router handles non-anchor
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .footer-root {
          font-family: 'DM Sans', sans-serif;
          background: #fdf2ea;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .dark .footer-root {
          background: #0f0f0f;
          color: #e5e0d8;
        }

        .footer-display { font-family: 'Cormorant Garamond', serif; }

        /* Subtle noise overlay */
        .footer-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .footer-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
        }

        /* ── Column headings ── */
        .footer-heading {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #D97706;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-heading::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #D97706;
          flex-shrink: 0;
        }

        /* ── Links ── */
        .footer-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: rgba(26, 26, 26, 0.65);
          text-decoration: none;
          padding: 4px 0;
          transition: all 0.25s ease;
          position: relative;
        }

        .dark .footer-link {
          color: rgba(229, 224, 216, 0.55);
        }

        .footer-link::before {
          content: '';
          display: inline-block;
          width: 0;
          height: 1px;
          background: #D97706;
          transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          flex-shrink: 0;
        }

        .footer-link:hover {
          color: #D97706;
          padding-left: 4px;
        }

        .footer-link:hover::before { width: 14px; }

        /* ── Contact rows ── */
        .footer-contact-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.82rem;
          color: rgba(26, 26, 26, 0.7);
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px solid rgba(26,26,26,0.08);
          transition: color 0.25s ease;
        }

        .dark .footer-contact-row {
          color: rgba(229, 224, 216, 0.55);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .footer-contact-row:last-child { border-bottom: none; }
        .footer-contact-row:hover { color: #D97706; }

        .footer-contact-icon {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(217, 119, 6, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D97706;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .footer-contact-row:hover .footer-contact-icon {
          background: #D97706;
          color: #fff;
        }

        /* ── Social buttons ── */
        .footer-social {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(26,26,26,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(26, 26, 26, 0.45);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .dark .footer-social {
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(229, 224, 216, 0.4);
        }

        .footer-social:hover {
          border-color: #D97706;
          color: #D97706;
          background: rgba(217, 119, 6, 0.08);
          transform: translateY(-2px);
        }

        /* ── Divider ── */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.3) 40%, rgba(217,119,6,0.3) 60%, transparent 100%);
        }

        /* ── Bottom bar ── */
        .footer-bottom-link {
          font-size: 0.72rem;
          color: rgba(26, 26, 26, 0.5);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .dark .footer-bottom-link {
          color: rgba(229, 224, 216, 0.3);
        }

        .footer-bottom-link:hover { color: #D97706; }

        /* ── Newsletter input ── */
        .footer-newsletter-wrap {
          display: flex;
          border: 1px solid rgba(217,119,6,0.3);
          overflow: hidden;
          margin-top: 0.75rem;
        }

        .footer-newsletter-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #1a1a1a;
        }

        .dark .footer-newsletter-input {
          color: #e5e0d8;
        }

        .footer-newsletter-input::placeholder {
          color: rgba(26, 26, 26, 0.4);
        }

        .dark .footer-newsletter-input::placeholder {
          color: rgba(229, 224, 216, 0.3);
        }

        .footer-newsletter-btn {
          background: #D97706;
          border: none;
          padding: 10px 16px;
          color: #fff;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .footer-newsletter-btn:hover { background: #b45309; }
      `}</style>

      <footer className="footer-root relative">
        {/* Ambient glows */}
        <div className="footer-glow w-80 h-80 bg-amber-600/10 -top-20 -left-20" />
        <div className="footer-glow w-60 h-60 bg-amber-700/8 bottom-0 right-10" />

        {/* ── TOP ACCENT LINE ── */}
        <div className="relative z-10">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D97706] to-transparent opacity-60" />
        </div>

        {/* ── MAIN BODY ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">

            {/* ── COL 1: Brand ── */}
            <div className="lg:col-span-1">
              <a href="/" className="flex items-center gap-3 mb-5 group">
                <img src={logo} alt={t("navbar.logo_alt")} className="w-12 h-auto object-contain" />
                <div>
                  <div className="footer-display text-xl font-light text-gray-900 dark:text-[#e5e0d8] group-hover:text-[#D97706] transition-colors">
                    {t("footer.brand_short")}
                  </div>
                  <div className="text-[0.65rem] tracking-widest text-[#D97706] uppercase">
                    {t("footer.subtitle")}
                  </div>
                </div>
              </a>

              <p className="text-[0.8rem] leading-relaxed text-gray-600 dark:text-[rgba(229,224,216,0.45)] mb-6 max-w-[230px]">
                {t("footer.intro")}
              </p>

              {/* Social */}
              <div className="flex gap-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="footer-social" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── COL 2: Quick links ── */}
            <div>
              <p className="footer-heading">{t("footer.heading_navigation")}</p>
              <nav className="flex flex-col gap-1">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    className="footer-link"
                    onClick={(e) => handleLink(e, link.href)}
                  >
                    <span className="text-[#D97706] text-[0.6rem]">↗</span>
                    <span>{t(`footer.quickLinks.${link.id}`)}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* ── COL 3: Services ── */}
            <div>
              <p className="footer-heading">{t("footer.heading_services")}</p>
              <ul className="flex flex-col gap-1">
                {SERVICES.map((s) => (
                  <li key={s.id} className="footer-link" style={{ cursor: "default" }}>
                    <span className="w-1 h-1 rounded-full bg-[#D97706] flex-shrink-0" />
                    <span>{t(`footer.services.${s.id}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── COL 4: Contact + Newsletter ── */}
            <div>
              <p className="footer-heading">{t("footer.heading_contact")}</p>
              <div className="mb-6">
                {contactInfo.map((c, i) => (
                  <a key={i} href={c.href} className="footer-contact-row">
                    <div className="footer-contact-icon">{c.icon}</div>
                    <span>{c.value}</span>
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-500 dark:text-[rgba(229,224,216,0.35)] mb-1">
                {t("footer.newsletter_label")}
              </p>
              <div className="footer-newsletter-wrap">
                <input
                  type="email"
                  placeholder={t("footer.newsletter_placeholder")}
                  className="footer-newsletter-input"
                />
                <button type="button" className="footer-newsletter-btn">{t("footer.newsletter_cta")}</button>
              </div>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className="footer-divider my-10" />

          {/* ── BOTTOM BAR ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[0.72rem] text-gray-500 dark:text-[rgba(229,224,216,0.25)] text-center sm:text-left">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>

            <div className="flex items-center gap-5">
              <a href="#" className="footer-bottom-link">{t("footer.legal_privacy")}</a>
              <span className="text-gray-400 dark:text-[rgba(229,224,216,0.1)]">|</span>
              <a href="#" className="footer-bottom-link">{t("footer.legal_terms")}</a>
              <span className="text-gray-400 dark:text-[rgba(229,224,216,0.1)]">|</span>
              <a href="#" className="footer-bottom-link">{t("footer.legal_sitemap")}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
