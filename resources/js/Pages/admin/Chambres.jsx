import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import axios from "axios";

/* ─────────────────── Dark mode hook ─────────────────── */
function useDarkMode() {
    const [dark, setDark] = useState(
        () => document.documentElement.classList.contains("dark")
    );
    useEffect(() => {
        const obs = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains("dark"));
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);
    return dark;
}

const DM = createContext(false);

/* ─────────────────── Theme tokens ─────────────────── */
function useTheme() {
    const dark = useContext(DM);
    return {
        dark,
        bg:         dark ? "#111"                    : "#fff",
        bgPage:     dark ? "#0a0a0a"                 : "#F4F6FA",
        bgAlt:      dark ? "#1a1a1a"                 : "#f9fafb",
        bgAlt2:     dark ? "#161616"                 : "#fafafa",
        bgHover:    dark ? "rgba(217,119,6,0.12)"    : "#fff7ed",
        bgInput:    dark ? "rgba(255,255,255,0.05)"  : "#fff",
        bgTag:      dark ? "rgba(255,255,255,0.07)"  : "#f3f4f6",
        border:     dark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.08)",
        borderMd:   dark ? "rgba(255,255,255,0.12)"  : "rgba(0,0,0,0.13)",
        borderSm:   dark ? "rgba(255,255,255,0.05)"  : "rgba(0,0,0,0.05)",
        text:       dark ? "rgba(255,255,255,0.87)"  : "#111",
        textSub:    dark ? "rgba(255,255,255,0.6)"   : "#374151",
        textMuted:  dark ? "rgba(255,255,255,0.35)"  : "#6b7280",
        textFaint:  dark ? "rgba(255,255,255,0.22)"  : "#9ca3af",
        shadow:     dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.07)",
        shadowLg:   dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.18)",
        toastShadow:dark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
    };
}

/* ─────────────────── constants ─────────────────── */
const PRIMARY  = "#D97706";
const STATUTS  = ["Disponible", "Occupée", "Maintenance"];
const TYPES    = ["Double"];

const STATUT_CFG = {
    Disponible:  { color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: "fa-solid fa-circle-check"       },
    "Occupée":   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: "fa-solid fa-circle-xmark"       },
    Maintenance: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: "fa-solid fa-circle-exclamation" },
};

/* ─────────────────── Animated donut ─────────────────── */
function Donut({ segments }) {
    const t = useTheme();
    const r = 52, cx = 60, cy = 60;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const paths = segments.map((s) => {
        const dash = (s.pct / 100) * circ;
        const el = (
            <circle
                key={s.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
        );
        offset += dash;
        return el;
    });
    return (
        <svg width="120" height="120" viewBox="0 0 120 120"
            style={{ transform: "rotate(-90deg)" }}>
            <circle cx={cx} cy={cy} r={r} fill="none"
                stroke={t.dark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}
                strokeWidth="14" />
            {paths}
        </svg>
    );
}

/* ─────────────────── Stat Card ─────────────────── */
function StatCard({ icon, label, value, pct, color, bg }) {
    const t = useTheme();
    return (
        <div style={{
            background: t.bg,
            borderRadius: 12,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: t.shadow,
            border: `1px solid ${t.border}`,
            flex: 1,
            minWidth: 160,
            transition: "background 0.3s, border-color 0.3s",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <i className={icon} style={{ color, fontSize: 15 }} />
                </div>
                <span style={{
                    fontSize: "0.72rem", color: t.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
                }}>
                    {label}
                </span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: t.text, lineHeight: 1 }}>{value}</div>
            {pct !== undefined && (
                <div style={{ fontSize: "0.75rem", color }}>
                    <i className="fa-solid fa-chart-simple" style={{ marginRight: 4 }} />
                    {pct}% du total
                </div>
            )}
        </div>
    );
}

/* ─────────────────── Badge ─────────────────── */
function Badge({ statut }) {
    const cfg = STATUT_CFG[statut] || {};
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px",
            borderRadius: 999,
            background: cfg.bg,
            color: cfg.color,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
        }}>
            <i className={cfg.icon} style={{ fontSize: 10 }} />
            {statut}
        </span>
    );
}

