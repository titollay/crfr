import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    createContext,
} from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";

const PRIMARY = "#D97706";

const SALLES = [
    { value: "salle1", label: "Salle 1" },
    { value: "salle2", label: "Salle 2" },
    { value: "salle3", label: "Salle 3" },
    { value: "salle4", label: "Salle 4" },
    { value: "salle5", label: "Salle 5" },
    { value: "salle6", label: "Salle 6" },
];

const FORMATION_STATUS_STYLE = {
    "À venir": {
        color: "#0369a1",
        bg: "rgba(14,165,233,0.12)",
        icon: "fa-solid fa-calendar-days",
    },
    "En cours": {
        color: "#047857",
        bg: "rgba(16,185,129,0.12)",
        icon: "fa-solid fa-play",
    },
    Terminée: {
        color: "#52525b",
        bg: "rgba(113,113,122,0.15)",
        icon: "fa-solid fa-flag-checkered",
    },
    "—": {
        color: "#71717a",
        bg: "rgba(113,113,122,0.1)",
        icon: "fa-solid fa-minus",
    },
};

/**
 * @typedef {{ id_org: number; nom: string }} Organisation
 * @typedef {{ nom: string }} OrganisationRef
 * @typedef {{
 *   id_forma: number;
 *   sujet: string;
 *   categorie_cible?: string;
 *   id_org?: number;
 *   salle?: string;
 *   date_debut: string;
 *   date_fin: string;
 *   lieu: string | null;
 *   nbr_prevu: number;
 *   nbr_reel: number;
 *   superviseur?: string | null;
 *   heures_formation?: number;
 *   observations?: string | null;
 *   organisation: OrganisationRef | null;
 * }} FormationRow
 */

function useDarkMode() {
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains("dark"),
    );
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains("dark")),
        );
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => obs.disconnect();
    }, []);
    return dark;
}

const DM = createContext(false);

function useTheme() {
    const dark = useContext(DM);
    return {
        dark,
        bg: dark ? "#111" : "#fff",
        bgPage: dark ? "#0a0a0a" : "#F4F6FA",
        bgAlt: dark ? "#1a1a1a" : "#f9fafb",
        bgAlt2: dark ? "#161616" : "#fafafa",
        bgHover: dark ? "rgba(217,119,6,0.12)" : "#fff7ed",
        bgInput: dark ? "rgba(255,255,255,0.05)" : "#fff",
        bgTag: dark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
        border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        borderMd: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.13)",
        borderSm: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        text: dark ? "rgba(255,255,255,0.87)" : "#111",
        textSub: dark ? "rgba(255,255,255,0.6)" : "#374151",
        textMuted: dark ? "rgba(255,255,255,0.35)" : "#6b7280",
        textFaint: dark ? "rgba(255,255,255,0.22)" : "#9ca3af",
        shadow: dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.07)",
        shadowLg: dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.18)",
        toastShadow: dark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
    };
}

function StatCard({ icon, label, value, color, sub, headerRight }) {
    const t = useTheme();
    return (
        <div
            style={{
                background: t.bg,
                borderRadius: 12,
                padding: "18px 20px",
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = t.shadowLg;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = t.shadow;
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <i className={icon} style={{ color, fontSize: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: "0.72rem",
                        color: t.textMuted,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: t.text,
                        lineHeight: 1.2,
                    }}
                >
                    {value}
                </div>
                {sub && (
                    <div
                        style={{
                            fontSize: "0.7rem",
                            color: t.textMuted,
                            marginTop: 2,
                        }}
                    >
                        {sub}
                    </div>
                )}
            </div>
            {headerRight && (
                <div style={{ flexShrink: 0, alignSelf: "flex-start" }}>
                    {headerRight}
                </div>
            )}
        </div>
    );
}

/* ------------------- SectionCard ------------------- */
function SectionCard({ title, hint, children, theme, style = {}, headerRight }) {
    const { dark, border, text, textSub } = theme;
    const cardStyle = {
        background: dark
            ? "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
            : "#fff",
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: "24px",
        boxShadow: dark
            ? "0 8px 32px rgba(0,0,0,0.2)"
            : "0 8px 24px rgba(0,0,0,0.04)",
        ...style,
    };
    return (
        <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: hint ? 6 : 16 }}>
                <div>
                   <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: text, margin: 0 }}>{title}</h3>
                   {hint && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: textSub, lineHeight: 1.45 }}>{hint}</p>
                   )}
                </div>
                {headerRight && <div>{headerRight}</div>}
            </div>
            {children}
        </div>
    );
}

function Toast({ msg, type, onClose }) {
    const t = useTheme();
    useEffect(() => {
        const id = setTimeout(onClose, 3500);
        return () => clearTimeout(id);
    }, [onClose]);
    const colors = { success: "#10b981", error: "#ef4444", info: PRIMARY };
    const c = colors[type] || PRIMARY;
    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                background: t.bg,
                border: `1.5px solid ${c}`,
                borderLeft: `4px solid ${c}`,
                borderRadius: 8,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: t.toastShadow,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem",
                color: t.text,
                minWidth: 260,
                animation: "slideUp 0.3s ease",
            }}
        >
            <i
                className={`fa-solid ${
                    type === "success"
                        ? "fa-circle-check"
                        : type === "error"
                          ? "fa-circle-xmark"
                          : "fa-circle-info"
                }`}
                style={{ color: c, fontSize: 16 }}
            />
            <span style={{ flex: 1 }}>{msg}</span>
            <button
                type="button"
                onClick={onClose}
                style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.textFaint,
                    fontSize: 14,
                }}
            >
                <i className="fa-solid fa-xmark" />
            </button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

