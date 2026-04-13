import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    createContext,
} from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
);

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
    const ref = useRef(null);

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

function StatCard({ icon, label, value, color, sub }) {
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
            <div>
                <div
                    style={{
                        fontSize: "0.72rem",
                        color: t.textMuted,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: t.text, lineHeight: 1.2 }}>{value}</div>
                {sub && <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

function FormationsStatusDoughnut({ byStatus }) {
    const t = useTheme();
    const data = useMemo(
        () => ({
            labels: ["À venir", "En cours", "Terminée", "Sans date valide"],
            datasets: [
                {
                    data: [byStatus["À venir"], byStatus["En cours"], byStatus["Terminée"], byStatus["—"]],
                    backgroundColor: ["#38bdf8", "#34d399", "#a1a1aa", "#d4d4d8"],
                    borderWidth: 0,
                    hoverOffset: 8,
                },
            ],
        }),
        [byStatus],
    );
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: t.textSub,
                        font: { size: 11, family: "'DM Sans', sans-serif" },
                        padding: 12,
                        usePointStyle: true,
                    },
                },
            },
        }),
        [t.textSub],
    );
    return (
        <div style={{ height: 240 }}>
            <Doughnut data={data} options={options} />
        </div>
    );
}

function HeuresParSalleBar({ heuresParSalle }) {
    const t = useTheme();
    const data = useMemo(() => {
        const labels = SALLES.map((s) => s.label);
        const values = SALLES.map((s) => heuresParSalle[s.value] ?? 0);
        return {
            labels,
            datasets: [
                {
                    label: "Heures",
                    data: values,
                    backgroundColor: "rgba(59,130,246,0.75)",
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        };
    }, [heuresParSalle]);
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: t.textMuted, font: { size: 11 } },
                    grid: { color: t.borderSm },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: t.textMuted, font: { size: 11 } },
                    grid: { color: t.borderSm },
                },
            },
        }),
        [t.textMuted, t.borderSm],
    );
    return (
        <div style={{ height: 260 }}>
            <Bar data={data} options={options} />
        </div>
    );
}

function FormationsParOrgBar({ orgSorted }) {
    const t = useTheme();
    const labels = orgSorted.map((o) => o.nom);
    const values = orgSorted.map((o) => o.total);
    const data = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Formations",
                    data: values,
                    backgroundColor: "rgba(16,185,129,0.8)",
                    borderRadius: 4,
                    borderSkipped: false,
                },
            ],
        }),
        [orgSorted],
    );
    const options = useMemo(
        () => ({
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: t.textMuted, font: { size: 11 } },
                    grid: { color: t.borderSm },
                },
                y: {
                    ticks: { color: t.textSub, font: { size: 11 } },
                    grid: { display: false },
                },
            },
        }),
        [t.textMuted, t.textSub, t.borderSm],
    );
    const h = Math.max(200, orgSorted.length * 34);
    return (
        <div style={{ height: h }}>
            <Bar data={data} options={options} />
        </div>
    );
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

/**
 * Regroupe les formations par date de début (jour, semaine calendaire lundi–dimanche, ou mois).
 * Participants : somme du nombre réel s’il est renseigné (> 0), sinon du nombre prévu.
 * @param {FormationRow[]} formations
 * @param {"day" | "week" | "month"} granularity
 */