/* ─────────────────── Toast ─────────────────── */
function Toast({ msg, type, onClose }) {
    const t = useTheme();
    useEffect(() => {
        const id = setTimeout(onClose, 3500);
        return () => clearTimeout(id);
    }, [onClose]);
    const colors = { success: "#10b981", error: "#ef4444", info: PRIMARY };
    const c = colors[type];
    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: t.bg,
            border: `1.5px solid ${c}`,
            borderLeft: `4px solid ${c}`,
            borderRadius: 8,
            padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: t.toastShadow,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem",
            color: t.text,
            minWidth: 260,
            animation: "slideUp 0.3s ease",
            transition: "background 0.3s",
        }}>
            <i className={`fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-info"}`}
                style={{ color: c, fontSize: 16 }} />
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={onClose} style={{
                border: "none", background: "transparent", cursor: "pointer",
                color: t.textFaint, fontSize: 14,
            }}>
                <i className="fa-solid fa-xmark" />
            </button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

/* ─────────────────── Modal wrapper ─────────────────── */
function Modal({ title, onClose, children, width = 540 }) {
    const t = useTheme();
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: t.dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: t.bg,
                    borderRadius: 14,
                    width: "100%", maxWidth: width,
                    maxHeight: "90vh", overflowY: "auto",
                    boxShadow: t.shadowLg,
                    border: `1px solid ${t.border}`,
                    animation: "modalIn 0.25s ease",
                    transition: "background 0.3s, border-color 0.3s",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: "18px 24px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: t.text }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none", background: "transparent", cursor: "pointer",
                            width: 32, height: 32, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: t.textFaint, fontSize: 15,
                            transition: "all 0.2s",
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

/* ─────────────────── Form field ─────────────────── */
function Field({ label, required, children }) {
    const t = useTheme();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
                fontSize: "0.78rem", fontWeight: 600,
                color: t.textSub, letterSpacing: "0.04em",
            }}>
                {label}{required && <span style={{ color: PRIMARY }}> *</span>}
            </label>
            {children}
        </div>
    );
}

/* ─────────────────── Custom Select (dark-mode safe) ─────────────────── */
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
                onClick={() => { setOpen(o => !o); onFocus?.(); }}
                style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
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
                <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    boxShadow: t.dark
                        ? "0 8px 24px rgba(0,0,0,0.6)"
                        : "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 500,
                    overflow: "hidden",
                    maxHeight: 220,
                    overflowY: "auto",
                }}>
                    {options.map(opt => (
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
                                background: opt === value
                                    ? (t.dark ? "rgba(217,119,6,0.15)" : "rgba(217,119,6,0.08)")
                                    : "transparent",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                fontWeight: opt === value ? 600 : 400,
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => {
                                if (opt !== value)
                                    e.currentTarget.style.background = t.dark
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.04)";
                            }}
                            onMouseLeave={e => {
                                if (opt !== value)
                                    e.currentTarget.style.background = "transparent";
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

/* ─────────────────── Chambre Form ─────────────────── */
function ChambreForm({ initial = {}, onSubmit, loading }) {
    const t = useTheme();
    const [form, setForm] = useState({
        num_chambre:  initial.num_chambre  || "",
        type_chambre: initial.type_chambre || "Double",
        statut:       initial.statut       || "Disponible",
        etage:        initial.etage        || 0,
        equipements:  initial.equipements  || "",
    });
    const [errors, setErrors] = useState({});
    const [focus, setFocus]   = useState(null);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.num_chambre.trim())  e.num_chambre  = "Numéro requis";
        if (!form.type_chambre.trim()) e.type_chambre = "Type requis";
        if (!form.statut)              e.statut       = "Statut requis";
        if (form.etage < 0)            e.etage        = "Étage invalide";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const inputBase = {
        border: "1px solid",
        borderRadius: 7,
        padding: "9px 12px",
        fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
        color: t.text,
        background: t.bgInput,
    };

    const fldStyle = (k) => ({
        ...inputBase,
        borderColor: errors[k] ? "#ef4444" : focus === k ? PRIMARY : t.borderMd,
        boxShadow: focus === k && !errors[k] ? `0 0 0 3px rgba(217,119,6,0.15)` : "none",
    });

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="N° Chambre" required>
                    <input
                        style={fldStyle("num_chambre")}
                        value={form.num_chambre}
                        onChange={e => set("num_chambre", e.target.value)}
                        onFocus={() => setFocus("num_chambre")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex: 101"
                    />
                    {errors.num_chambre && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.num_chambre}</span>}
                </Field>

                <Field label="Étage" required>
                    <input
                        type="number" min={0} max={99}
                        style={fldStyle("etage")}
                        value={form.etage}
                        onChange={e => set("etage", parseInt(e.target.value) || 0)}
                        onFocus={() => setFocus("etage")}
                        onBlur={() => setFocus(null)}
                    />
                    {errors.etage && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.etage}</span>}
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Type de chambre" required>
                    <CustomSelect
                        value={form.type_chambre}
                        onChange={v => set("type_chambre", v)}
                        options={TYPES}
                        focused={focus === "type_chambre"}
                        onFocus={() => setFocus("type_chambre")}
                        onBlur={() => setFocus(null)}
                        error={errors.type_chambre}
                    />
                </Field>

                <Field label="Statut" required>
                    <CustomSelect
                        value={form.statut}
                        onChange={v => set("statut", v)}
                        options={STATUTS}
                        focused={focus === "statut"}
                        onFocus={() => setFocus("statut")}
                        onBlur={() => setFocus(null)}
                        error={errors.statut}
                    />
                </Field>
            </div>

            <Field label="Équipements">
                <textarea
                    style={{ ...fldStyle("equipements"), resize: "vertical", minHeight: 80 }}
                    value={form.equipements}
                    onChange={e => set("equipements", e.target.value)}
                    onFocus={() => setFocus("equipements")}
                    onBlur={() => setFocus(null)}
                    placeholder="WiFi, Climatisation, Télévision, Minibar…"
                />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: loading ? (t.dark ? "#4b5563" : "#d1d5db") : PRIMARY,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 28px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "flex", alignItems: "center", gap: 8,
                        transition: "all 0.2s",
                    }}
                >
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    {loading ? "Enregistrement…" : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}

