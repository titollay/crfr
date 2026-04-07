import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import img3 from "../../../assets/login.webp";
import logo from "../../../assets/logo.png";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Login() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/login', { email: email.trim().toLowerCase(), password });
      localStorage.setItem('token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      navigate('/dashboard');
    } catch (err) {
      console.log(err.response.data)
      setError("Identifiants incorrects, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr;
          background: #ffffff;
        }
        @media (min-width: 1024px) { .login-root { grid-template-columns: 1fr 1fr; } }

        .login-input-wrap {
          position: relative;
          border-bottom: 1px solid rgba(0,0,0,0.12);
          transition: border-color 0.3s ease;
        }
        .login-input-wrap.focused { border-bottom-color: #D97706; }

        .login-input {
          width: 100%; background: transparent; border: none; outline: none;
          color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          padding: 12px 36px 12px 0; transition: color 0.3s ease;
        }
        .login-input::placeholder { color: rgba(0,0,0,0.3); font-size: 0.8rem; letter-spacing: 0.05em; }

        .login-input-icon {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          color: rgba(0,0,0,0.3); font-size: 0.8rem;
          transition: color 0.3s ease; cursor: pointer;
        }
        .login-input-wrap.focused .login-input-icon { color: #D97706; }

        .login-label {
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(0,0,0,0.45); margin-bottom: 4px; display: block;
          transition: color 0.3s ease;
        }

        .login-btn {
          position: relative; overflow: hidden; width: 100%; padding: 14px;
          background: transparent; border: 1px solid rgba(217,119,6,0.5);
          border-radius: 6px;
          color: #D97706; font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
          transition: color 0.35s ease;
        }
        .login-btn::before {
          content: ''; position: absolute; inset: 0; background: #D97706;
          transform: translateX(-101%); transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .login-btn:hover::before { transform: translateX(0); }
        .login-btn:hover { color: #fff; }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .login-img-panel { position: relative; overflow: hidden; display: none; }
        @media (min-width: 1024px) { .login-img-panel { display: block; } }
        .login-img-panel img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }

        .login-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 80%);
          display: flex; flex-direction: column; justify-content: flex-end; padding: 48px;
        }

        .login-divider {
          position: absolute; right: 0; top: 10%; bottom: 10%; width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(217,119,6,0.3), transparent);
        }

        .login-form-panel::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none; opacity: 0.6;
        }

        .login-check {
          width: 14px; height: 14px; border: 1px solid rgba(0,0,0,0.25);
          appearance: none; -webkit-appearance: none; cursor: pointer;
          transition: all 0.3s ease; flex-shrink: 0; position: relative;
        }
        .login-check:checked { background: #D97706; border-color: #D97706; }
        .login-check:checked::after {
          content: ''; position: absolute; left: 3px; top: 1px; width: 5px; height: 8px;
          border: 1.5px solid #fff; border-top: none; border-left: none; transform: rotate(45deg);
        }

        /* Error message */
        .login-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444; font-size: 0.72rem; padding: 10px 14px;
          letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="login-root">
        {/* ── LEFT: Image Panel ── */}
        <div className="login-img-panel">
          <div className="login-divider" />
          <img src={img3} alt="Store visual" />
          <div className="login-img-overlay">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-[#D97706] mb-3">
                CRFR Maghreb
              </p>
              <h2
                className="text-4xl font-light text-white leading-tight max-w-xs"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Apprendre,
                <br />
                <em className="text-[#D97706]">évoluer.</em>
              </h2>
              <div className="w-8 h-px bg-[#D97706] mt-6" />
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="login-form-panel relative flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-16 min-h-dvh">
          <div
            className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(217,119,6,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-60 h-60 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at bottom left, rgba(217,119,6,0.04) 0%, transparent 70%)",
            }}
          />

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative z-10 max-w-sm w-full mx-auto"
          >
            {/* Logo */}
            <motion.div variants={item} className="mb-12 flex justify-center">
              <a href="/">
                <img src={logo} className="h-12 object-contain" alt="logo" />
              </a>
            </motion.div>

            {/* Heading */}
            <motion.div variants={item} className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D97706] mb-3">
                Heureux de vous revoir
              </p>
              <h1
                className="text-4xl font-light text-gray-900 leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Connectez-vous à
                <br />
                <em className="text-[#D97706]">votre compte</em>
              </h1>
            </motion.div>

            {/* ── Form ── */}
            <motion.form
              variants={container}
              className="space-y-8"
              onSubmit={handleSubmit}
            >
              {/* Error message */}
              {error && (
                <motion.div
                  className="login-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <i className="fa-solid fa-circle-exclamation text-xs"></i>
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <motion.div variants={item}>
                <label className="login-label">Adresse e-mail</label>
                <div
                  className={`login-input-wrap ${
                    focused === "email" ? "focused" : ""
                  }`}
                >
                  <input
                    type="email"
                    placeholder="nom@exemple.com"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    required
                  />
                  <span className="login-input-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={item}>
                <label className="login-label">Mot de passe</label>
                <div
                  className={`login-input-wrap ${
                    focused === "password" ? "focused" : ""
                  }`}
                >
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                  />
                  <span
                    className="login-input-icon"
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i
                      className={`fa-regular ${
                        showPass ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </span>
                </div>
              </motion.div>

              {/* Remember + Forgot */}
              <motion.div
                variants={item}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="login-check" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs text-[#D97706] hover:text-[#b45309] transition-colors uppercase font-semibold tracking-wider"
                >
                  Mot de passe oublié ?
                </a>
              </motion.div>

              {/* Submit */}
              <motion.div variants={item}>
                <button type="submit" className="login-btn" disabled={loading}>
                  <span>
                    {loading ? (
                      <>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(217,119,6,0.3)",
                            borderTopColor: "#D97706",
                            
                            borderRadius: "50%",
                          }}
                          className="spin"
                        ></div>{" "}
                        Connexion...
                      </>
                    ) : (
                      "Se connecter →"
                    )}
                  </span>
                </button>
              </motion.div>

              {/* Footer links */}
              <motion.div variants={item} className="space-y-3 pt-2">
                {/* <p className="text-center">
                  <a
                    href="/register"
                    className="text-xs text-gray-500 font-medium hover:text-[#D97706] transition-colors uppercase tracking-wider"
                  >
                    Nouveau client ? Créer un compte
                  </a>
                </p> */}
                <p className="text-center">
                  <a
                    href="/"
                    className="text-xs text-gray-500 font-medium hover:text-[#D97706] transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <i className="fa-solid fa-arrow-left text-[0.6rem]"></i>
                    Retour au site
                  </a>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
