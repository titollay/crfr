import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import useDarkMode from "../hooks/useDarkMode";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "#about" },

  { label: "Infrastructures", href: "#infrastructures" },
  { label: "Activités", href: "#activites" },
  { label: "Contact", href: "#contact" },
];

/* ── Animated Sun / Moon SVG icon ── */
function DarkModeIcon({ dark }) {
  return (
    <motion.svg
      key={dark ? "moon" : "sun"}
      initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dark ? (
        /* Moon */
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      ) : (
        /* Sun */
        <>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </>
      )}
    </motion.svg>
  );
}

export default function NavBar({ className = "" }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnchorClick = (e, link) => {
    e.preventDefault();
    const { href } = link;

    // Handle home link
    if (href === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
        window.scrollTo(0, 0);
      }
      setMenuOpen(false);
      return;
    }

    // Handle anchor links
    if (href.startsWith("#")) {
      if (location.pathname === "/") {
        // We are on home, scroll to element
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        // We are on another page, navigate home then scroll
        navigate("/");
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
      setMenuOpen(false);
      return;
    }

    // Fallback for any other route
    navigate(href);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fab = [
    {
      label: "login",
      href: "/login",
      onClick: (e) => {
        e.preventDefault();
        navigate("/login");
      },
      icon: <i className="fa-regular text-amber-50 fa-circle-user"></i>,
    },
  ];

  return (
    <>
      <style>{`
        .nav-root {
          font-family: 'DM Sans', sans-serif;
        }

        .nav-link {
          position: relative;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #111;
          text-decoration: none;
          padding-bottom: 3px;
          transition: color 0.25s ease;
        }

        .dark .nav-link { color: #e5e7eb; }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0%; height: 1.5px;
          background: #D97706;
          border-radius: 2px;
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
        }

        .nav-link:hover { color: #D97706; }
        .nav-link:hover::after { width: 100%; }

        .ham-line {
          display: block;
          width: 22px;
          height: 1.5px;
          background: #111;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          transform-origin: center;
        }

        .dark .ham-line { background: #e5e7eb; }

        .mob-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #111;
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(217,119,6,0.1);
          display: block;
          transition: color 0.25s ease, padding-left 0.25s ease;
        }

        .dark .mob-link { color: #d1d5db; }
        .mob-link:hover { color: #D97706; padding-left: 8px; }

        .nav-social-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(217, 119, 6, 1);
          border: 1px solid rgba(217, 119, 6, 0.3);
          color: #111;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          cursor: pointer;
        }

        .nav-social-btn:hover {
          background: #D97706;
          border-color: #D97706;
          color: #fff;
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 10px 25px rgba(217, 119, 6, 0.3);
        }

        /* Dark mode toggle button */
        .dark-toggle {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(217,119,6,0.35);
          background: transparent;
          color: #D97706;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }

        .dark-toggle:hover {
          background: #D97706;
          color: #fff;
          transform: translateY(-2px) scale(1.07);
          box-shadow: 0 8px 22px rgba(217,119,6,0.3);
        }

        .dark .dark-toggle {
          border-color: rgba(251,191,36,0.4);
          color: #fbbf24;
        }

        .dark .dark-toggle:hover {
          background: #fbbf24;
          color: #111;
        }
      `}</style>

      <header
        className={`
          nav-root fixed top-0 left-0 w-full z-50
          transition-all duration-400
          ${
            scrolled
              ? "bg-white/60 dark:bg-gray-900/75 backdrop-blur-xl border-b border-white/5 dark:border-white/10 shadow-2xl"
              : "bg-transparent"
          }
          ${className}
        `}
      >
        <div className="flex justify-around items-center px-6 sm:px-10 xl:px-14 py-4">
          {/* Logo */}
          <a href="#" className="flex justify-center items-center gap-3">
            <img
              src={logo}
              className="w-12 sm:w-14 xl:w-16 h-auto object-contain"
              alt="CRFR logo"
            />
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-[#111] dark:text-gray-100">CRFR Maghreb Arabi</div>
              <div className="text-sm font-semibold text-[#D97706]">Oujda · المغرب العربي</div>
            </div>
          </a>

          <nav className="hidden lg:block">
            <ul className="flex flex-row items-center text-xs xl:text-sm 2xl:text-base md:text-xs gap-2 xl:gap-2 md:gap-4 sm:gap-3 text-shadow-2xs bold justify-around space-x-11">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="nav-link"
                    onClick={(e) => handleAnchorClick(e, link)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                className="dark-toggle"
                onClick={() => setDark((d) => !d)}
                aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <DarkModeIcon key={dark ? "moon" : "sun"} dark={dark} />
                </AnimatePresence>
              </button>

              {fab.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  onClick={s.onClick || undefined}
                  className="nav-social-btn"
                  aria-label={s.label}
                  style={{ cursor: "pointer" }}
                >
                  {s.icon}
                </a>
              ))}
              {location.pathname === "/" && (
                <div className="relative inline-block group px-3 py-2 overflow-hidden rounded-lg border bg-transparent" style={{ borderColor: '#D97706' }}>
                  <span className="absolute top-0 left-0 w-0 h-full transition-all duration-500 group-hover:w-full" style={{ background: '#D97706' }}></span>
                  <a
                    className="relative z-10 text-xs xl:text-sm font-semibold text-[#D97706] group-hover:text-white transition-colors"
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Découvrir
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger + mobile dark toggle */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Mobile dark mode toggle */}
            <button
              className="dark-toggle"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Mode clair" : "Mode sombre"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <DarkModeIcon key={dark ? "moon" : "sun"} dark={dark} />
              </AnimatePresence>
            </button>

            {/* Hamburger */}
            <button
              className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 relative z-50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className="ham-line"
                style={{
                  transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
                  background: menuOpen ? "#D97706" : undefined,
                }}
              />
              <span
                className="ham-line"
                style={{
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? "scaleX(0)" : "none",
                  background: (scrolled || menuOpen) ? undefined : undefined,
                }}
              />
              <span
                className="ham-line"
                style={{
                  transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
                  background: menuOpen ? "#D97706" : undefined,
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden text-center overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-[#D97706]/10 shadow-xl"
            >
              <div className="px-6 py-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <a
                      href={link.href}
                      className="mob-link"
                      onClick={(e) => { handleAnchorClick(e, link); }}
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06 + 0.05 }}
                  className="pt-5 pb-2"
                >
                  <a 
                    href="/login" 
                    className="mob-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Login
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

// ─────────────────────────────────────────────
