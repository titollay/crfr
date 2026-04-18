import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
    createContext,
} from "react";
import { Link } from "react-router-dom";

const PRIMARY = "#D97706";

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
        bgHover: dark ? "rgba(217,119,6,0.12)" : "#fff7ed",
        bgInput: dark ? "rgba(255,255,255,0.05)" : "#fff",
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

function RoleForm({ initial = {}, onSubmit, loading }) {
    const t = useTheme();
    const isEdit = Boolean(initial.id);
    
    const [form, setForm] = useState({
        name: initial.name || "",
        description: initial.description || "",
    });
    
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const handle = (ev) => {
        ev.preventDefault();
        const e = {};
        if (!form.name.trim()) e.name = "Nom du rôle requis";
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }
        onSubmit(form);
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

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nom du Rôle" required error={errors.name}>
                <input
                    style={inputStyle("name")}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    onFocus={() => setFocus("name")}
                    onBlur={() => setFocus(null)}
                    placeholder="Ex. Super Admin"
                />
            </Field>

            <Field label="Description" error={errors.description}>
                <textarea
                    style={{ ...inputStyle("description"), minHeight: 80, resize: "vertical" }}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    onFocus={() => setFocus("description")}
                    onBlur={() => setFocus(null)}
                    placeholder="Brève description des permissions associées..."
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
                            <i className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-shield-plus"}`} />
                            {isEdit ? "Mettre à jour" : "Ajouter le rôle"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function DeleteConfirm({ role, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer le rôle" onClose={onClose} width={420}>
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
                    Voulez-vous vraiment supprimer ce rôle ?
                </p>
                <p style={{ fontWeight: 700, color: t.text, fontSize: "1rem", margin: "0 0 16px" }}>{role.name}</p>
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

export default function Roles() {
    const dark = useDarkMode();
    const t = useTheme();

    // We simulate API data for Roles since there isn't a table for it yet.
    const [data, setData] = useState([
        { id: 1, name: "Admin", description: "Accès complet à toutes les fonctionnalités du tableau de bord.", isSystem: true },
        { id: 2, name: "User", description: "Accès limité avec fonctionnalités de base en lecture/écriture.", isSystem: true },
    ]);
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

    const handleAdd = async (payload) => {
        setFormLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newRole = { id: Date.now(), name: payload.name, description: payload.description, isSystem: false };
            setData([...data, newRole]);
            setToast({ msg: "Rôle ajouté avec succès", type: "success" });
            setShowAdd(false);
            setFormLoading(false);
        }, 500);
    };

    const handleUpdate = async (payload) => {
        setFormLoading(true);
        setTimeout(() => {
            setData(data.map(r => r.id === editing.id ? { ...r, ...payload } : r));
            setToast({ msg: "Rôle mis à jour", type: "success" });
            setEditing(null);
            setFormLoading(false);
        }, 500);
    };

    const handleDelete = async () => {
        setFormLoading(true);
        setTimeout(() => {
            setData(data.filter(r => r.id !== deleting.id));
            setToast({ msg: "Rôle supprimé", type: "success" });
            setDeleting(null);
            setFormLoading(false);
        }, 500);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return data;
        return data.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                (r.description && r.description.toLowerCase().includes(q))
        );
    }, [data, search]);

    const itemsPerPage = 7;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <DM.Provider value={dark}>
            <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif", color: t.text, transition: "background 0.3s" }}>
                {/* ── Header ── */}
                <div style={{ borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 10 }}>
                            <i className="fa-solid fa-user-shield" style={{ color: PRIMARY }} /> Rôles et Permissions
                        </h1>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                        <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Rôles</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
                        <button
                            onClick={() => setShowAdd(true)}
                            style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", boxShadow: "0 4px 12px rgba(217,119,6,0.2)" }}
                        >
                            <i className="fa-solid fa-plus" style={{ marginRight: 6 }} /> Nouveau
                        </button>
                    </div>
                </div>

                <div style={{ padding: "24px 28px" }}>
                    {/* ── Main Table Card ── */}
                    <SectionCard
                        title="Gestion des Rôles"
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
                                    placeholder="Rechercher..."
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
                        {filtered.length === 0 ? (
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
                                <p style={{ fontWeight: 600, color: t.textSub, margin: 0 }}>Aucun rôle trouvé</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                                    <thead>
                                        <tr style={{ borderBottom: `2px solid ${t.borderSm}` }}>
                                            <th style={thStyle(t)}>Nom du rôle</th>
                                            <th style={thStyle(t)}>Description</th>
                                            <th style={thStyle(t)}>Statut</th>
                                            <th style={{ ...thStyle(t), textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((r) => (
                                            <tr
                                                key={r.id}
                                                style={{
                                                    borderBottom: `1px solid ${t.borderSm}`,
                                                    transition: "background 0.15s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                            >
                                                <td style={tdStyle(t)}>
                                                    <div style={{ fontWeight: 700, color: PRIMARY, display: "flex", alignItems: "center", gap: 8 }}>
                                                        <i className={r.name.toLowerCase() === "admin" ? "fa-solid fa-user-gear" : "fa-solid fa-user-lock"} style={{ color: r.isSystem ? PRIMARY : t.textSub }}></i>
                                                        {r.name}
                                                    </div>
                                                </td>
                                                <td style={tdStyle(t)}>
                                                    <div style={{ color: t.text }}>{r.description || "-"}</div>
                                                </td>
                                                <td style={tdStyle(t)}>
                                                    {r.isSystem ? (
                                                        <span style={{ fontSize: "0.75rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "4px 8px", borderRadius: 4, fontWeight: 600, border: "1px solid rgba(239,68,68,0.2)" }}>
                                                            Système
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: "0.75rem", background: t.bgTag, color: t.textSub, padding: "4px 8px", borderRadius: 4, fontWeight: 600, border: `1px solid ${t.borderMd}` }}>
                                                            Personnalisé
                                                        </span>
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
                                                        {!r.isSystem && (
                                                            <button
                                                                onClick={() => setDeleting(r)}
                                                                style={actionBtnStyle(t, "delete")}
                                                                title="Supprimer"
                                                            >
                                                                <i className="fa-solid fa-trash" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {filtered.length > 0 && (
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
                        <Modal title="Nouveau Rôle" onClose={() => setShowAdd(false)}>
                            <RoleForm onSubmit={handleAdd} loading={formLoading} />
                        </Modal>
                    )}

                    {editing && (
                        <Modal title="Modifier le Rôle" onClose={() => setEditing(null)}>
                            <RoleForm initial={editing} onSubmit={handleUpdate} loading={formLoading} />
                        </Modal>
                    )}

                    {deleting && (
                        <DeleteConfirm
                            role={deleting}
                            onConfirm={handleDelete}
                            onClose={() => setDeleting(null)}
                            loading={formLoading}
                        />
                    )}

                    {/* ── Toast ── */}
                    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
                </div>
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