function Modal({ title, onClose, children, width = 640 }) {
    const t = useTheme();
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: t.dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
            role="presentation"
        >
            <div
                style={{
                    background: t.bg,
                    borderRadius: 14,
                    width: "100%",
                    maxWidth: width,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: t.shadowLg,
                    border: `1px solid ${t.border}`,
                    animation: "modalIn 0.25s ease",
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: `1px solid ${t.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: t.text }}>{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: t.textFaint,
                            fontSize: 15,
                        }}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
                <div style={{ padding: "24px" }}>{children}</div>
            </div>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
    );
}

function Field({ label, required, children, error }) {
    const t = useTheme();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
                style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: t.textSub,
                    letterSpacing: "0.04em",
                }}
            >
                {label}
                {required && <span style={{ color: PRIMARY }}> *</span>}
            </label>
            {children}
            {error && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{error}</span>}
        </div>
    );
}

/** Même composant que sur la page Chambres */
function CustomSelect({ value, onChange, options, focused, onFocus, onBlur, error }) {
    const t = useTheme();
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                onBlur?.();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onBlur]);

    const borderColor = error ? "#ef4444" : focused ? PRIMARY : t.borderMd;
    const shadow = focused && !error ? `0 0 0 3px rgba(217,119,6,0.15)` : "none";

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => {
                    setOpen((o) => !o);
                    onFocus?.();
                }}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 7,
                    padding: "9px 12px",
                    fontSize: "0.85rem",
                    fontFamily: "'DM Sans', sans-serif",
                    background: t.bgInput,
                    color: t.text,
                    cursor: "pointer",
                    boxShadow: shadow,
                    transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
                    textAlign: "left",
                }}
            >
                <span>{value}</span>
                <i
                    className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
                    style={{ fontSize: 10, color: t.textMuted, marginLeft: 8, flexShrink: 0 }}
                />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        borderRadius: 8,
                        boxShadow: t.dark ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 500,
                        overflow: "hidden",
                        maxHeight: 220,
                        overflowY: "auto",
                    }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt}
                            onMouseDown={() => {
                                onChange(opt);
                                setOpen(false);
                                onBlur?.();
                            }}
                            style={{
                                padding: "9px 14px",
                                fontSize: "0.84rem",
                                color: opt === value ? PRIMARY : t.text,
                                background:
                                    opt === value
                                        ? t.dark
                                            ? "rgba(217,119,6,0.15)"
                                            : "rgba(217,119,6,0.08)"
                                        : "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontWeight: opt === value ? 600 : 400,
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                if (opt !== value)
                                    e.currentTarget.style.background = t.dark
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.04)";
                            }}
                            onMouseLeave={(e) => {
                                if (opt !== value) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {opt}
                            {opt === value && (
                                <i className="fa-solid fa-check" style={{ fontSize: 11, color: PRIMARY }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function formationFormFromInitial(initial) {
    return {
        sujet: initial.sujet ?? "",
        categorie_cible: initial.categorie_cible ?? "",
        id_org: initial.id_org != null ? String(initial.id_org) : "",
        salle: initial.salle ?? "",
        date_debut: initial.date_debut ?? "",
        date_fin: initial.date_fin ?? "",
        nbr_prevu: String(initial.nbr_prevu ?? 0),
        nbr_reel: String(initial.nbr_reel ?? 0),
        superviseur: initial.superviseur ?? "",
        heures_formation: String(initial.heures_formation ?? 0),
        observations: initial.observations ?? "",
    };
}

function FormationForm({ initial = {}, onSubmit, loading, organisations }) {
    const t = useTheme();
    const [form, setForm] = useState(() => formationFormFromInitial(initial));
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);
    const [availableSalles, setAvailableSalles] = useState([]);
    const [loadingSalles, setLoadingSalles] = useState(false);

    const isEdit = Boolean(initial.id_forma);

    useEffect(() => {
        setForm(formationFormFromInitial(initial));
        setErrors({});
    }, [initial.id_forma]);

    // Fetch available salles when dates change
    useEffect(() => {
        if (form.date_debut && form.date_fin && form.date_fin >= form.date_debut) {
            const fetchAvailableSalles = async () => {
                setLoadingSalles(true);
                try {
                    const token = localStorage.getItem("token");
                    const params = {
                        date_debut: form.date_debut,
                        date_fin: form.date_fin,
                    };
                    if (isEdit && initial.id_forma) {
                        params.exclude_id = initial.id_forma;
                    }
                    const res = await axios.get("/api/formations/available-salles", {
                        params,
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setAvailableSalles(res.data);
                } catch (err) {
                    console.error("Erreur chargement salles disponibles:", err);
                    setAvailableSalles([]);
                } finally {
                    setLoadingSalles(false);
                }
            };
            fetchAvailableSalles();
        } else {
            setAvailableSalles([]);
        }
    }, [form.date_debut, form.date_fin]);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
        // Reset salle when dates change (only for new formations)
        if ((k === "date_debut" || k === "date_fin") && !isEdit) {
            setForm((f) => ({ ...f, [k]: v, salle: "" }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.sujet.trim()) e.sujet = "Sujet requis";
        if (!form.categorie_cible.trim()) e.categorie_cible = "Catégorie cible requise";
        if (!form.id_org) e.id_org = "Organisation requise";
        if (!form.salle) e.salle = "Salle requise";
        if (!form.date_debut) e.date_debut = "Date de début requise";
        if (!form.date_fin) e.date_fin = "Date de fin requise";
        else if (form.date_debut && form.date_fin < form.date_debut) {
            e.date_fin = "La fin doit être après ou égale au début";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        onSubmit({
            sujet: form.sujet.trim(),
            categorie_cible: form.categorie_cible.trim(),
            id_org: Number(form.id_org),
            salle: form.salle,
            date_debut: form.date_debut,
            date_fin: form.date_fin,
            nbr_prevu: Number(form.nbr_prevu) || 0,
            nbr_reel: Number(form.nbr_reel) || 0,
            superviseur: form.superviseur.trim() || null,
            heures_formation: Number(form.heures_formation) || 0,
            observations: form.observations.trim() || null,
        });
    };

    const inputStyle = (k) => ({
        border: `1px solid ${errors[k] ? "#ef4444" : focus === k ? PRIMARY : t.borderMd}`,
        borderRadius: 7,
        padding: "9px 12px",
        fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        color: t.text,
        background: t.bgInput,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focus === k && !errors[k] ? "0 0 0 3px rgba(217,119,6,0.15)" : "none",
    });

    const datesReady = form.date_debut && form.date_fin && form.date_fin >= form.date_debut;
    const salleDisabled = !datesReady || loadingSalles;

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ── Dates first ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Date de début" required error={errors.date_debut}>
                    <input
                        type="date"
                        style={inputStyle("date_debut")}
                        value={form.date_debut}
                        onChange={(e) => set("date_debut", e.target.value)}
                        onFocus={() => setFocus("date_debut")}
                        onBlur={() => setFocus(null)}
                    />
                </Field>
                <Field label="Date de fin" required error={errors.date_fin}>
                    <input
                        type="date"
                        style={inputStyle("date_fin")}
                        value={form.date_fin}
                        onChange={(e) => set("date_fin", e.target.value)}
                        onFocus={() => setFocus("date_fin")}
                        onBlur={() => setFocus(null)}
                    />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Sujet" required error={errors.sujet}>
                    <input
                        style={inputStyle("sujet")}
                        value={form.sujet}
                        onChange={(e) => set("sujet", e.target.value)}
                        onFocus={() => setFocus("sujet")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex : Sécurité au travail"
                    />
                </Field>
                <Field label="Catégorie cible" required error={errors.categorie_cible}>
                    <input
                        style={inputStyle("categorie_cible")}
                        value={form.categorie_cible}
                        onChange={(e) => set("categorie_cible", e.target.value)}
                        onFocus={() => setFocus("categorie_cible")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex : Agents de maîtrise"
                    />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Organisation" required error={errors.id_org}>
                    <select
                        style={{ ...inputStyle("id_org"), appearance: "none", cursor: "pointer" }}
                        value={form.id_org}
                        onChange={(e) => set("id_org", e.target.value)}
                        onFocus={() => setFocus("id_org")}
                        onBlur={() => setFocus(null)}
                    >
                        <option value="">— Sélectionner une organisation —</option>
                        {(Array.isArray(organisations) ? organisations : []).map((org) => (
                            <option key={org.id_org} value={String(org.id_org)}>
                                {org.nom}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Salle" required error={errors.salle}>
                    <select
                        style={{
                            ...inputStyle("salle"),
                            appearance: "none",
                            cursor: salleDisabled ? "not-allowed" : "pointer",
                            opacity: salleDisabled ? 0.55 : 1,
                        }}
                        value={form.salle}
                        onChange={(e) => set("salle", e.target.value)}
                        onFocus={() => setFocus("salle")}
                        onBlur={() => setFocus(null)}
                        disabled={salleDisabled}
                    >
                        <option value="">
                            {loadingSalles
                                ? "Chargement des salles…"
                                : !datesReady
                                  ? "⏳ Sélectionnez d'abord les dates"
                                  : availableSalles.length === 0
                                    ? "Aucune salle disponible"
                                    : "— Choisir une salle —"}
                        </option>
                        {availableSalles.map((s) => (
                            <option key={s.id_salle} value={s.num_salle}>
                                {s.num_salle}
                            </option>
                        ))}
                    </select>
                    {datesReady && !loadingSalles && availableSalles.length > 0 && (
                        <span style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 4 }}>
                            {availableSalles.length} salle(s) disponible(s) pour ces dates
                        </span>
                    )}
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Nombre prévu" error={errors.nbr_prevu}>
                    <input
                        type="number"
                        min={0}
                        style={inputStyle("nbr_prevu")}
                        value={form.nbr_prevu}
                        onChange={(e) => set("nbr_prevu", e.target.value)}
                        onFocus={() => setFocus("nbr_prevu")}
                        onBlur={() => setFocus(null)}
                    />
                </Field>
                <Field label="Nombre réel" error={errors.nbr_reel}>
                    <input
                        type="number"
                        min={0}
                        style={inputStyle("nbr_reel")}
                        value={form.nbr_reel}
                        onChange={(e) => set("nbr_reel", e.target.value)}
                        onFocus={() => setFocus("nbr_reel")}
                        onBlur={() => setFocus(null)}
                    />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Heures de formation" error={errors.heures_formation}>
                    <input
                        type="number"
                        min={0}
                        style={inputStyle("heures_formation")}
                        value={form.heures_formation}
                        onChange={(e) => set("heures_formation", e.target.value)}
                        onFocus={() => setFocus("heures_formation")}
                        onBlur={() => setFocus(null)}
                    />
                </Field>
                <Field label="Superviseur" error={errors.superviseur}>
                    <input
                        style={inputStyle("superviseur")}
                        value={form.superviseur}
                        onChange={(e) => set("superviseur", e.target.value)}
                        onFocus={() => setFocus("superviseur")}
                        onBlur={() => setFocus(null)}
                        placeholder="Optionnel"
                    />
                </Field>
            </div>

            <Field label="Observations" error={errors.observations}>
                <textarea
                    style={{ ...inputStyle("observations"), resize: "vertical", minHeight: 72 }}
                    value={form.observations}
                    onChange={(e) => set("observations", e.target.value)}
                    onFocus={() => setFocus("observations")}
                    onBlur={() => setFocus(null)}
                    placeholder="Notes internes…"
                    rows={3}
                />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: PRIMARY,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 24px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "opacity 0.2s, transform 0.15s",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    {loading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin" /> Enregistrement…
                        </>
                    ) : (
                        <>
                            <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-graduation-cap"}`} />
                            {isEdit ? "Mettre à jour" : "Ajouter la formation"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function getFormationStatus(dateDebutStr, dateFinStr) {
    const parseLocalDate = (s) => {
        if (!s) return null;
        const [y, m, d] = s.split("-").map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    };

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const debut = parseLocalDate(dateDebutStr);
    const fin = parseLocalDate(dateFinStr);

    if (!debut || !fin) return { label: "—", sortKey: 3 };
    if (todayStart < debut) return { label: "À venir", sortKey: 0 };
    if (todayStart <= fin) return { label: "En cours", sortKey: 1 };
    return { label: "Terminée", sortKey: 2 };
}

function FormationStatusBadge({ dateDebut, dateFin }) {
    const { label } = getFormationStatus(dateDebut, dateFin);
    const cfg = FORMATION_STATUS_STYLE[label] || FORMATION_STATUS_STYLE["—"];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 999,
                background: cfg.bg,
                color: cfg.color,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
            }}
        >
            <i className={cfg.icon} style={{ fontSize: 10 }} />
            {label}
        </span>
    );
}

