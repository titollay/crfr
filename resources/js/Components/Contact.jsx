import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import img1 from "../../assets/contact.webp";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const contactInfo = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
    id: "phone",
    value: "+1 234 567 890",
    href: "tel:+1234567890",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    id: "email",
    value: "contact@example.com",
    href: "mailto:contact@example.com",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
    id: "address",
    value: "123 Rue Principale, New York",
    href: "#",
  },
];

const socials = [
  {
    label: "FB",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LI",
    href: "#!",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .contact-root {
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }

        .dark .contact-root {
          color: #f3f4f6;
        }

        .contact-display {
          font-family: 'Cormorant Garamond', serif;
        }

        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .line-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(26,26,26,0.2);
          outline: none;
          width: 100%;
          padding: 12px 0;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.3s ease, color 0.3s ease;
        }

        .dark .line-input {
          border-bottom: 1px solid rgba(255,255,255,0.2);
          color: #f3f4f6;
        }

        .line-input::placeholder { color: rgba(26,26,26,0.3); }
        .dark .line-input::placeholder { color: rgba(255,255,255,0.4); }
        .line-input:focus { border-bottom-color: #FC8C06; }

        .line-textarea {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(26,26,26,0.2);
          outline: none;
          width: 100%;
          padding: 12px 0;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          resize: none;
          transition: border-color 0.3s ease, color 0.3s ease;
        }

        .dark .line-textarea {
          border-bottom: 1px solid rgba(255,255,255,0.2);
          color: #f3f4f6;
        }

        .line-textarea::placeholder { color: rgba(26,26,26,0.3); }
        .dark .line-textarea::placeholder { color: rgba(255,255,255,0.4); }
        .line-textarea:focus { border-bottom-color: #FC8C06; }

        .submit-btn {
          position: relative;
          overflow: hidden;
          background: transparent;
          border: 1px solid rgba(252,140,6,0.6);
          color: #FC8C06;
          padding: 14px 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.4s ease;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #FC8C06;
          transform: translateX(-101%);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .submit-btn:hover::before { transform: translateX(0); }
        .submit-btn:hover { color: #ffffff; }
        .submit-btn span { position: relative; z-index: 1; }

        .contact-info-item {
          position: relative;
          padding: 20px 0;
          border-bottom: 1px solid rgba(26,26,26,0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          group: true;
        }
        
        .dark .contact-info-item {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .contact-info-item:hover .info-icon { background: #FC8C06; color: #ffffff; border-color: #FC8C06; }
        .contact-info-item:hover .info-value { color: #FC8C06; }

        .info-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(26,26,26,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
          color: #FC8C06;
        }

        .dark .info-icon {
          border: 1px solid rgba(255,255,255,0.15);
        }

        .info-value {
          font-size: 0.88rem;
          transition: color 0.3s ease;
          color: #1a1a1a;
        }

        .dark .info-value {
          color: #f3f4f6;
        }

        .info-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,26,26,0.4);
          margin-bottom: 2px;
        }

        .dark .info-label {
          color: rgba(255,255,255,0.5);
        }

        .social-btn {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(26,26,26,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(26,26,26,0.4);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .dark .social-btn {
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5);
        }

        .social-btn:hover { border-color: #FC8C06; color: #FC8C06; background: rgba(252,140,6,0.05); }

        .map-wrapper {
          position: relative;
        }

        .map-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(252,140,6,0.2);
          pointer-events: none;
          z-index: 2;
        }

        .section-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 7rem;
          font-weight: 300;
          color: rgba(252,140,6,0.08);
          line-height: 1;
          position: absolute;
          top: -20px;
          left: -10px;
          pointer-events: none;
          user-select: none;
        }

        .divider-line {
          width: 40px;
          height: 1px;
          background: #FC8C06;
          display: inline-block;
          vertical-align: middle;
          margin-right: 12px;
        }
      `}</style>

      <section
        id="contact"
        className="contact-root noise-bg relative py-24 sm:py-32"
      >
        {/* Ambient glows */}
        <div className="glow-orb w-96 h-96 bg-orange-100/80 top-0 right-0" />
        <div className="glow-orb w-64 h-64 bg-orange-50/60 bottom-32 left-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* ── HEADER ── */}
          <motion.div
            ref={ref}
            className="mb-16 sm:mb-20 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* <span className="section-number">04</span> */}
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-orange-500 mb-4">
                <span className="divider-line" />
                {t("contact.kicker")}
              </p>
              <h2 className="contact-display text-5xl lg:text-7xl font-light leading-[1.05] mb-4 text-gray-900 dark:text-gray-100">
                {t("contact.title_1")}
                <br />
                <em className="text-orange-400">{t("contact.title_em")}</em>
              </h2>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed mt-6">
                {t("contact.subtitle")}
              </p>
            </div>
          </motion.div>

          {/* ── TOP GRID: Map + Contact Info ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Map */}
            <motion.div
              className="map-wrapper h-[360px] overflow-hidden"
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.8899982912885!2d-74.00420432352994!3d40.72280217933011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2598d6e3f42f9%3A0xa9c74f60b97914b8!2sSoHo%2C%20New%20York%2C%20NY%2010013%2C%20USA!5e0!3m2!1sen!2sma!4v1693123456789"
                width="100%"
                height="100%"
                style={{
                  filter: "grayscale(1) contrast(0.9) brightness(0.95)",
                }}
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between"
            >
              <div>
                <h3 className="contact-display text-2xl font-light mb-6 text-gray-800 dark:text-gray-200">
                  {t("contact.stay_connected_title")}
                </h3>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  {t("contact.stay_connected_subtitle")}
                </p>

                <div>
                  {contactInfo.map((item, i) => (
                    <a key={i} href={item.href} className="contact-info-item">
                      <div className="info-icon">{item.icon}</div>
                      <div>
                        <div className="info-label">
                          {t(`contact.info.${item.id}`)}
                        </div>
                        <div className="info-value">{item.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-3 mt-8">
                {socials.map((s, i) => (
                  <a key={i} href={s.href} className="social-btn">
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM: Form + Image ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="border-t border-gray-200 pt-10">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-500 mb-2">
                  <span className="divider-line" />
                  {t("contact.form_kicker")}
                </p>
                <h3 className="contact-display text-3xl lg:text-4xl font-light mb-8 text-gray-900 dark:text-gray-100">
                  {t("contact.form_title")}
                </h3>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-orange-400/30 bg-orange-50 p-8 text-center"
                  >
                    <p className="contact-display text-2xl font-light text-orange-500 mb-2">
                      {t("contact.thanks_title")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t("contact.thanks_subtitle")}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-gray-400 mb-3">
                          {t("contact.form.name_label")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("contact.form.name_placeholder")}
                          required
                          className="line-input"
                          value={formState.name}
                          onChange={(e) =>
                            setFormState({ ...formState, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.15em] text-gray-400 mb-3">
                          {t("contact.form.email_label")}
                        </label>
                        <input
                          type="email"
                          placeholder={t("contact.form.email_placeholder")}
                          required
                          className="line-input"
                          value={formState.email}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.15em] text-gray-400 mb-3">
                        {t("contact.form.message_label")}
                      </label>
                      <textarea
                        rows="5"
                        placeholder={t("contact.form.message_placeholder")}
                        required
                        className="line-textarea"
                        value={formState.message}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="relative inline-block group px-3  py-2 overflow-hidden rounded-lg border border-orange-500 bg-transparent">
                      <span className="absolute top-0 left-0 w-0 h-full bg-orange-500 transition-all duration-500 group-hover:w-full"></span>
                      <a
                        className="relative z-10 text-xs xl:text-sm shadow-2xl text-shadow-2xs font-bold  2xl:text-base sm:text-sm text-[#FC8C06] uppercase  group-hover:text-white transition-colors"
                        href=""
                      >
                        {t("contact.form.submit")} →
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -top-3 -left-3 w-24 h-24 border-t border-l border-orange-500/30 pointer-events-none z-10" />
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b border-r border-orange-500/30 pointer-events-none z-10" />
                <img
                  src={img1}
                  alt={t("contact.image_alt")}
                  className="w-full h-80 lg:h-[440px] object-cover"
                  style={{ filter: "brightness(0.6) contrast(1.05)" }}
                />
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="contact-display text-xl font-light italic text-[#e8e0d5]/80">
                    {t("contact.caption")}
                  </p>
                  <p className="text-xs text-[#e8e0d5]/40 mt-1 uppercase tracking-widest">
                    
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
