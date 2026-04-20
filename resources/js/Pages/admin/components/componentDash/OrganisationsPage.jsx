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

const PRIMARY = "var(--admin-primary, #D97706)";

const TYPE_SUGGESTIONS = [
    "Entreprise",
    "Association",
    "Établissement public",
    "ONG",
    "Collectivité",
    "Coopérative",
    "Autre",
];

/**
 * @typedef {{
 *   id_org: number;
 *   nom: string;
 *   ville_org: string;
 *   type: string;
 *   parent_id: number | null;
 *   parent: { id_org: number; nom: string } | null;
 *   intervenants_count: number;
 *   formations_count: number;
 *   created_at: string | null;
 * }} OrgRow
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
        bgHover: dark ? "color-mix(in srgb, var(--admin-primary), transparent 88%)" : "color-mix(in srgb, var(--admin-primary), white 95%)",
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

function SectionCard({ title, children, theme: t, headerRight }) {
    return (
        <div
            style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                boxShadow: t.shadow,
                overflow: "hidden",
                margin: "0 0 24px",
                transition: "background 0.3s, border-color 0.3s",
            }}
        >
            <div
                style={{
                    padding: "18px 24px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: t.dark ? "rgba(255,255,255,0.01)" : "#fafbff",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: t.text, letterSpacing: "-0.01em" }}>{title}</h2>
                {headerRight}
            </div>
            <div style={{ padding: 24 }}>{children}</div>
        </div>
    );
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

function Modal({ title, onClose, children, width = 560 }) {
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

function Field({ label, required, children, error, hint }) {
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
            {hint && !error && (
                <span style={{ fontSize: "0.68rem", color: t.textFaint }}>{hint}</span>
            )}
            {error && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{error}</span>}
        </div>
    );
}

/** @param {{ value: string; onChange: (v: string) => void; options: string[]; focused?: boolean; onFocus?: () => void; onBlur?: () => void; error?: string }} props */
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