function formatDateFr(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function FormationsStatusDoughnut({ byStatus }) {
    const t = useTheme();
    const series = [
        byStatus["À venir"] || 0,
        byStatus["En cours"] || 0,
        byStatus["Terminée"] || 0,
        byStatus["—"] || 0
    ];
    const options = {
        chart: { type: "donut", fontFamily: "'DM Sans', sans-serif" },
        labels: ["À venir", "En cours", "Terminée", "Non définie"],
        colors: ["#3B82F6", "#10B981", "#64748B", "#CBD5E1"],
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: { position: "bottom", labels: { colors: t.textSub }, markers: { radius: 12 } },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        name: { color: t.textMuted, fontSize: "12px" },
                        value: { color: t.text, fontSize: "20px", fontWeight: 800 },
                        total: { show: true, label: "Total", color: t.textSub }
                    }
                }
            }
        },
        tooltip: { theme: t.dark ? "dark" : "light" }
    };
    return <ReactApexChart options={options} series={series} type="donut" height={320} />;
}

function FormationsParOrgBar({ orgSorted }) {
    const t = useTheme();
    const labels = orgSorted.map((o) => o.nom);
    const values = orgSorted.map((o) => o.total);
    const options = {
        chart: { type: "bar", toolbar: { show: false }, fontFamily: "'DM Sans', sans-serif" },
        plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
        colors: [PRIMARY],
        dataLabels: { enabled: true, style: { fontSize: "10px" }, formatter: (v) => v },
        xaxis: {
            categories: labels,
            labels: { style: { colors: t.textMuted, fontSize: "11px" } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: t.textMuted, fontSize: "11px" } } },
        grid: { borderColor: t.borderSm, strokeDashArray: 4, xaxis: { lines: { show: true } } },
        tooltip: { theme: t.dark ? "dark" : "light" }
    };
    return <ReactApexChart options={options} series={[{ name: "Formations", data: values }]} type="bar" height={Math.max(300, labels.length * 35)} />;
}