/* ─────────────────── Delete Confirm ─────────────────── */
function DeleteConfirm({ chambre, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer la chambre" onClose={onClose} width={420}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "rgba(239,68,68,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 22 }} />
                </div>
                <p style={{ fontSize: "0.9rem", color: t.textSub, marginBottom: 8 }}>
                    Voulez-vous vraiment supprimer la chambre{" "}
                    <strong style={{ color: t.text }}>N° {chambre.num_chambre}</strong> ?
                </p>
                <p style={{ fontSize: "0.78rem", color: t.textFaint }}>Cette action est irréversible.</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={onClose} style={{
                    border: `1px solid ${t.borderMd}`,
                    background: t.bgInput,
                    borderRadius: 8,
                    padding: "9px 24px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: t.textSub,
                    transition: "all 0.2s",
                }}>
                    Annuler
                </button>
                <button onClick={onConfirm} disabled={loading} style={{
                    background: loading ? "#fca5a5" : "#ef4444",
                    color: "#fff", border: "none", borderRadius: 8,
                    padding: "9px 24px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "0.82rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    Supprimer
                </button>
            </div>
        </Modal>
    );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
function ChambresInner() {
    const t = useTheme();

    const [chambres,    setChambres]  = useState([]);
    const [stats,       setStats]     = useState(null);
    const [loading,     setLoading]   = useState(true);
    const [saving,      setSaving]    = useState(false);
    const [deleting,    setDeleting]  = useState(false);

    const [search,      setSearch]    = useState("");
    const [filterStatut,setFilter]    = useState("Tous");
    const [filterType,  setFilterT]   = useState("Tous");
    const [sortKey,     setSortKey]   = useState("num_chambre");
    const [sortDir,     setSortDir]   = useState("asc");

    const [modal,       setModal]     = useState(null);
    const [toast,       setToast]     = useState(null);

    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [r1, r2] = await Promise.all([
                axios.get("/api/chambres", { headers }),
                axios.get("/api/chambres/statistics", { headers }),
            ]);
            setChambres(r1.data);
            setStats(r2.data);
        } catch {
            showToast("Erreur de chargement des chambres", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ── CRUD ── */
    const handleAdd = async (form) => {
        setSaving(true);
        try {
            await axios.post("/api/chambres", form, { headers });
            showToast("Chambre ajoutée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || "Erreur lors de l'ajout", "error");
        } finally { setSaving(false); }
    };

    const handleEdit = async (form) => {
        setSaving(true);
        try {
            await axios.put(`/api/chambres/${modal.edit.id_chambre}`, form, { headers });
            showToast("Chambre modifiée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || "Erreur lors de la modification", "error");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/chambres/${modal.del.id_chambre}`, { headers });
            showToast("Chambre supprimée");
            setModal(null);
            fetchAll();
        } catch {
            showToast("Erreur lors de la suppression", "error");
        } finally { setDeleting(false); }
    };

    /* ── Filter + Sort ── */
    const filtered = chambres
        .filter(c => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                c.num_chambre?.toLowerCase().includes(q) ||
                c.type_chambre?.toLowerCase().includes(q) ||
                c.equipements?.toLowerCase().includes(q);
            const matchStatut = filterStatut === "Tous" || c.statut === filterStatut;
            const matchType   = filterType   === "Tous" || c.type_chambre === filterType;
            return matchSearch && matchStatut && matchType;
        })
        .sort((a, b) => {
            let va = a[sortKey], vb = b[sortKey];
            if (sortKey === "etage") { va = Number(va); vb = Number(vb); }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ?  1 : -1;
            return 0;
        });

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const SortIcon = ({ k }) => {
        if (sortKey !== k) return <i className="fa-solid fa-sort" style={{ opacity: 0.25, fontSize: 10 }} />;
        return <i className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"}`} style={{ color: PRIMARY, fontSize: 10 }} />;
    };

    const typesList = ["Tous", ...new Set(chambres.map(c => c.type_chambre))];

    const donutSegments = stats ? [
        { label: "Disponible",  pct: stats.taux_disponible,  color: "#10b981" },
        { label: "Occupée",     pct: stats.taux_occupation,  color: "#ef4444" },
        { label: "Maintenance", pct: stats.taux_maintenance, color: "#f59e0b" },
    ] : [];

    /* shared styles */
    const cardStyle = {
        background: t.bg,
        borderRadius: 12,
        boxShadow: t.shadow,
        border: `1px solid ${t.border}`,
        transition: "background 0.3s, border-color 0.3s",
    };

    const thBase = {
        padding: "10px 14px",
        textAlign: "left",
        fontSize: "0.7rem",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 700,
        color: t.textMuted,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        background: t.bgAlt,
        borderBottom: `1px solid ${t.border}`,
        transition: "background 0.3s",
    };

    const selectStyle = {
        border: `1px solid ${t.borderMd}`,
        borderRadius: 7,
        padding: "8px 12px",
        fontSize: "0.82rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        background: t.bgInput,
        color: t.text,
        cursor: "pointer",
        transition: "background 0.3s, border-color 0.3s, color 0.3s",
    };

    return (
        <div style={{
            padding: "28px 24px",
            fontFamily: "'DM Sans', sans-serif",
            minHeight: "100%",
            background: t.bgPage,
            transition: "background 0.3s",
        }}>

            {/* ── Page header ── */}
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24, flexWrap: "wrap", gap: 12,
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: t.text }}>
                        <i className="fa-solid fa-bed" style={{ color: PRIMARY, marginRight: 10 }} />
                        Gestion des Chambres
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: t.textFaint }}>
                        Gérez, ajoutez et modifiez les chambres du Centre
                    </p>
                </div>
                <button
                    onClick={() => setModal("add")}
                    style={{
                        background: PRIMARY,
                        color: "#fff",
                        border: "none",
                        borderRadius: 9,
                        padding: "10px 22px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8,
                        letterSpacing: "0.05em",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                    <i className="fa-solid fa-plus" />
                    Ajouter une chambre
                </button>
            </div>

            {/* ── Statistics ── */}
            {stats && (
                <div style={{ marginBottom: 24 }}>
                    {/* Stat Cards */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
                        <StatCard icon="fa-solid fa-hotel"        label="Total chambres" value={stats.total}       color="#6366f1" bg="rgba(99,102,241,0.12)" />
                        <StatCard icon="fa-solid fa-circle-check" label="Disponibles"    value={stats.disponible}  pct={stats.taux_disponible}  color="#10b981" bg="rgba(16,185,129,0.12)" />
                        <StatCard icon="fa-solid fa-circle-xmark" label="Occupées"       value={stats.occupee}     pct={stats.taux_occupation}  color="#ef4444" bg="rgba(239,68,68,0.12)" />
                        <StatCard icon="fa-solid fa-wrench"        label="Maintenance"    value={stats.maintenance} pct={stats.taux_maintenance} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
                    </div>

                    {/* Chart Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>

                        {/* Donut */}
                        <div style={{ ...cardStyle, padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Répartition
                            </span>
                            <div style={{ position: "relative" }}>
                                <Donut segments={donutSegments} />
                                <div style={{
                                    position: "absolute", inset: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexDirection: "column",
                                }}>
                                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: t.text }}>{stats.total}</span>
                                    <span style={{ fontSize: "0.6rem", color: t.textFaint }}>total</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                                {[
                                    { label: "Disponible",  color: "#10b981", pct: stats.taux_disponible  },
                                    { label: "Occupée",     color: "#ef4444", pct: stats.taux_occupation  },
                                    { label: "Maintenance", color: "#f59e0b", pct: stats.taux_maintenance },
                                ].map(s => (
                                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.72rem" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                                        <span style={{ flex: 1, color: t.textSub }}>{s.label}</span>
                                        <span style={{ fontWeight: 700, color: s.color }}>{s.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bar chart by type */}
                        <div style={{ ...cardStyle, padding: "18px 22px" }}>
                            <span style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Par type de chambre
                            </span>
                            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                                {(stats.by_type || []).map(bt => {
                                    const barPct = stats.total > 0 ? (bt.total / stats.total) * 100 : 0;
                                    return (
                                        <div key={bt.type_chambre} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ width: 130, fontSize: "0.78rem", color: t.textSub, flexShrink: 0 }}>
                                                {bt.type_chambre}
                                            </span>
                                            <div style={{
                                                flex: 1,
                                                background: t.dark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
                                                borderRadius: 4, height: 8, overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    width: `${barPct}%`, height: "100%",
                                                    background: `linear-gradient(90deg, ${PRIMARY}, #fbbf24)`,
                                                    borderRadius: 4,
                                                    transition: "width 0.7s ease",
                                                }} />
                                            </div>
                                            <span style={{ width: 28, fontSize: "0.78rem", fontWeight: 700, color: t.text, textAlign: "right" }}>
                                                {bt.total}
                                            </span>
                                        </div>
                                    );
                                })}
                                {(stats.by_type || []).length === 0 && (
                                    <p style={{ fontSize: "0.8rem", color: t.textFaint }}>Aucune donnée</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Table section ── */}
            <div style={{ ...cardStyle, overflow: "hidden" }}>

                {/* Toolbar */}
                <div style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
                }}>
                    {/* Search */}
                    <div style={{
                        flex: 1, minWidth: 200,
                        display: "flex", alignItems: "center", gap: 8,
                        border: `1px solid ${t.borderMd}`,
                        borderRadius: 8, padding: "8px 12px",
                        background: t.bgInput,
                        transition: "background 0.3s, border-color 0.3s",
                    }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: t.textFaint, fontSize: 12 }} />
                        <input
                            style={{
                                border: "none", outline: "none",
                                fontSize: "0.82rem", flex: 1,
                                fontFamily: "'DM Sans', sans-serif",
                                color: t.text,
                                background: "transparent",
                            }}
                            placeholder="Rechercher une chambre…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={{
                                border: "none", background: "none",
                                cursor: "pointer", color: t.textFaint, fontSize: 12,
                            }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        )}
                    </div>

                    <div style={{ minWidth: 140 }}>
                        <CustomSelect
                            value={filterStatut}
                            onChange={setFilter}
                            options={["Tous", ...STATUTS]}
                        />
                    </div>

                    <div style={{ minWidth: 160 }}>
                        <CustomSelect
                            value={filterType}
                            onChange={setFilterT}
                            options={typesList}
                        />
                    </div>

                    <span style={{ fontSize: "0.75rem", color: t.textFaint, whiteSpace: "nowrap" }}>
                        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {[
                                    { label: "N° Chambre", key: "num_chambre"  },
                                    { label: "Type",       key: "type_chambre" },
                                    { label: "Étage",      key: "etage"        },
                                    { label: "Statut",     key: "statut"       },
                                    { label: "Équipements",key: null           },
                                ].map(col => (
                                    <th
                                        key={col.label}
                                        style={thBase}
                                        onClick={() => col.key && toggleSort(col.key)}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {col.label}
                                            {col.key && <SortIcon k={col.key} />}
                                        </span>
                                    </th>
                                ))}
                                <th style={{ ...thBase, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22, color: PRIMARY }} />
                                        <p style={{ marginTop: 10, fontSize: "0.82rem" }}>Chargement des chambres…</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: t.textFaint }}>
                                        <i className="fa-regular fa-folder-open" style={{ fontSize: 28, marginBottom: 10, display: "block", opacity: 0.4 }} />
                                        <p style={{ fontSize: "0.82rem", margin: 0 }}>Aucune chambre trouvée</p>
                                    </td>
                                </tr>
                            ) : filtered.map((c, i) => {
                                const isEven = i % 2 === 0;
                                return (
                                    <tr
                                        key={c.id_chambre}
                                        style={{
                                            borderBottom: `1px solid ${t.borderSm}`,
                                            background: isEven ? t.bg : t.bgAlt2,
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = t.bgHover}
                                        onMouseLeave={e => e.currentTarget.style.background = isEven ? t.bg : t.bgAlt2}
                                    >
                                        <td style={{ padding: "12px 14px" }}>
                                            <span style={{
                                                fontWeight: 700, color: t.text, fontSize: "0.88rem",
                                                background: t.bgTag,
                                                padding: "3px 10px", borderRadius: 6,
                                                border: `1px solid ${t.border}`,
                                                transition: "background 0.3s",
                                            }}>
                                                {c.num_chambre}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: "0.83rem", color: t.textSub }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <i className="fa-solid fa-bed" style={{ color: PRIMARY, fontSize: 12 }} />
                                                {c.type_chambre}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: "0.83rem", color: t.textSub }}>
                                            <span style={{
                                                background: t.bgTag, padding: "3px 10px",
                                                borderRadius: 6, fontWeight: 600,
                                                border: `1px solid ${t.border}`,
                                                color: t.text,
                                                transition: "background 0.3s",
                                            }}>
                                                Étage {c.etage}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <Badge statut={c.statut} />
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: t.textMuted, maxWidth: 200 }}>
                                            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {c.equipements || <span style={{ opacity: 0.35 }}>—</span>}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => setModal({ edit: c })}
                                                    title="Modifier"
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 7,
                                                        border: `1px solid ${t.border}`,
                                                        background: t.bg,
                                                        cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        color: PRIMARY, fontSize: 13,
                                                        transition: "all 0.15s",
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = t.dark ? "rgba(217,119,6,0.15)" : "#fff7ed";
                                                        e.currentTarget.style.borderColor = PRIMARY;
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = t.bg;
                                                        e.currentTarget.style.borderColor = t.border;
                                                    }}
                                                >
                                                    <i className="fa-solid fa-pen-to-square" />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setModal({ del: c })}
                                                    title="Supprimer"
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 7,
                                                        border: `1px solid ${t.border}`,
                                                        background: t.bg,
                                                        cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        color: "#ef4444", fontSize: 13,
                                                        transition: "all 0.15s",
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = t.dark ? "rgba(239,68,68,0.12)" : "#fef2f2";
                                                        e.currentTarget.style.borderColor = "#ef4444";
                                                    }}
                                                    onMouseLeave={e => {
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
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{
                    padding: "10px 20px",
                    borderTop: `1px solid ${t.border}`,
                    fontSize: "0.72rem",
                    color: t.textFaint,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <span>{filtered.length} chambre{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}</span>
                    <span>{chambres.length} au total</span>
                </div>
            </div>

            {/* ── Modals ── */}
            {modal === "add" && (
                <Modal title="Ajouter une chambre" onClose={() => setModal(null)}>
                    <ChambreForm onSubmit={handleAdd} loading={saving} />
                </Modal>
            )}
            {modal?.edit && (
                <Modal title={`Modifier la chambre N° ${modal.edit.num_chambre}`} onClose={() => setModal(null)}>
                    <ChambreForm initial={modal.edit} onSubmit={handleEdit} loading={saving} />
                </Modal>
            )}
            {modal?.del && (
                <DeleteConfirm
                    chambre={modal.del}
                    onConfirm={handleDelete}
                    onClose={() => setModal(null)}
                    loading={deleting}
                />
            )}

            {/* ── Toast ── */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

/* ── Wrap with dark mode context ── */
export default function Chambres() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <ChambresInner />
        </DM.Provider>
    );
}