function buildFormationTimelineSeries(formations, granularity) {
    const parseLocal = (s) => {
        if (!s) return null;
        const [y, m, d] = s.split("-").map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    };

    const startOfWeekMon = (d) => {
        const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dow = x.getDay();
        const diff = dow === 0 ? -6 : 1 - dow;
        x.setDate(x.getDate() + diff);
        return x;
    };

    /** @returns {{ key: string; sort: number }} */
    const keyFor = (d) => {
        if (granularity === "day") {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            const key = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            return { key, sort: d.getTime() };
        }
        if (granularity === "month") {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const key = `${y}-${String(m).padStart(2, "0")}`;
            return { key, sort: new Date(y, m - 1, 1).getTime() };
        }
        const w0 = startOfWeekMon(d);
        const y = w0.getFullYear();
        const m = w0.getMonth() + 1;
        const day = w0.getDate();
        const key = `w:${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return { key, sort: w0.getTime() };
    };

    const labelForKey = (key) => {
        if (granularity === "day") {
            const [y, m, d] = key.split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
            });
        }
        if (granularity === "month") {
            const [y, m] = key.split("-").map(Number);
            return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        }
        const raw = key.slice(2);
        const [y, m, d] = raw.split("-").map(Number);
        const w0 = new Date(y, m - 1, d);
        return `Sem. ${w0.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
    };

    const map = new Map();
    for (const f of formations) {
        let d1 = parseLocal(f.date_debut);
        let d2 = parseLocal(f.date_fin);
        
        if (!d1 && !d2) continue;
        if (!d1) d1 = new Date(d2);
        if (!d2) d2 = new Date(d1);
        
        // Ensure d1 <= d2
        if (d1 > d2) {
            const temp = d1;
            d1 = d2;
            d2 = temp;
        }

        const activeKeys = new Map();
        const cur = new Date(d1);
        cur.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        // Iterate over all days between start and end
        while (cur <= d2) {
            const { key, sort } = keyFor(cur);
            // Record this period key only once per formation
            if (!activeKeys.has(key)) {
                activeKeys.set(key, sort);
            }
            cur.setDate(cur.getDate() + 1);
        }

        const nReel = Number(f.nbr_reel) || 0;
        const nPrevu = Number(f.nbr_prevu) || 0;
        const participants = nReel > 0 ? nReel : nPrevu;

        // Apply formation values to all active periods
        for (const [key, sort] of activeKeys.entries()) {
            if (!map.has(key)) map.set(key, { count: 0, participants: 0, sort });
            const row = map.get(key);
            row.count += 1;
            row.participants += participants;
        }
    }

    const sorted = Array.from(map.entries()).sort((a, b) => a[1].sort - b[1].sort);
    return {
        labels: sorted.map(([k]) => labelForKey(k)),
        formationCounts: sorted.map(([, v]) => v.count),
        participantTotals: sorted.map(([, v]) => v.participants),
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

function FormationsCountTimelineBar({ labels, values }) {
    const t = useTheme();
    const data = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Formations",
                    data: values,
                    backgroundColor: "rgba(217,119,6,0.75)",
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        }),
        [labels, values],
    );
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: t.textMuted, font: { size: 10 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: t.textMuted, font: { size: 11 } },
                    grid: { color: t.borderSm },
                },
            },
        }),
        [t.textMuted, t.borderSm],
    );
    if (!labels.length) {
        return <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: 0 }}>Aucune formation avec date de début.</p>;
    }
    return (
        <div style={{ height: 260 }}>
            <Bar data={data} options={options} />
        </div>
    );
}