function buildFormationStats(formations) {
    const bySalle = {};
    const heuresParSalle = {};
    const byStatus = { "À venir": 0, "En cours": 0, Terminée: 0, "—": 0 };
    let totalPrevu = 0;
    let totalReel = 0;
    let totalHeures = 0;
    const byOrg = {};

    formations.forEach((f) => {
        const st = getFormationStatus(f.date_debut, f.date_fin).label;
        if (Object.prototype.hasOwnProperty.call(byStatus, st)) byStatus[st] += 1;
        else byStatus["—"] += 1;

        const salleNum = f.salle?.num_salle || f.salle;
        if (salleNum) {
            bySalle[salleNum] = (bySalle[salleNum] || 0) + 1;
            heuresParSalle[salleNum] = (heuresParSalle[salleNum] || 0) + (Number(f.heures_formation) || 0);
        }

        totalPrevu += Number(f.nbr_prevu) || 0;
        totalReel += Number(f.nbr_reel) || 0;
        totalHeures += Number(f.heures_formation) || 0;

        const nom = f.organisation?.nom?.trim() || "—";
        byOrg[nom] = (byOrg[nom] || 0) + 1;
    });

    const orgSorted = Object.entries(byOrg)
        .map(([nom, total]) => ({ nom, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const sallesUtilisees = Object.keys(bySalle).length;

    return {
        bySalle,
        heuresParSalle,
        byStatus,
        totalPrevu,
        totalReel,
        totalHeures,
        orgSorted,
        sallesUtilisees,
        total: formations.length,
    };
}

function buildCombinedTimelineSeries(formations, intervenants, granularity) {
    const parseLocal = (dStr) => {
        if (!dStr) return null;
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? null : d;
    };

    if (!formations || formations.length === 0) {
        return { labels: [], formationCounts: [], intervenantCounts: [], participantTotals: [] };
    }

    let minTime = Infinity;
    let maxTime = -Infinity;

    formations.forEach(f => {
        const start = parseLocal(f.date_debut);
        let end = parseLocal(f.date_fin);
        if (!end && start) end = start; 
        if (start) minTime = Math.min(minTime, start.getTime());
        if (end) maxTime = Math.max(maxTime, end.getTime());
    });

    if (minTime === Infinity) {
        minTime = new Date().getTime();
        maxTime = minTime + 7 * 86400000;
    }

    const periods = [];
    const minD = new Date(minTime);
    minD.setHours(0,0,0,0);
    const maxD = new Date(maxTime);
    maxD.setHours(23,59,59,999);

    let current = new Date(minD);

    if (granularity === "day") {
        while (current <= maxD) {
            const end = new Date(current);
            end.setHours(23,59,59,999);
            periods.push({
                start: new Date(current),
                end,
                label: current.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
            });
            current.setDate(current.getDate() + 1);
        }
    } else if (granularity === "month") {
        current.setDate(1);
        while (current <= maxD) {
            const end = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
            periods.push({
                start: new Date(current),
                end,
                label: current.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
            });
            current.setMonth(current.getMonth() + 1);
        }
    } else {
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        current.setDate(diff);
        while (current <= maxD) {
            const end = new Date(current);
            end.setDate(current.getDate() + 6);
            end.setHours(23,59,59,999);
            const w0 = new Date(current);
            periods.push({
                start: w0,
                end,
                label: `Sem. ${w0.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
            });
            current.setDate(current.getDate() + 7);
        }
    }

    const formationCounts = [];
    const participantTotals = [];

    periods.forEach(p => {
        let fCount = 0;
        let pTotal = 0;
        formations.forEach(f => {
            const fStart = parseLocal(f.date_debut);
            let fEnd = parseLocal(f.date_fin);
            if (!fEnd && fStart) fEnd = fStart;
            
            if (fStart && fStart.getTime() <= p.end.getTime() && fEnd.getTime() >= p.start.getTime()) {
                fCount++;
                pTotal += Math.max(0, parseInt(f.nbr_reel, 10) || parseInt(f.nbr_prevu, 10) || 0);
            }
        });
        formationCounts.push(fCount);
        participantTotals.push(pTotal);
    });

    return {
        labels: periods.map(p => p.label),
        formationCounts,
        intervenantCounts: [],
        participantTotals,
    };
}

function TimelineGranularityToggle({ value, onChange }) {
    const t = useTheme();
    const opts = [
        { id: "day", label: "Jour" },
        { id: "week", label: "Semaine" },
        { id: "month", label: "Mois" },
    ];
    return (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Agrégation temporelle">
            {opts.map((o) => {
                const sel = value === o.id;
                return (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => onChange(o.id)}
                        style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: `1px solid ${sel ? PRIMARY : t.borderMd}`,
                            background: sel ? (t.dark ? "rgba(217,119,6,0.14)" : "#fff7ed") : t.bgInput,
                            color: sel ? PRIMARY : t.textSub,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

function IntervenantsEvolutionChart({ labels, values }) {
    const t = useTheme();
    const options = useMemo(() => ({
        chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false }, background: "transparent" },
        stroke: { curve: "smooth", width: 4, colors: [PRIMARY] },
        markers: { size: 4, colors: ["#fff"], strokeColors: PRIMARY, strokeWidth: 2 },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: t.textMuted, fontSize: "10px" } }
        },
        yaxis: { labels: { style: { colors: t.textMuted, fontSize: "11px" } } },
        grid: { borderColor: t.borderSm, strokeDashArray: 4 },
        theme: { mode: t.dark ? "dark" : "light" },
        tooltip: { theme: t.dark ? "dark" : "light" }
    }), [labels, t.dark, t.textMuted, t.borderSm]);

    const series = [{ name: "Intervenants", data: values }];

    return (
        <div style={{ height: 260 }}>
            <ReactApexChart options={options} series={series} type="line" height="100%" />
        </div>
    );
}

function FormationsCountTimelineBar({ labels, values }) {
    const t = useTheme();
    const options = useMemo(() => ({
        chart: { type: "bar", toolbar: { show: false }, zoom: { enabled: false }, background: "transparent" },
        plotOptions: {
            bar: { borderRadius: 4, columnWidth: "40%" }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: t.textMuted, fontSize: "10px" } }
        },
        yaxis: { labels: { style: { colors: t.textMuted, fontSize: "11px" } } },
        grid: { borderColor: t.borderSm, strokeDashArray: 4 },
        colors: ["#D97706"], // Primary color
        theme: { mode: t.dark ? "dark" : "light" },
        tooltip: { theme: t.dark ? "dark" : "light" }
    }), [labels, t.dark, t.textMuted, t.borderSm]);

    const series = [{ name: "Formations", data: values }];

    return (
        <div style={{ height: 260 }}>
            <ReactApexChart options={options} series={series} type="bar" height="100%" />
        </div>
    );
}

function ParticipantsTimelineLine({ labels, values }) {
    const t = useTheme();
    
    const options = useMemo(() => ({
        chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false }, background: "transparent" },
        stroke: { curve: "smooth", width: 3, colors: ["#3B82F6"] },
        markers: { size: 4, colors: ["#3B82F6"], strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: t.textMuted, fontSize: "10px" } }
        },
        yaxis: {
            labels: { style: { colors: t.textMuted, fontSize: "11px" } }
        },
        grid: { borderColor: t.borderSm, strokeDashArray: 4 },
        colors: ["#3B82F6"], // Changed to the matching blue
        theme: { mode: t.dark ? "dark" : "light" },
        tooltip: { theme: t.dark ? "dark" : "light" }
    }), [labels, t.dark, t.textMuted, t.borderSm]);

    const series = [{ name: "Participants", data: values }];

    if (!labels.length) {
        return <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: 0 }}>Aucune donnée.</p>;
    }

    return (
        <div style={{ height: 260 }}>
            <ReactApexChart options={options} series={series} type="line" height="100%" />
        </div>
    );
}

function DeleteFormationConfirm({ formation, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer la formation" onClose={onClose} width={420}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 22 }} />
                </div>
                <p style={{ fontSize: "0.9rem", color: t.textSub, marginBottom: 8 }}>
                    Voulez-vous vraiment supprimer la formation
                </p>
                <p style={{ fontWeight: 700, color: t.text, fontSize: "1rem", margin: "0 0 16px" }}>
                    {formation.sujet}
                </p>
                <p style={{ fontSize: "0.78rem", color: t.textFaint }}>Cette action est irréversible.</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        border: `1px solid ${t.borderMd}`,
                        background: t.bgInput,
                        borderRadius: 8,
                        padding: "9px 24px",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: t.textSub,
                        transition: "all 0.2s",
                    }}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        background: loading ? "#fca5a5" : "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "9px 24px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    Supprimer
                </button>
            </div>
        </Modal>
    );
}

function actionBtnStyle(t, variant) {
    const isDel = variant === "delete";
    return {
        width: 32,
        height: 32,
        borderRadius: 7,
        border: `1px solid ${t.border}`,
        background: t.bg,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isDel ? "#ef4444" : PRIMARY,
        fontSize: 13,
        transition: "all 0.15s",
    };
}

function FormationsPageInner() {
    const t = useTheme();

    const [formations, setFormations] = useState(/** @type {FormationRow[]} */ ([]));
    const [organisations, setOrganisations] = useState(/** @type {Organisation[]} */ ([]));
    const [intervenants, setIntervenants] = useState(/** @type {any[]} */ ([]));
    const [salles, setSalles] = useState(/** @type {any[]} */ ([]));
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(/** @type {string | null} */ (null));
    const [search, setSearch] = useState("");
    const [orgFilterLabel, setOrgFilterLabel] = useState("Toutes");
    const [sortKey, setSortKey] = useState("date_debut");
    const [sortDir, setSortDir] = useState("desc");
    const [modal, setModal] = useState(/** @type {null | 'add' | { edit: FormationRow } | { del: FormationRow }} */ (null));
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(/** @type {{ msg: string; type: string } | null} */ (null));
    const [kpiMode, setKpiMode] = useState("total");
    const [activeTab, setActiveTab] = useState("liste");
    const [page, setPage] = useState(1);
    const [timelineGranularity, setTimelineGranularity] = useState("day");

    useEffect(() => { setPage(1); }, [search, orgFilterLabel, sortKey, sortDir]);


    const token = localStorage.getItem("token");
    const headers = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }),
        [token],
    );

    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setListError(null);
        try {
            const [formRes, orgRes, sallesRes, interRes] = await Promise.all([
                axios.get("/api/formations", { headers }),
                axios.get("/api/organisations", { headers }),
                axios.get("/api/salles", { headers }),
                axios.get("/api/intervenants", { headers }),
            ]);
            setFormations(Array.isArray(formRes.data) ? formRes.data : []);
            setOrganisations(Array.isArray(orgRes.data) ? orgRes.data : []);
            setSalles(Array.isArray(sallesRes.data) ? sallesRes.data : []);
            setIntervenants(Array.isArray(interRes.data) ? interRes.data : []);
        } catch (err) {
            setListError(
                err.response?.data?.message ??
                    "Impossible de charger les données. Vérifiez la connexion ou vos droits d’accès.",
            );
            showToast("Erreur de chargement des données", "error");
        } finally {
            setLoading(false);
        }
    }, [headers, showToast]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        const onResize = () => setIsMobileTable(window.innerWidth < 860);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const orgOptions = useMemo(() => {
        const orgs = Array.isArray(organisations) ? organisations : [];
        const names = orgs
            .map((o) => o.nom?.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, "fr"));
        return ["Toutes", ...names];
    }, [organisations]);

    const handleAdd = async (payload) => {
        setSaving(true);
        try {
            await axios.post("/api/formations", payload, { headers });
            showToast("Formation ajoutée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(" ")
                : err.response?.data?.message || "Erreur lors de l'ajout";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (payload) => {
        if (!modal?.edit) return;
        setSaving(true);
        try {
            await axios.put(`/api/formations/${modal.edit.id_forma}`, payload, { headers });
            showToast("Formation modifiée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(" ")
                : err.response?.data?.message || "Erreur lors de la modification";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!modal?.del) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/formations/${modal.del.id_forma}`, { headers });
            showToast("Formation supprimée", "info");
            setModal(null);
            fetchAll();
        } catch {
            showToast("Erreur lors de la suppression", "error");
        } finally {
            setDeleting(false);
        }
    };

    const filteredSorted = useMemo(() => {
        const q = search.toLowerCase().trim();
        let rows = formations.filter((f) => {
            const matchOrg = orgFilterLabel === "Toutes" || f.organisation?.nom === orgFilterLabel;
            if (!matchOrg) return false;
            if (!q) return true;
            const org = f.organisation?.nom?.toLowerCase() ?? "";
            const lieu = (f.lieu ?? "").toLowerCase();
            return (
                f.sujet.toLowerCase().includes(q) ||
                org.includes(q) ||
                lieu.includes(q) ||
                (f.categorie_cible ?? "").toLowerCase().includes(q)
            );
        });

        rows = [...rows].sort((a, b) => {
            let va;
            let vb;
            switch (sortKey) {
                case "sujet":
                    va = a.sujet.toLowerCase();
                    vb = b.sujet.toLowerCase();
                    break;
                case "organisation":
                    va = (a.organisation?.nom ?? "").toLowerCase();
                    vb = (b.organisation?.nom ?? "").toLowerCase();
                    break;
                case "date_debut":
                    va = a.date_debut || "";
                    vb = b.date_debut || "";
                    break;
                case "lieu":
                    va = (a.lieu ?? "").toLowerCase();
                    vb = (b.lieu ?? "").toLowerCase();
                    break;
                case "statut": {
                    va = getFormationStatus(a.date_debut, a.date_fin).sortKey;
                    vb = getFormationStatus(b.date_debut, b.date_fin).sortKey;
                    break;
                }
                default:
                    va = a.date_debut || "";
                    vb = b.date_debut || "";
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return rows;
    }, [formations, search, orgFilterLabel, sortKey, sortDir]);

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredSorted.length / itemsPerPage);
    const paginated = filteredSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const statsData = useMemo(() => buildFormationStats(formations), [formations]);

    const kpiData = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const filtered = formations.filter(f => {
            if (kpiMode === "total") return true;
            const d = new Date(f.date_debut);
            if (kpiMode === "today") return d >= startOfToday;
            if (kpiMode === "month") return d >= startOfMonth;
            if (kpiMode === "year") return d >= startOfYear;
            return true;
        });

        const total = filtered.length;
        const enCours = filtered.filter(f => getFormationStatus(f.date_debut, f.date_fin).label === "En cours").length;
        const upcoming = filtered.filter(f => getFormationStatus(f.date_debut, f.date_fin).label === "À venir").length;
        const participants = filtered.reduce((acc, curr) => acc + (Number(curr.nbr_reel) || 0), 0);

        return { total, enCours, upcoming, participants };
    }, [formations, kpiMode]);

    const timelineSeries = useMemo(
        () => buildCombinedTimelineSeries(formations, intervenants, timelineGranularity),
        [formations, intervenants, timelineGranularity],
    );

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir(key === "date_debut" ? "desc" : "asc");
        }
    };



    const cardStyle = {
        background: t.bg,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        overflow: "hidden",
    };

    const thBase = {
        padding: "12px 16px",
        textAlign: "left",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: t.textMuted,
        textTransform: "uppercase",
        background: t.bgAlt,
        borderBottom: `1px solid ${t.border}`,
    };

    const tdBase = {
        padding: "12px 16px",
        fontSize: "0.82rem",
        color: t.text,
        borderBottom: `1px solid ${t.borderSm}`,
    };

    const rowEvenBg = t.bg;
    const rowOddBg = t.dark ? "rgba(255,255,255,0.02)" : "#fcfcfd";

    const closeModal = () => {
        if (!saving && !deleting) setModal(null);
    };

    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="fa-solid fa-graduation-cap" style={{ color: PRIMARY }} /> Formations
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                    <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                    <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Formations</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", background: t.bgInput, borderRadius: 8, padding: 2, border: `1px solid ${t.borderMd}` }}>
                        {[{id: "liste", icon: "fa-list"}, {id: "stats", icon: "fa-chart-pie"}].map(b => (
                            <button key={b.id} onClick={() => setActiveTab(b.id)} style={{ border: "none", background: activeTab === b.id ? PRIMARY : "transparent", color: activeTab === b.id ? "#fff" : t.textSub, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", display: "flex", gap: 5, alignItems: "center", transition: "all 0.2s" }}>
                                <i className={`fa-solid ${b.icon}`} /> {b.id === "liste" ? "Liste" : "Statistiques"}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setModal("add")} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", boxShadow: "0 4px 12px rgba(217,119,6,0.2)" }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: 6 }} /> Ajouter
                    </button>
                </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
                {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

                {activeTab === "liste" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={cardStyle}>
                            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: t.bgAlt }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.bgInput, border: `1px solid ${t.borderMd}`, borderRadius: 8, padding: "4px 10px", width: 240 }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: t.textFaint }} />
                                    <input placeholder="Rechercher..." style={{ border: "none", background: "transparent", outline: "none", color: t.text, fontSize: "0.82rem", flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div style={{ width: 200 }}>
                                    <CustomSelect value={orgFilterLabel} onChange={setOrgFilterLabel} options={orgOptions} />
                                </div>
                                <div style={{ fontSize: "0.75rem", color: t.textFaint }}>{filteredSorted.length} résultats</div>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {[
                                                { label: "Sujet", key: "sujet" },
                                                { label: "Organisation", key: "organisation" },
                                                { label: "Dates", key: "date_debut" },
                                                { label: "Lieu", key: "lieu" },
                                                { label: "Statut", key: "statut" }
                                            ].map(col => (
                                                <th key={col.label} style={thBase} onClick={() => toggleSort(col.key)}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {col.label} {col.key === sortKey && <i className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"}`} style={{ color: PRIMARY }} />}
                                                    </div>
                                                </th>
                                            ))}
                                            <th style={{ ...thBase, textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={6} style={{ textAlign: "center", padding: 60, color: t.textMuted }}><i className="fa-solid fa-spinner fa-spin fa-2x" /></td></tr>
                                        ) : paginated.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: "center", padding: 60, color: t.textMuted }}>Aucune formation trouvée</td></tr>
                                        ) : paginated.map((f, idx) => (
                                            <tr key={f.id_forma} style={{ background: idx % 2 === 0 ? t.bg : (t.dark ? "rgba(255,255,255,0.02)" : "#fcfcfd"), transition: "background 0.2s" }}>
                                                <td style={tdBase}><span style={{ fontWeight: 700, color: t.text }}>{f.sujet}</span></td>
                                                <td style={tdBase}><span style={{ color: t.textSub }}>{f.organisation?.nom}</span></td>
                                                <td style={tdBase}>
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <span style={{ fontWeight: 600, color: t.text }}>{formatDateFr(f.date_debut)}</span>
                                                        <span style={{ fontSize: "0.7rem", color: t.textMuted }}>au {formatDateFr(f.date_fin)}</span>
                                                    </div>
                                                </td>
                                                <td style={tdBase}><span style={{ color: t.textMuted }}>{f.lieu}</span></td>
                                                <td style={tdBase}><FormationStatusBadge dateDebut={f.date_debut} dateFin={f.date_fin} /></td>
                                                <td style={{ ...tdBase, textAlign: "right" }}>
                                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                        <button onClick={() => setModal({ edit: f })} style={{ border: "solid 1px ", background: "transparent", color: PRIMARY, cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5 }}><i className="fa-solid fa-pen" /></button>
                                                        <button onClick={() => setModal({ del: f })} style={{ border: "solid 1px ", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5 }}><i className="fa-solid fa-trash" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination Controls */}
                            {!loading && filteredSorted.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${t.borderSm}`, background: t.bgAlt }}>
                                    <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                                        Affichage de {(page - 1) * itemsPerPage + 1} à {Math.min(page * itemsPerPage, filteredSorted.length)} sur {filteredSorted.length} résultats
                                    </span>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === 1 ? "transparent" : t.bgInput, color: page === 1 ? t.textFaint : t.text, cursor: page === 1 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-left" /></button>
                                        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === totalPages || totalPages === 0 ? "transparent" : t.bgInput, color: page === totalPages || totalPages === 0 ? t.textFaint : t.text, cursor: page === totalPages || totalPages === 0 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-right" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "stats" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeInUp 0.5s ease forwards" }}>
                        <div style={{ marginBottom: 4 }}>
                            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: t.text, margin: "0 0 4px" }}>Analyses & Statistiques</h2>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: t.textSub }}>
                                Aperçu de la répartition et de l'évolution des formations.
                            </p>
                        </div>
                        
                        {/* ── KPI Cards ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                            <StatCard
                                icon="fa-solid fa-graduation-cap"
                                label="Total Formations"
                                value={kpiData.total}
                                color="#D97706"
                                headerRight={
                                    <select
                                        value={kpiMode}
                                        onChange={(e) => setKpiMode(e.target.value)}
                                        className="rounded bg-orange-400 text-white px-2 py-1 cursor-pointer outline-none border-none text-right w-24 h-8 text-xs font-bold"
                                        style={{ appearance: "none", textAlignLast: "center" }}
                                    >
                                        <option value="total">Total</option>
                                        <option value="today">Aujourd'hui</option>
                                        <option value="month">Ce mois</option>
                                        <option value="year">Cette année</option>
                                    </select>
                                }
                            />
                            <StatCard
                                icon="fa-solid fa-spinner fa-spin"
                                label="En cours"
                                value={kpiData.enCours}
                                color="#10B981"
                            />
                            <StatCard
                                icon="fa-solid fa-users"
                                label="Participants"
                                value={kpiData.participants}
                                color="#8B5CF6"
                            />
                            <StatCard
                                icon="fa-solid fa-calendar-day"
                                label="À venir"
                                value={kpiData.upcoming}
                                color="#3B82F6"
                            />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                            
                            <div style={{ background: t.bg, padding: "16px 24px", borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: t.text }}>
                                    Agrégation des graphiques ci-dessous
                                </h3>
                                <TimelineGranularityToggle value={timelineGranularity} onChange={setTimelineGranularity} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
                                <div style={{ background: t.bg, padding: 24, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                        <i className="fa-solid fa-chart-column" style={{ color: PRIMARY, marginRight: 8 }} />
                                        Formations par période
                                    </h3>
                                    <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: t.textMuted }}>
                                        Évolution du nombre de formations existantes dans le temps.
                                    </p>
                                    <FormationsCountTimelineBar
                                        labels={timelineSeries.labels}
                                        values={timelineSeries.formationCounts}
                                    />
                                </div>

                                <div style={{ background: t.bg, padding: 24, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                        <i className="fa-solid fa-chart-line" style={{ color: "#3B82F6", marginRight: 8 }} />
                                        Participants par période
                                    </h3>
                                    <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: t.textMuted }}>
                                        Évolution du nombre total cumulé de participants.
                                    </p>
                                    <ParticipantsTimelineLine
                                        labels={timelineSeries.labels}
                                        values={timelineSeries.participantTotals}
                                    />
                                </div>
                            </div>

                            <div style={{ background: t.bg, padding: 24, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                                 <h4 style={{ margin: "0 0 20px", color: t.text, fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className="fa-solid fa-chart-pie" style={{ color: PRIMARY }} />
                                    Répartition par Statut
                                 </h4>
                                 <FormationsStatusDoughnut byStatus={statsData.byStatus} />
                            </div>
                        </div>

                        
                    </div>
                )}
            </div>


            {modal === "add" && (
                <Modal title="Ajouter une formation" onClose={closeModal}>
                    <FormationForm
                        key="add"
                        initial={{}}
                        organisations={organisations}
                        onSubmit={handleAdd}
                        loading={saving}
                    />
                </Modal>
            )}
            {modal?.edit && (
                <Modal title={`Modifier — ${modal.edit.sujet}`} onClose={closeModal}>
                    <FormationForm
                        key={modal.edit.id_forma}
                        initial={modal.edit}
                        organisations={organisations}
                        onSubmit={handleEdit}
                        loading={saving}
                    />
                </Modal>
            )}
            {modal?.del && (
                <DeleteFormationConfirm
                    formation={modal.del}
                    onConfirm={handleDelete}
                    onClose={closeModal}
                    loading={deleting}
                />
            )}
        </div>
    );
}

export default function FormationsPage() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <FormationsPageInner />
        </DM.Provider>
    );
}