function formatDateFr(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function orgFormFromInitial(initial) {
    return {
        nom: initial.nom ?? "",
        ville_org: initial.ville_org ?? "",
        type: initial.type ?? "",
        parent_id: initial.parent_id != null ? String(initial.parent_id) : "",
    };
}

function OrganisationForm({ initial = {}, onSubmit, loading, parentOptions }) {
    const t = useTheme();
    const [form, setForm] = useState(() => orgFormFromInitial(initial));
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);

    useEffect(() => {
        setForm(orgFormFromInitial(initial));
        setErrors({});
    }, [initial.id_org]);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.nom.trim()) e.nom = "Nom requis";
        if (!form.ville_org.trim()) e.ville_org = "Ville requise";
        if (!form.type.trim()) e.type = "Type requis";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        onSubmit({
            nom: form.nom.trim(),
            ville_org: form.ville_org.trim(),
            type: form.type.trim(),
            parent_id: form.parent_id ? Number(form.parent_id) : null,
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

    const isEdit = Boolean(initial.id_org);

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nom" required error={errors.nom}>
                <input
                    style={inputStyle("nom")}
                    value={form.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    onFocus={() => setFocus("nom")}
                    onBlur={() => setFocus(null)}
                    placeholder="Ex. ACME Maroc"
                />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Ville" required error={errors.ville_org}>
                    <input
                        style={inputStyle("ville_org")}
                        value={form.ville_org}
                        onChange={(e) => set("ville_org", e.target.value)}
                        onFocus={() => setFocus("ville_org")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex. Casablanca"
                    />
                </Field>
                <Field
                    label="Type"
                    required
                    error={errors.type}
                    hint="Saisie libre ou suggestion ci-dessous."
                >
                    <input
                        style={inputStyle("type")}
                        value={form.type}
                        onChange={(e) => set("type", e.target.value)}
                        onFocus={() => setFocus("type")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex. Entreprise"
                        list="org-type-suggestions"
                    />
                    <datalist id="org-type-suggestions">
                        {TYPE_SUGGESTIONS.map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </Field>
            </div>

            <Field label="Organisation parente" hint="Optionnel — pour une filiale ou un site rattaché à une tête de groupe.">
                <select
                    style={{ ...inputStyle("parent_id"), appearance: "none", cursor: "pointer" }}
                    value={form.parent_id}
                    onChange={(e) => set("parent_id", e.target.value)}
                    onFocus={() => setFocus("parent_id")}
                    onBlur={() => setFocus(null)}
                >
                    <option value="">— Aucune (organisation racine) —</option>
                    {parentOptions.map((o) => (
                        <option key={o.id_org} value={o.id_org}>
                            {o.nom}
                        </option>
                    ))}
                </select>
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
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                    }}
                >
                    {loading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin" /> Enregistrement…
                        </>
                    ) : (
                        <>
                            <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-building"}`} />
                            {isEdit ? "Mettre à jour" : "Ajouter l’organisation"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function DeleteOrgConfirm({ org, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer l’organisation" onClose={onClose} width={420}>
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
                    Voulez-vous vraiment supprimer
                </p>
                <p style={{ fontWeight: 700, color: t.text, fontSize: "1rem", margin: "0 0 16px" }}>{org.nom}</p>
                <p style={{ fontSize: "0.78rem", color: t.textFaint }}>
                    Impossible s’il existe des bénéficiaires, formations ou organisations filles liés.
                </p>
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

// ── Chart Components ──

function OrgTypeChart({ data }) {
    const t = useTheme();
    const stats = useMemo(() => {
        const counts = {};
        data.forEach((o) => {
            counts[o.type] = (counts[o.type] || 0) + 1;
        });
        return {
            labels: Object.keys(counts),
            series: Object.values(counts),
        };
    }, [data]);

    const options = {
        chart: { type: "donut", fontFamily: "'DM Sans', sans-serif" },
        labels: stats.labels,
        colors: ["#D97706", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#6366F1"],
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: {
            position: "bottom",
            labels: { colors: t.textSub },
            markers: { radius: 12 }
        },
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

    return <ReactApexChart options={options} series={stats.series} type="donut" height="100%" />;
}

function OrgVilleChart({ data }) {
    const t = useTheme();
    const stats = useMemo(() => {
        const counts = {};
        data.forEach((o) => {
            counts[o.ville_org] = (counts[o.ville_org] || 0) + 1;
        });
        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        return {
            labels: sorted.map((x) => x[0]),
            series: [{ name: "Organisations", data: sorted.map((x) => x[1]) }],
        };
    }, [data]);

    const options = {
        chart: { type: "bar", toolbar: { show: false }, fontFamily: "'DM Sans', sans-serif" },
        plotOptions: {
            bar: { borderRadius: 8, columnWidth: "45%", distributed: true }
        },
        colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899", "#14B8A6"],
        dataLabels: { enabled: false },
        xaxis: {
            categories: stats.labels,
            labels: { style: { colors: t.textMuted, fontSize: "11px" } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: t.textMuted, fontSize: "11px" } }
        },
        grid: { borderColor: t.borderSm, strokeDashArray: 4 },
        legend: { show: false },
        tooltip: { theme: t.dark ? "dark" : "light" }
    };

    return <ReactApexChart options={options} series={stats.series} type="bar" height="100%" />;
}

function OrganisationsPageInner() {
    const t = useTheme();
    const [orgs, setOrgs] = useState(/** @type {OrgRow[]} */ ([]));
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(/** @type {string | null} */ (null));
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("Tous");
    const [sortKey, setSortKey] = useState("nom");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);
    useEffect(() => { setPage(1); }, [search, typeFilter, sortKey, sortDir]);

    const [modal, setModal] = useState(
        /** @type {null | 'add' | { edit: OrgRow } | { del: OrgRow }} */ (null),
    );
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(/** @type {{ msg: string; type: string } | null} */ (null));
    const [kpiMode, setKpiMode] = useState("total");
    const [activeTab, setActiveTab] = useState("liste");

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
            const res = await axios.get("/api/organisations", { headers });
            setOrgs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setListError(
                err.response?.data?.message ??
                    "Impossible de charger les organisations. Vérifiez la connexion ou vos droits d’accès.",
            );
            showToast("Erreur de chargement", "error");
        } finally {
            setLoading(false);
        }
    }, [headers, showToast]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);



    const typeOptions = useMemo(() => {
        const types = [...new Set(orgs.map((o) => o.type?.trim()).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b, "fr"),
        );
        return ["Tous", ...types];
    }, [orgs]);

    const parentOptionsForForm = useMemo(() => {
        const exclude = modal?.edit?.id_org;
        return orgs
            .filter((o) => o.id_org !== exclude)
            .map((o) => ({ id_org: o.id_org, nom: o.nom }))
            .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    }, [orgs, modal]);

    const handleAdd = async (payload) => {
        setSaving(true);
        try {
            await axios.post("/api/organisations", payload, { headers });
            showToast("Organisation ajoutée");
            setModal(null);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(" ")
                : err.response?.data?.message || "Erreur lors de l’ajout";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (payload) => {
        if (!modal?.edit) return;
        setSaving(true);
        try {
            await axios.put(`/api/organisations/${modal.edit.id_org}`, payload, { headers });
            showToast("Organisation mise à jour");
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
            await axios.delete(`/api/organisations/${modal.del.id_org}`, { headers });
            showToast("Organisation supprimée", "info");
            setModal(null);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de la suppression";
            showToast(msg, "error");
        } finally {
            setDeleting(false);
        }
    };

    const kpiData = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const filter = (o) => {
            if (!o.created_at) return kpiMode === "total";
            const d = new Date(o.created_at);
            if (kpiMode === "today") return o.created_at.slice(0, 10) === todayStr;
            if (kpiMode === "month") return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            if (kpiMode === "year") return d.getFullYear() === currentYear;
            return true;
        };

        const filtered = orgs.filter(filter);
        const totalInterv = filtered.reduce((s, o) => s + (o.intervenants_count || 0), 0);
        const totalForm   = filtered.reduce((s, o) => s + (o.formations_count || 0), 0);
        const villes      = new Set(filtered.map((o) => o.ville_org?.trim()).filter(Boolean));

        return { total: filtered.length, intervenants: totalInterv, formations: totalForm, villes: villes.size };
    }, [orgs, kpiMode]);

    const filteredSorted = useMemo(() => {
        const q = search.toLowerCase().trim();
        let rows = orgs.filter((o) => {
            const matchType = typeFilter === "Tous" || o.type === typeFilter;
            if (!matchType) return false;
            if (!q) return true;
            const blob = `${o.nom} ${o.ville_org} ${o.type} ${o.parent?.nom ?? ""}`.toLowerCase();
            return blob.includes(q);
        });

        rows = [...rows].sort((a, b) => {
            let va;
            let vb;
            switch (sortKey) {
                case "nom":
                    va = a.nom.toLowerCase();
                    vb = b.nom.toLowerCase();
                    break;
                case "ville_org":
                    va = a.ville_org.toLowerCase();
                    vb = b.ville_org.toLowerCase();
                    break;
                case "type":
                    va = a.type.toLowerCase();
                    vb = b.type.toLowerCase();
                    break;
                case "intervenants_count":
                    va = a.intervenants_count;
                    vb = b.intervenants_count;
                    break;
                case "formations_count":
                    va = a.formations_count;
                    vb = b.formations_count;
                    break;
                case "created_at":
                    va = a.created_at || "";
                    vb = b.created_at || "";
                    break;
                default:
                    va = a.nom.toLowerCase();
                    vb = b.nom.toLowerCase();
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return rows;
    }, [orgs, search, typeFilter, sortKey, sortDir]);

    const itemsPerPage = 7;
    const totalPages = Math.ceil(filteredSorted.length / itemsPerPage);
    const paginated = filteredSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir(
                key === "intervenants_count" || key === "formations_count" || key === "created_at" ? "desc" : "asc",
            );
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
                        <i className="fa-solid fa-building" style={{ color: PRIMARY }} /> Organisations
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                    <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                    <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Organisations</span>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                        <div className="flex flex-col gap-4">
                            {listError && (
                                <div style={{ padding: "12px 20px", borderRadius: 10, background: t.dark ? "rgba(239,68,68,0.12)" : "#fef2f2", color: t.dark ? "#fca5a5" : "#991b1b", fontSize: "0.84rem", marginBottom: 16 }}>
                                    {listError}
                                </div>
                            )}

                            {/* ── Table & Filters ── */}
                            <div style={cardStyle}>
                                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: t.bgAlt }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.bgInput, border: `1px solid ${t.borderMd}`, borderRadius: 8, padding: "4px 10px", width: 240 }}>
                                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: t.textFaint }} />
                                        <input
                                            placeholder="Rechercher..."
                                            style={{ border: "none", background: "transparent", outline: "none", color: t.text, fontSize: "0.82rem", flex: 1, fontFamily: "'DM Sans', sans-serif" }}
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ width: 180 }}>
                                        <CustomSelect value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: t.textFaint }}>{filteredSorted.length} résultats</div>
                                </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {[
                                                { label: "Nom", key: "nom" },
                                                { label: "Ville", key: "ville_org" },
                                                { label: "Type", key: "type" },
                                                { label: "Bénéf.", key: "intervenants_count" },
                                                { label: "Form.", key: "formations_count" },
                                                { label: "Créée", key: "created_at" },
                                            ].map((col) => (
                                             <th key={col.key} style={thBase} onClick={() => toggleSort(col.key)}>
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
                                            <tr>
                                                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                                    <i
                                                        className="fa-solid fa-spinner fa-spin"
                                                        style={{ fontSize: 22, color: PRIMARY }}
                                                    />
                                                    <p style={{ marginTop: 10, fontSize: "0.82rem" }}>Chargement…</p>
                                                </td>
                                            </tr>
                                        ) : paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                                    <p style={{ fontSize: "0.82rem", margin: 0 }}>Aucune organisation trouvée</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginated.map((o, i) => {
                                                return (
                                                    <tr
                                                        key={o.id_org}
                                                        style={{
                                                            background: i % 2 === 0 ? t.bg : t.bgAlt2
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
                                                                {o.nom}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...tdBase, color: t.textSub }}>{o.ville_org}</td>
                                                        <td style={{ ...tdBase, color: t.textSub, fontSize: "0.8rem" }}>
                                                            {o.type}
                                                        </td>
                                                        <td style={{ ...tdBase, color: t.textSub }}>{o.intervenants_count}</td>
                                                        <td style={{ ...tdBase, color: t.textSub }}>{o.formations_count}</td>
                                                        <td style={{ ...tdBase, color: t.textMuted, fontSize: "0.78rem" }}>
                                                            {formatDateFr(o.created_at)}
                                                        </td>
                                                        <td style={tdBase}>
                                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                                <button onClick={() => setModal({ edit: o })} style={{ border: "solid 1px ", background: "transparent", color: PRIMARY, cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5 }}><i className="fa-solid fa-pen" /></button>
                                                                <button onClick={() => setModal({ del: o })} style={{ border: "solid 1px ", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5 }}><i className="fa-solid fa-trash" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
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

                            {/* Mobile Grid removed for consistency with Chambres layout */}
                        </div>
                    </div>
                </div>
            )}

                {activeTab === "stats" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeInUp 0.5s ease forwards" }}>
                        <div style={{ marginBottom: 4 }}>
                            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: t.text, margin: "0 0 4px" }}>Analyses & Statistiques</h2>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: t.textSub }}>
                                Aperçu de la capacité, spécialités et localisation des organisations.
                            </p>
                        </div>
                        
                        {/* ── KPI Cards ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                            <StatCard
                                icon="fa-solid fa-building"
                                label="Total Organisations"
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
                            <StatCard icon="fa-solid fa-users" label="Bénéficiaires" value={kpiData.intervenants} color="#8B5CF6" />
                            <StatCard icon="fa-solid fa-graduation-cap" label="Formations" value={kpiData.formations} color="#10B981" />
                            <StatCard icon="fa-solid fa-location-dot" label="Villes" value={kpiData.villes} color="#3B82F6" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: 24, boxShadow: t.shadow }}>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: t.text, margin: "0 0 16px" }}>Répartition par Type</h3>
                                <div style={{ height: 300 }}>
                                    <OrgTypeChart data={orgs} />
                                </div>
                            </div>
                            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: 24, boxShadow: t.shadow }}>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: t.text, margin: "0 0 16px" }}>Top Villes</h3>
                                <div style={{ height: 300 }}>
                                    <OrgVilleChart data={orgs} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {modal === "add" && (
                <Modal title="Ajouter une organisation" onClose={closeModal}>
                    <OrganisationForm
                        key="add"
                        initial={{}}
                        onSubmit={handleAdd}
                        loading={saving}
                        parentOptions={parentOptionsForForm}
                    />
                </Modal>
            )}
            {modal?.edit && (
                <Modal title={`Modifier — ${modal.edit.nom}`} onClose={closeModal}>
                    <OrganisationForm
                        key={modal.edit.id_org}
                        initial={modal.edit}
                        onSubmit={handleEdit}
                        loading={saving}
                        parentOptions={parentOptionsForForm}
                    />
                </Modal>
            )}
            {modal?.del && (
                <DeleteOrgConfirm
                    org={modal.del}
                    onConfirm={handleDelete}
                    onClose={closeModal}
                    loading={deleting}
                />
            )}
        </div>
    );
}

export default function OrganisationsPage() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <OrganisationsPageInner />
        </DM.Provider>
    );
}