function ParticipantsTimelineLine({ labels, values }) {
    const t = useTheme();
    const data = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Participants",
                    data: values,
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139,92,246,0.12)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#8b5cf6",
                    pointBorderColor: t.bg,
                    pointBorderWidth: 2,
                },
            ],
        }),
        [labels, values, t.bg],
    );
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: t.textMuted, font: { size: 10 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: t.textMuted, font: { size: 11 } },
                    grid: { color: t.borderSm },
                },
            },
        }),
        [t.textMuted, t.borderSm],
    );
    if (!labels.length) {
        return <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: 0 }}>Aucune donnée.</p>;
    }
    return (
        <div style={{ height: 260 }}>
            <Line data={data} options={options} />
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
    const [salles, setSalles] = useState(/** @type {any[]} */ ([]));
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(/** @type {string | null} */ (null));
    const [search, setSearch] = useState("");
    const [orgFilterLabel, setOrgFilterLabel] = useState("Toutes");
    const [sortKey, setSortKey] = useState("date_debut");
    const [sortDir, setSortDir] = useState("desc");
    const [isMobileTable, setIsMobileTable] = useState(
        () => typeof window !== "undefined" && window.innerWidth < 860,
    );

    const [modal, setModal] = useState(/** @type {null | 'add' | { edit: FormationRow } | { del: FormationRow }} */ (null));
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(/** @type {{ msg: string; type: string } | null} */ (null));
    const [activeTab, setActiveTab] = useState(/** @type {"liste" | "stats"} */ ("liste"));
    const [timelineGranularity, setTimelineGranularity] = useState(/** @type {"day" | "week" | "month"} */ ("month"));

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
            const [formRes, orgRes, sallesRes] = await Promise.all([
                axios.get("/api/formations", { headers }),
                axios.get("/api/organisations", { headers }),
                axios.get("/api/salles", { headers }),
            ]);
            setFormations(Array.isArray(formRes.data) ? formRes.data : []);
            setOrganisations(Array.isArray(orgRes.data) ? orgRes.data : []);
            setSalles(Array.isArray(sallesRes.data) ? sallesRes.data : []);
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

    const statsData = useMemo(() => buildFormationStats(formations), [formations]);
    const timelineSeries = useMemo(
        () => buildFormationTimelineSeries(formations, timelineGranularity),
        [formations, timelineGranularity],
    );

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir(key === "date_debut" ? "desc" : "asc");
        }
    };

    const SortIcon = ({ k }) => {
        if (sortKey !== k)
            return <i className="fa-solid fa-sort" style={{ opacity: 0.25, fontSize: 10 }} />;
        return (
            <i
                className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"}`}
                style={{ color: PRIMARY, fontSize: 10 }}
            />
        );
    };

    const cardStyle = {
        background: t.bg,
        borderRadius: 12,
        boxShadow: t.shadow,
        border: `1px solid ${t.border}`,
        transition: "background 0.3s, border-color 0.3s",
    };

    const thBase = {
        padding: "11px 14px",
        textAlign: "left",
        fontSize: "0.68rem",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 700,
        color: t.textMuted,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        background: t.dark ? "rgba(255,255,255,0.035)" : "#f7f8fb",
        borderBottom: `1px solid ${t.border}`,
        transition: "background 0.3s",
    };

    const tdBase = {
        padding: "11px 14px",
        fontSize: "0.82rem",
        borderBottom: `1px solid ${t.borderSm}`,
        verticalAlign: "middle",
    };

    const rowEvenBg = t.bg;
    const rowOddBg = t.dark ? "rgba(255,255,255,0.02)" : "#fcfcfd";

    const closeModal = () => {
        if (!saving && !deleting) setModal(null);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: t.bgPage,
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.3s",
                padding: "24px 28px",
            }}
        >
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div
                style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: t.text }}>
                        <i className="fa-solid fa-graduation-cap" style={{ color: PRIMARY, marginRight: 10 }} />
                        Formations
                    </h1>
                    <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: t.textMuted }}>
                        Statistiques temporelles, salles, organisations et gestion des sessions.
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab("liste")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: `1px solid ${activeTab === "liste" ? PRIMARY : t.borderMd}`,
                            background:
                                activeTab === "liste"
                                    ? t.dark
                                        ? "rgba(217,119,6,0.14)"
                                        : "#fff7ed"
                                    : t.bg,
                            color: activeTab === "liste" ? PRIMARY : t.textSub,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s",
                        }}
                    >
                        <i className="fa-solid fa-list" />
                        Liste
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("stats")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: `1px solid ${activeTab === "stats" ? PRIMARY : t.borderMd}`,
                            background:
                                activeTab === "stats"
                                    ? t.dark
                                        ? "rgba(217,119,6,0.14)"
                                        : "#fff7ed"
                                    : t.bg,
                            color: activeTab === "stats" ? PRIMARY : t.textSub,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s",
                        }}
                    >
                        <i className="fa-solid fa-chart-pie" />
                        Statistiques
                    </button>
                    <button
                        type="button"
                        onClick={() => setModal("add")}
                        style={{
                            background: PRIMARY,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 18px",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 4px 14px rgba(217,119,6,0.3)",
                            transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <i className="fa-solid fa-user-plus" />
                        Ajouter
                    </button>
                </div>
            </div>

            {activeTab === "liste" && (
            <div style={{ ...cardStyle, overflow: "hidden" }}>
                {listError && (
                    <div
                        style={{
                            padding: "12px 20px",
                            borderBottom: `1px solid ${t.border}`,
                            background: t.dark ? "rgba(239,68,68,0.12)" : "#fef2f2",
                            color: t.dark ? "#fca5a5" : "#991b1b",
                            fontSize: "0.84rem",
                        }}
                    >
                        {listError}
                    </div>
                )}

                <div
                    style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${t.border}`,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        background: t.dark ? "rgba(255,255,255,0.02)" : "#fafbff",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minWidth: 200,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: `1px solid ${t.borderMd}`,
                            borderRadius: 8,
                            padding: "8px 12px",
                            background: t.bgInput,
                            transition: "background 0.3s, border-color 0.3s",
                        }}
                    >
                        <i className="fa-solid fa-magnifying-glass" style={{ color: t.textFaint, fontSize: 12 }} />
                        <input
                            style={{
                                border: "none",
                                outline: "none",
                                fontSize: "0.82rem",
                                flex: 1,
                                fontFamily: "'DM Sans', sans-serif",
                                color: t.text,
                                background: "transparent",
                            }}
                            placeholder="Rechercher une formation…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: t.textFaint,
                                    fontSize: 12,
                                }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        )}
                    </div>

                    <div style={{ minWidth: 200 }}>
                        <CustomSelect value={orgFilterLabel} onChange={setOrgFilterLabel} options={orgOptions} />
                    </div>

                    <span style={{ fontSize: "0.75rem", color: t.textFaint, whiteSpace: "nowrap" }}>
                        {filteredSorted.length} résultat{filteredSorted.length > 1 ? "s" : ""}
                    </span>
                </div>

                <div style={{ overflowX: "auto", display: isMobileTable ? "none" : "block" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {[
                                    { label: "Sujet", key: "sujet" },
                                    { label: "Organisation", key: "organisation" },
                                    { label: "Dates", key: "date_debut" },
                                    { label: "Lieu", key: "lieu" },
                                    { label: "Statut", key: "statut" },
                                ].map((col) => (
                                    <th key={col.label} style={thBase} onClick={() => toggleSort(col.key)}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {col.label}
                                            <SortIcon k={col.key} />
                                        </span>
                                    </th>
                                ))}
                                <th style={{ ...thBase, textAlign: "right", cursor: "default" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                        <i
                                            className="fa-solid fa-spinner fa-spin"
                                            style={{ fontSize: 22, color: PRIMARY }}
                                        />
                                        <p style={{ marginTop: 10, fontSize: "0.82rem" }}>Chargement des formations…</p>
                                    </td>
                                </tr>
                            ) : filteredSorted.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                        <i
                                            className="fa-regular fa-folder-open"
                                            style={{ fontSize: 28, marginBottom: 10, display: "block", opacity: 0.4 }}
                                        />
                                        <p style={{ fontSize: "0.82rem", margin: 0 }}>Aucune formation trouvée</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSorted.map((f, i) => {
                                    const isEven = i % 2 === 0;
                                    return (
                                        <tr
                                            key={f.id_forma}
                                            style={{
                                                borderBottom: `1px solid ${t.borderSm}`,
                                                background: isEven ? rowEvenBg : rowOddBg,
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = t.bgHover;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isEven ? rowEvenBg : rowOddBg;
                                            }}
                                        >
                                            <td style={tdBase}>
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        color: t.text,
                                                        fontSize: "0.88rem",
                                                        background: t.bgTag,
                                                        padding: "3px 10px",
                                                        borderRadius: 6,
                                                        border: `1px solid ${t.border}`,
                                                    }}
                                                >
                                                    {f.sujet}
                                                </span>
                                            </td>
                                            <td style={{ ...tdBase, color: t.textSub }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <i
                                                        className="fa-solid fa-building"
                                                        style={{ color: PRIMARY, fontSize: 12 }}
                                                    />
                                                    {f.organisation?.nom ?? "—"}
                                                </div>
                                            </td>
                                            <td style={{ ...tdBase, color: t.textSub }}>
                                                <span style={{ fontSize: "0.8rem" }}>
                                                    {formatDateFr(f.date_debut)}
                                                    <span style={{ margin: "0 6px", opacity: 0.45 }}>→</span>
                                                    {formatDateFr(f.date_fin)}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    ...tdBase,
                                                    fontSize: "0.78rem",
                                                    color: t.textMuted,
                                                    maxWidth: 180,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {f.lieu || <span style={{ opacity: 0.35 }}>—</span>}
                                                </span>
                                            </td>
                                            <td style={tdBase}>
                                                <FormationStatusBadge dateDebut={f.date_debut} dateFin={f.date_fin} />
                                            </td>
                                            <td style={tdBase}>
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                    <button
                                                        type="button"
                                                        title="Modifier"
                                                        style={actionBtnStyle(t, "edit")}
                                                        onClick={() => setModal({ edit: f })}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = t.dark
                                                                ? "rgba(217,119,6,0.15)"
                                                                : "#fff7ed";
                                                            e.currentTarget.style.borderColor = PRIMARY;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = t.bg;
                                                            e.currentTarget.style.borderColor = t.border;
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Supprimer"
                                                        style={actionBtnStyle(t, "delete")}
                                                        onClick={() => setModal({ del: f })}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = t.dark
                                                                ? "rgba(239,68,68,0.12)"
                                                                : "#fef2f2";
                                                            e.currentTarget.style.borderColor = "#ef4444";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = t.bg;
                                                            e.currentTarget.style.borderColor = t.border;
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    style={{
                        display: isMobileTable ? "grid" : "none",
                        gap: 10,
                        padding: 12,
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                padding: "18px",
                                textAlign: "center",
                                color: t.textFaint,
                                border: `1px dashed ${t.borderMd}`,
                                borderRadius: 10,
                            }}
                        >
                            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />
                            Chargement des formations…
                        </div>
                    ) : filteredSorted.length === 0 ? (
                        <div
                            style={{
                                padding: "18px",
                                textAlign: "center",
                                color: t.textFaint,
                                border: `1px dashed ${t.borderMd}`,
                                borderRadius: 10,
                            }}
                        >
                            Aucune formation trouvée
                        </div>
                    ) : (
                        filteredSorted.map((f) => (
                            <div
                                key={`card-${f.id_forma}`}
                                style={{
                                    border: `1px solid ${t.border}`,
                                    borderRadius: 10,
                                    padding: 12,
                                    background: t.dark ? "rgba(255,255,255,0.02)" : "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 8,
                                        gap: 8,
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: t.text, fontSize: "0.9rem" }}>{f.sujet}</span>
                                    <FormationStatusBadge dateDebut={f.date_debut} dateFin={f.date_fin} />
                                </div>
                                <div
                                    style={{ fontSize: "0.8rem", color: t.textSub, display: "grid", gap: 6 }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Organisation</span>
                                        <strong>{f.organisation?.nom ?? "—"}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Dates</span>
                                        <strong>
                                            {formatDateFr(f.date_debut)} → {formatDateFr(f.date_fin)}
                                        </strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                        <span>Lieu</span>
                                        <span style={{ textAlign: "right", maxWidth: "65%" }}>{f.lieu ?? "—"}</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 8,
                                        marginTop: 10,
                                    }}
                                >
                                    <button
                                        type="button"
                                        title="Modifier"
                                        style={{ ...actionBtnStyle(t, "edit"), width: 34, height: 34, borderRadius: 8 }}
                                        onClick={() => setModal({ edit: f })}
                                    >
                                        <i className="fa-solid fa-pen-to-square" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Supprimer"
                                        style={{ ...actionBtnStyle(t, "delete"), width: 34, height: 34, borderRadius: 8 }}
                                        onClick={() => setModal({ del: f })}
                                    >
                                        <i className="fa-solid fa-trash" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div
                    style={{
                        padding: "10px 20px",
                        borderTop: `1px solid ${t.border}`,
                        fontSize: "0.72rem",
                        color: t.textFaint,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        {filteredSorted.length} formation{filteredSorted.length > 1 ? "s" : ""} affichée
                        {filteredSorted.length > 1 ? "s" : ""}
                    </span>
                    <span>{formations.length} au total</span>
                </div>
            </div>
            )}

            {activeTab === "stats" && (
                <>
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: 220,
                                ...cardStyle,
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    border: `3px solid ${t.border}`,
                                    borderTop: `3px solid ${PRIMARY}`,
                                    borderRadius: "50%",
                                    animation: "spin 0.7s linear infinite",
                                }}
                            />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : listError ? (
                        <div
                            style={{
                                ...cardStyle,
                                padding: 24,
                                textAlign: "center",
                                color: t.textMuted,
                                fontSize: "0.9rem",
                            }}
                        >
                            {listError}
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: 16,
                                    marginBottom: 24,
                                }}
                            >
                                {(() => {
                                    const sallesDispo = salles.filter(s => s.statut === "Disponible").length;
                                    const sallesOccupees = salles.filter(s => s.statut === "Occupée").length;

                                    return (
                                        <>
                                            <StatCard
                                                icon="fa-solid fa-graduation-cap"
                                                label="Formations"
                                                value={statsData.total}
                                                color={PRIMARY}
                                            />
                                            <StatCard
                                                icon="fa-regular fa-calendar-check"
                                                label="Salles Disponibles"
                                                value={sallesDispo}
                                                color="#10b981"
                                                sub={`sur ${salles.length} salles`}
                                            />
                                            <StatCard
                                                icon="fa-solid fa-door-closed"
                                                label="Salles Occupées"
                                                value={sallesOccupees}
                                                color="#ef4444"
                                                sub={`sur ${salles.length} salles`}
                                            />
                                            <StatCard
                                                icon="fa-solid fa-users"
                                                label="Participants prévus"
                                                value={statsData.totalPrevu}
                                                color="#8b5cf6"
                                            />
                                            <StatCard
                                                icon="fa-solid fa-clock"
                                                label="Heures totales"
                                                value={statsData.totalHeures}
                                                color="#10b981"
                                            />
                                        </>
                                    );
                                })()}
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                                    gap: 20,
                                }}
                            >
                                <div style={{ ...cardStyle, padding: 20 }}>
                                    <h3
                                        style={{
                                            margin: "0 0 16px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        <i className="fa-solid fa-chart-pie" style={{ color: PRIMARY, marginRight: 8 }} />
                                        Formations par statut
                                    </h3>
                                    <FormationsStatusDoughnut byStatus={statsData.byStatus} />
                                </div>

                                <div style={{ ...cardStyle, padding: 20 }}>
                                    <h3
                                        style={{
                                            margin: "0 0 16px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        <i className="fa-solid fa-hourglass-half" style={{ color: "#3b82f6", marginRight: 8 }} />
                                        Heures de formation par salle
                                    </h3>
                                    <HeuresParSalleBar heuresParSalle={statsData.heuresParSalle} />
                                </div>

                                <div
                                    style={{
                                        ...cardStyle,
                                        padding: "14px 20px",
                                        gridColumn: "1 / -1",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 12,
                                    }}
                                >
                                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: t.textSub }}>
                                        Agrégation des graphiques ci-dessous
                                    </span>
                                    <TimelineGranularityToggle value={timelineGranularity} onChange={setTimelineGranularity} />
                                </div>

                                <div style={{ ...cardStyle, padding: 20 }}>
                                    <h3
                                        style={{
                                            margin: "0 0 8px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        <i className="fa-solid fa-chart-column" style={{ color: PRIMARY, marginRight: 8 }} />
                                        Formations par période
                                    </h3>
                                    <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: t.textMuted }}>
                                        Nombre de formations regroupées selon leur date de début (jour, semaine ou mois).
                                    </p>
                                    <FormationsCountTimelineBar
                                        labels={timelineSeries.labels}
                                        values={timelineSeries.formationCounts}
                                    />
                                </div>

                                <div style={{ ...cardStyle, padding: 20 }}>
                                    <h3
                                        style={{
                                            margin: "0 0 8px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        <i className="fa-solid fa-chart-line" style={{ color: "#8b5cf6", marginRight: 8 }} />
                                        Participants par période
                                    </h3>
                                    <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: t.textMuted }}>
                                        Total des participants par période (réel si renseigné, sinon prévu), sur la même
                                        échelle que le graphique des formations.
                                    </p>
                                    <ParticipantsTimelineLine
                                        labels={timelineSeries.labels}
                                        values={timelineSeries.participantTotals}
                                    />
                                </div>

                                <div style={{ ...cardStyle, padding: 20, gridColumn: "1 / -1" }}>
                                    <h3
                                        style={{
                                            margin: "0 0 16px",
                                            fontSize: "0.88rem",
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        <i className="fa-solid fa-building" style={{ color: "#10b981", marginRight: 8 }} />
                                        Formations par organisation
                                    </h3>
                                    {statsData.orgSorted.length === 0 ? (
                                        <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: 0 }}>Aucune donnée.</p>
                                    ) : (
                                        <FormationsParOrgBar orgSorted={statsData.orgSorted} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

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
