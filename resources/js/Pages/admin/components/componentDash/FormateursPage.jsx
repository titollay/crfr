import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    createContext,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PRIMARY = "#D97706";

/**
 * @typedef {{
 *   id_formateur: number;
 *   cin: string;
 *   num_location: string | null;
 *   attribut: string | null;
 *   created_at: string | null;
 * }} FormateurRow
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

function formateurFormFromInitial(initial) {
    return {
        cin: initial.cin ?? "",
        num_location: initial.num_location ?? "",
        attribut: initial.attribut ?? "",
    };
}

function FormateurForm({ initial = {}, onSubmit, loading }) {
    const t = useTheme();
    const [form, setForm] = useState(() => formateurFormFromInitial(initial));
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);

    useEffect(() => {
        setForm(formateurFormFromInitial(initial));
        setErrors({});
    }, [initial.id_formateur]);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.cin.trim()) e.cin = "CIN requis";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        onSubmit({
            cin: form.cin.trim(),
            num_location: form.num_location.trim() || null,
            attribut: form.attribut.trim() || null,
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

    const isEdit = Boolean(initial.id_formateur);

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="CIN (Numéro de carte)" required error={errors.cin}>
                <input
                    style={inputStyle("cin")}
                    value={form.cin}
                    onChange={(e) => set("cin", e.target.value)}
                    onFocus={() => setFocus("cin")}
                    onBlur={() => setFocus(null)}
                    placeholder="Ex. AB123456"
                />
            </Field>

            <Field label="Numéro de location">
                <input
                    style={inputStyle("num_location")}
                    value={form.num_location}
                    onChange={(e) => set("num_location", e.target.value)}
                    onFocus={() => setFocus("num_location")}
                    onBlur={() => setFocus(null)}
                    placeholder="Ex. Loc-001"
                />
            </Field>

            <Field label="Attribut">
                <input
                    style={inputStyle("attribut")}
                    value={form.attribut}
                    onChange={(e) => set("attribut", e.target.value)}
                    onFocus={() => setFocus("attribut")}
                    onBlur={() => setFocus(null)}
                    placeholder="Informations complémentaires..."
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
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                    }}
                >
                    {loading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin" /> Enregistrement…
                        </>
                    ) : (
                        <>
                            <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-user-plus"}`} />
                            {isEdit ? "Mettre à jour" : "Ajouter le formateur"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function DeleteConfirm({ formateur, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer le formateur" onClose={onClose} width={420}>
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
                <p style={{ fontWeight: 700, color: t.text, fontSize: "1rem", margin: "0 0 16px" }}>{formateur.cin}</p>
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

export default function FormateursPage() {
    const dark = useDarkMode();
    const t = useTheme();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);

    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/formateurs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setToast({ msg: "Erreur lors du chargement des données", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = async (payload) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/formateurs", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ msg: "Formateur ajouté avec succès", type: "success" });
            setShowAdd(false);
            fetchData();
        } catch (err) {
            console.error(err);
            setToast({ msg: err.response?.data?.message || "Erreur lors de l'ajout", type: "error" });
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (payload) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/formateurs/${editing.id_formateur}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ msg: "Formateur mis à jour", type: "success" });
            setEditing(null);
            fetchData();
        } catch (err) {
            console.error(err);
            setToast({ msg: "Erreur lors de la mise à jour", type: "error" });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/formateurs/${deleting.id_formateur}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ msg: "Formateur supprimé", type: "success" });
            setDeleting(null);
            fetchData();
        } catch (err) {
            console.error(err);
            setToast({ msg: "Erreur lors de la suppression", type: "error" });
        } finally {
            setFormLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return data;
        return data.filter(
            (r) =>
                r.cin.toLowerCase().includes(q) ||
                (r.num_location && r.num_location.toLowerCase().includes(q)) ||
                (r.attribut && r.attribut.toLowerCase().includes(q)),
        );
    }, [data, search]);

    const itemsPerPage = 7;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <DM.Provider value={dark}>
            <div
                style={{
                    minHeight: "100%",
                    background: t.bgPage,
                    padding: "1.5rem",
                    fontFamily: "'DM Sans', sans-serif",
                    color: t.text,
                    transition: "background 0.3s",
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.5rem",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                            Gestion des Formateurs
                        </h1>
                        <p style={{ margin: "4px 0 0", color: t.textSub, fontSize: "0.85rem" }}>
                            Gérez la liste des formateurs intervenant au centre.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        style={{
                            background: PRIMARY,
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "10px 20px",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 4px 14px rgba(217,119,6,0.3)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(217,119,6,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "0 4px 14px rgba(217,119,6,0.3)";
                        }}
                    >
                        <i className="fa-solid fa-plus" /> Nouveau Formateur
                    </button>
                </div>

                {/* ── Main Table Card ── */}
                <SectionCard
                    title="Liste des Formateurs"
                    theme={t}
                    headerRight={
                        <div style={{ position: "relative" }}>
                            <i
                                className="fa-solid fa-magnifying-glass"
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 12,
                                    color: t.textFaint,
                                }}
                            />
                            <input
                                placeholder="Rechercher (CIN, location...)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    background: t.bgAlt,
                                    border: `1px solid ${t.border}`,
                                    borderRadius: 8,
                                    padding: "7px 12px 7px 32px",
                                    fontSize: "0.82rem",
                                    width: 240,
                                    color: t.text,
                                    outline: "none",
                                }}
                            />
                        </div>
                    }
                >
                    {loading ? (
                        <div style={{ padding: "40px 0", textAlign: "center" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ color: PRIMARY, fontSize: 24 }} />
                            <p style={{ marginTop: 12, color: t.textMuted, fontSize: "0.9rem" }}>Chargement...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "60px 0", textAlign: "center" }}>
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: t.bgAlt,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}
                            >
                                <i className="fa-solid fa-inbox" style={{ fontSize: 24, color: t.textFaint }} />
                            </div>
                            <p style={{ fontWeight: 600, color: t.textSub, margin: 0 }}>Aucun formateur trouvé</p>
                            <p style={{ fontSize: "0.8rem", color: t.textMuted, marginTop: 4 }}>
                                {search ? "Essayez d'autres mots-clés." : "Commencez par en ajouter un."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${t.borderSm}` }}>
                                        <th style={thStyle(t)}>ID</th>
                                        <th style={thStyle(t)}>CIN</th>
                                        <th style={thStyle(t)}>Num Location</th>
                                        <th style={thStyle(t)}>Attribut</th>
                                        <th style={{ ...thStyle(t), textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((r) => (
                                        <tr
                                            key={r.id_formateur}
                                            style={{
                                                borderBottom: `1px solid ${t.borderSm}`,
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td style={tdStyle(t)}>
                                                <span style={{ fontWeight: 700, color: PRIMARY }}>#{r.id_formateur}</span>
                                            </td>
                                            <td style={tdStyle(t)}>
                                                <div style={{ fontWeight: 600, color: t.text }}>{r.cin}</div>
                                            </td>
                                            <td style={tdStyle(t)}>
                                                {r.num_location ? (
                                                    <span style={{ color: t.text }}>{r.num_location}</span>
                                                ) : (
                                                    <span style={{ color: t.textFaint, fontStyle: "italic" }}>—</span>
                                                )}
                                            </td>
                                            <td style={tdStyle(t)}>
                                                {r.attribut ? (
                                                    <div
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            color: t.textSub,
                                                            maxWidth: 200,
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                        title={r.attribut}
                                                    >
                                                        {r.attribut}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: t.textFaint }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle(t), textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                    <button
                                                        onClick={() => setEditing(r)}
                                                        style={actionBtnStyle(t, "edit")}
                                                        title="Modifier"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleting(r)}
                                                        style={actionBtnStyle(t, "delete")}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && filtered.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${t.borderSm}`, background: t.dark ? "rgba(255,255,255,0.01)" : "#fafbff" }}>
                            <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                                Affichage de {(page - 1) * itemsPerPage + 1} à {Math.min(page * itemsPerPage, filtered.length)} sur {filtered.length} résultats
                            </span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: `1px solid ${t.borderMd}`,
                                        background: page === 1 ? "transparent" : t.bgInput,
                                        color: page === 1 ? t.textFaint : t.text,
                                        cursor: page === 1 ? "default" : "pointer",
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                </button>
                                <button
                                    disabled={page === totalPages || totalPages === 0}
                                    onClick={() => setPage(p => p + 1)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: `1px solid ${t.borderMd}`,
                                        background: page === totalPages || totalPages === 0 ? "transparent" : t.bgInput,
                                        color: page === totalPages || totalPages === 0 ? t.textFaint : t.text,
                                        cursor: page === totalPages || totalPages === 0 ? "default" : "pointer",
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── Modals ── */}
                {showAdd && (
                    <Modal title="Nouveau Formateur" onClose={() => setShowAdd(false)}>
                        <FormateurForm onSubmit={handleAdd} loading={formLoading} />
                    </Modal>
                )}

                {editing && (
                    <Modal title="Modifier le formateur" onClose={() => setEditing(null)}>
                        <FormateurForm initial={editing} onSubmit={handleUpdate} loading={formLoading} />
                    </Modal>
                )}

                {deleting && (
                    <DeleteConfirm
                        formateur={deleting}
                        onConfirm={handleDelete}
                        onClose={() => setDeleting(null)}
                        loading={formLoading}
                    />
                )}

                {/* ── Toast ── */}
                {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            </div>
        </DM.Provider>
    );
}

function thStyle(t) {
    return {
        padding: "12px 16px",
        textAlign: "left",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: t.textMuted,
    };
}

function tdStyle(t) {
    return {
        padding: "16px",
        fontSize: "0.85rem",
        verticalAlign: "middle",
    };
}
