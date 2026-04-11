import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import axios from "axios";
import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const PRIMARY = "#D97706";

function useDarkMode() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    useEffect(() => {
        const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains("dark")));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
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
    };
}

function Modal({ title, onClose, children, width = 620 }) {
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
                backdropFilter: "blur(4px)", display: "flex",
                alignItems: "center", justifyContent: "center", padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: t.bg, borderRadius: 14, width: "100%",
                    maxWidth: width, maxHeight: "90vh", overflowY: "auto",
                    boxShadow: t.shadowLg, border: `1px solid ${t.border}`,
                    animation: "modalIn 0.25s ease",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: "18px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: t.text }}>{title}</h3>
                    <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, fontSize: 15 }}>
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
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: t.textSub, letterSpacing: "0.04em" }}>
                {label}{required && <span style={{ color: PRIMARY }}> *</span>}
            </label>
            {children}
            {error && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{error}</span>}
        </div>
    );
}

function ReservationForm({ initial = {}, onSubmit, loading, options = {}, onCheckAvailability }) {
    const t = useTheme();
    const [form, setForm] = useState({
        id_inter: initial.id_inter || "",
        id_inter_2: initial.id_inter_2 || "",
        id_chambre: initial.id_chambre || "",
        date_debut: initial.date_debut || "",
        date_fin: initial.date_fin || "",
        statut: initial.statut || "En attente",
    });
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);
    const [availableChambres, setAvailableChambres] = useState([]);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const checkAvailability = async () => {
        if (form.date_debut && form.date_fin) {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/api/reservations/available-chambres", {
                    params: { date_debut: form.date_debut, date_fin: form.date_fin },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableChambres(res.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (form.date_debut && form.date_fin) checkAvailability();
    }, [form.date_debut, form.date_fin]);

    const validate = () => {
        const e = {};
        if (!form.id_inter) e.id_inter = "Intervenant requis";
        if (!form.id_chambre) e.id_chambre = "Chambre requise";
        if (!form.date_debut) e.date_debut = "Date de début requise";
        if (!form.date_fin) e.date_fin = "Date de fin requise";
        if (form.date_fin && form.date_debut && form.date_fin < form.date_debut) e.date_fin = "Date fin >= début";
        if (!form.statut) e.statut = "Statut requis";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const inputStyle = (k) => ({
        border: `1px solid ${errors[k] ? "#ef4444" : focus === k ? PRIMARY : t.borderMd}`,
        borderRadius: 7, padding: "9px 12px", fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
        boxSizing: "border-box", color: t.text, background: t.bgInput,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focus === k && !errors[k] ? "0 0 0 3px rgba(217,119,6,0.15)" : "none",
    });

    const STATUTS = ["En attente", "Confirmée", "Annulée"];
    const chambresDispo = availableChambres.length > 0 ? availableChambres : options.chambres || [];

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Intervenant principal" required error={errors.id_inter}>
                    <select
                        style={{ ...inputStyle("id_inter"), appearance: "none" }}
                        value={form.id_inter}
                        onChange={(e) => set("id_inter", e.target.value)}
                    >
                        <option value="">— Sélectionner un intervenant —</option>
                        {(options.intervenants || []).map((inv) => (
                            <option key={inv.id_inter} value={inv.id_inter}>{inv.prenom} {inv.nom} ({inv.cin})</option>
                        ))}
                    </select>
                </Field>
                <Field label="Deuxième intervenant (optionnel)">
                    <select
                        style={{ ...inputStyle("id_inter_2"), appearance: "none" }}
                        value={form.id_inter_2}
                        onChange={(e) => set("id_inter_2", e.target.value)}
                    >
                        <option value="">— Sélectionner —</option>
                        {(options.intervenants || []).filter(i => i.id_inter != form.id_inter).map((inv) => (
                            <option key={inv.id_inter} value={inv.id_inter}>{inv.prenom} {inv.nom}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Date de début" required error={errors.date_debut}>
                    <input type="date" style={inputStyle("date_debut")} value={form.date_debut}
                        onChange={(e) => set("date_debut", e.target.value)} />
                </Field>
                <Field label="Date de fin" required error={errors.date_fin}>
                    <input type="date" style={inputStyle("date_fin")} value={form.date_fin}
                        onChange={(e) => set("date_fin", e.target.value)} />
                </Field>
            </div>

            <Field label="Chambre" required error={errors.id_chambre}>
                <select
                    style={{ ...inputStyle("id_chambre"), appearance: "none" }}
                    value={form.id_chambre}
                    onChange={(e) => set("id_chambre", e.target.value)}
                >
                    <option value="">— Sélectionner une chambre —</option>
                    {chambresDispo.map((ch) => (
                        <option key={ch.id_chambre} value={ch.id_chambre}>Chambre {ch.num_chambre} ({ch.type_chambre})</option>
                    ))}
                </select>
                {availableChambres.length > 0 && (
                    <span style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 4 }}>
                        {availableChambres.length} chambre(s) disponible(s) pour ces dates
                    </span>
                )}
            </Field>

            <Field label="Statut" required error={errors.statut}>
                <select
                    style={{ ...inputStyle("statut"), appearance: "none" }}
                    value={form.statut}
                    onChange={(e) => set("statut", e.target.value)}
                >
                    {STATUTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: PRIMARY, color: "#fff", border: "none",
                        borderRadius: 8, padding: "10px 24px", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                    }}
                >
                    {loading
                        ? <><i className="fa-solid fa-spinner fa-spin" /> Traitement...</>
                        : <><i className="fa-solid fa-plus" /> {initial.id_resev ? "Mettre à jour" : "Ajouter"}</>
                    }
                </button>
            </div>
        </form>
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
                position: "fixed", bottom: 24, right: 24, zIndex: 9999,
                background: t.bg, border: `1.5px solid ${c}`,
                borderLeft: `4px solid ${c}`, borderRadius: 8,
                padding: "12px 18px", display: "flex", alignItems: "center",
                gap: 10, boxShadow: t.shadow, fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: t.text, minWidth: 260,
                animation: "slideUp 0.3s ease",
            }}
        >
            <i className={`fa-solid ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: c, fontSize: 16 }} />
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: t.textFaint, fontSize: 14 }}>
                <i className="fa-solid fa-xmark" />
            </button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

function DeleteConfirm({ reservation, onConfirm, onCancel, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer la réservation" onClose={onCancel} width={420}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 24 }} />
                </div>
                <p style={{ color: t.text, fontSize: "0.9rem", margin: "0 0 8px" }}>
                    Êtes-vous sûr de vouloir supprimer cette réservation ?
                </p>
                <p style={{ color: PRIMARY, fontWeight: 700, fontSize: "1rem", margin: "0 0 16px" }}>
                    {reservation.intervenant?.prenom} {reservation.intervenant?.nom} - Chambre {reservation.chambre?.num_chambre}
                </p>
                <p style={{ color: t.textMuted, fontSize: "0.8rem", margin: 0 }}>
                    Cette action est irréversible.
                </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${t.borderMd}`, background: "transparent", color: t.textSub, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", fontWeight: 600 }}>
                    Annuler
                </button>
                <button onClick={onConfirm} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", fontWeight: 700, opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}>
                    {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Suppression...</> : <><i className="fa-solid fa-trash" /> Supprimer</>}
                </button>
            </div>
        </Modal>
    );
}

function Chip({ label, color }) {
    return (
        <span style={{
            display: "inline-block", padding: "2px 9px", borderRadius: 999,
            background: `${color}18`, color, fontSize: "0.68rem", fontWeight: 600,
            letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>{label}</span>
    );
}

const STATUT_COLORS = {
    "Confirmée": { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    "En attente": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    "Annulée": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function Reservations() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <ReservationsInner />
        </DM.Provider>
    );
}

function ReservationsInner() {
    const t = useTheme();
    const [reservations, setReservations] = useState([]);
    const [options, setOptions] = useState({ chambres: [], intervenants: [] });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("liste");
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showToast = (msg, type = "success") => setToast({ msg, type });

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const [resRes, optRes, statsRes] = await Promise.all([
                axios.get("/api/reservations", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/reservations/options", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/reservations/statistics", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setReservations(resRes.data);
            setOptions(optRes.data);
            setStats(statsRes.data);
        } catch (err) {
            showToast("Erreur de chargement", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (form) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/reservations", form, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Réservation ajoutée avec succès !");
            setModal(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : "Erreur lors de l'ajout";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (form) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/reservations/${editTarget.id_resev}`, form, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Réservation mise à jour !");
            setModal(null);
            setEditTarget(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : "Erreur lors de la mise à jour";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/reservations/${deleteTarget.id_resev}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Réservation supprimée.", "info");
            setDeleteTarget(null);
            fetchData();
        } catch {
            showToast("Erreur lors de la suppression", "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: t.text }}>
                        <i className="fa-solid fa-calendar-days" style={{ color: PRIMARY, marginRight: 10 }} />
                        Réservations
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: t.textMuted }}>
                        Gestion des réservations du centre
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {["liste", "stats"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: "8px 16px", borderRadius: 8, border: `1px solid ${activeTab === tab ? PRIMARY : t.borderMd}`,
                            background: activeTab === tab ? `${PRIMARY}18` : "transparent",
                            color: activeTab === tab ? PRIMARY : t.textSub, fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                        }}>
                            <i className={`fa-solid ${tab === "liste" ? "fa-list" : "fa-chart-pie"}`} style={{ marginRight: 6 }} />
                            {tab === "liste" ? "Liste" : "Statistiques"}
                        </button>
                    ))}
                    <button onClick={() => setModal("add")} style={{
                        background: PRIMARY, color: "#fff", border: "none", borderRadius: 8,
                        padding: "9px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem",
                        fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 4px 14px rgba(217,119,6,0.3)",
                    }}>
                        <i className="fa-solid fa-plus" />
                        Ajouter
                    </button>
                </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
                {activeTab === "liste" && (
                    loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                            <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: t.bg, borderRadius: 12, border: `1px solid ${t.border}` }}>
                            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 36, color: t.textFaint, marginBottom: 12 }} />
                            <p style={{ color: t.textMuted, margin: 0 }}>Aucune réservation</p>
                            <button onClick={() => setModal("add")} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 8, background: PRIMARY, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                                <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />Ajouter la première
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: t.shadow }}>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {["Intervenant", "Chambre", "Dates", "Statut", "Créé par", ""].map((h, i) => (
                                                <th key={i} style={{
                                                    padding: "11px 14px", textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase",
                                                    letterSpacing: "0.12em", fontWeight: 700, color: t.textMuted,
                                                    background: t.dark ? "rgba(255,255,255,0.035)" : "#f7f8fb",
                                                    borderBottom: `1px solid ${t.border}`,
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map((res, idx) => {
                                            const sc = STATUT_COLORS[res.statut] || { color: "#6b7280", bg: "rgba(0,0,0,0.05)" };
                                            const rowBg = idx % 2 === 0 ? t.bg : (t.dark ? "rgba(255,255,255,0.02)" : "#fcfcfd");
                                            return (
                                                <tr key={res.id_resev} style={{ background: rowBg }}>
                                                    <td style={{ padding: "11px 14px", fontSize: "0.82rem", borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle" }}>
                                                        <div style={{ fontWeight: 600, color: t.text }}>{res.intervenant?.prenom} {res.intervenant?.nom}</div>
                                                        {res.intervenant2 && <div style={{ fontSize: "0.75rem", color: t.textMuted }}>+ {res.intervenant2.prenom} {res.intervenant2.nom}</div>}
                                                    </td>
                                                    <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: t.textSub, borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle" }}>Ch. {res.chambre?.num_chambre}</td>
                                                    <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: t.textSub, borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle" }}>
                                                        {res.date_debut?.split("-").reverse().join("/")} - {res.date_fin?.split("-").reverse().join("/")}
                                                    </td>
                                                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle" }}><Chip label={res.statut} color={sc.color} /></td>
                                                    <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: t.textMuted, borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle" }}>{res.createur?.prenom} {res.createur?.nom || "—"}</td>
                                                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${t.borderSm}`, verticalAlign: "middle", textAlign: "right" }}>
                                                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                            <button onClick={() => { setEditTarget(res); setModal("edit"); }} 
                                                                onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = `${PRIMARY}12`; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                                                                style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.textMuted, transition: "all 0.2s" }}>
                                                                <i className="fa-solid fa-pen" />
                                                            </button>
                                                            <button onClick={() => setDeleteTarget(res)} 
                                                                onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                                                                style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.textMuted, transition: "all 0.2s" }}>
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
                        </div>
                    )
                )}

                {activeTab === "stats" && stats && (
                    <ReservationsAnalyticsSection stats={stats} theme={t} />
                )}
            </div>

            {modal === "add" && (
                <Modal title="Ajouter une réservation" onClose={() => setModal(null)}>
                    <ReservationForm onSubmit={handleAdd} loading={saving} options={options} />
                </Modal>
            )}
            {modal === "edit" && editTarget && (
                <Modal title="Modifier la réservation" onClose={() => { setModal(null); setEditTarget(null); }}>
                    <ReservationForm initial={editTarget} onSubmit={handleEdit} loading={saving} options={options} />
                </Modal>
            )}
            {deleteTarget && (
                <DeleteConfirm reservation={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

function ReservationsAnalyticsSection({ stats, theme }) {
    if (!stats) return null;

    const { kpi, monthly } = stats;
    const { dark, bg, border, text, textSub, textFaint } = theme;

    const PRIMARY = "#D97706";
    const SUCCESS = "#10b981";
    const INFO = "#3b82f6";
    const DANGER = "#ef4444";

    const kpiCards = [
        { label: "Total Réservations", value: kpi.total, icon: "fa-calendar-days", color: PRIMARY, bgStr: "217, 119, 6" },
        { label: "Confirmées", value: kpi.confirmees, icon: "fa-check-double", color: SUCCESS, bgStr: "16, 185, 129" },
        { label: "En Attente", value: kpi.attente, icon: "fa-hourglass-half", color: INFO, bgStr: "59, 130, 246" },
        { label: "Annulées", value: kpi.annulees, icon: "fa-ban", color: DANGER, bgStr: "239, 68, 68" },
    ];

    const cardStyle = {
        background: dark ? "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" : "#fff",
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 8px 24px rgba(0,0,0,0.04)",
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: textFaint } },
            y: { border: { display: false }, grid: { color: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }, ticks: { color: textFaint, stepSize: 1 } }
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: { position: "bottom", labels: { color: text, padding: 20 } },
        }
    };

    return (
        <div style={{ animation: "fadeInUp 0.6s ease forwards", opacity: 0 }}>
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: text, margin: "0 0 4px" }}>Tableau de Bord Analytique</h2>
                <p style={{ margin: 0, fontSize: "0.9rem", color: textSub }}>Vue panoramique et statistiques détaillées des réservations.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                {kpiCards.map((card, idx) => (
                    <div key={idx} style={{...cardStyle, animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards`, opacity: 0}}>
                        <div>
                            <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>{card.label}</p>
                            <h3 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: text }}>{card.value}</h3>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: dark ? `rgba(${card.bgStr}, 0.1)` : `rgba(${card.bgStr}, 0.08)`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, fontSize: 20 }}>
                            <i className={`fa-solid ${card.icon}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <div style={{...cardStyle, flexDirection: "column", alignItems: "flex-start", opacity: 0, animation: "fadeInUp 0.5s ease-out 0.4s forwards"}}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: text, margin: "0 0 20px" }}>Répartition des Statuts</h3>
                    <div style={{ position: "relative", width: "100%", height: 220 }}>
                        <Doughnut data={{
                            labels: ["Confirmées", "En Attente", "Annulées"],
                            datasets: [{ data: [kpi.confirmees, kpi.attente, kpi.annulees], backgroundColor: [SUCCESS, INFO, DANGER], borderWidth: 0 }]
                        }} options={doughnutOptions} />
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: text }}>{kpi.taux_confirmation}%</span>
                        </div>
                    </div>
                </div>

                <div style={{...cardStyle, flexDirection: "column", alignItems: "flex-start", opacity: 0, animation: "fadeInUp 0.5s ease-out 0.5s forwards"}}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: text, margin: "0 0 20px" }}>Évolution Mensuelle</h3>
                    <div style={{ width: "100%", height: 220 }}>
                        <Line data={{
                            labels: monthly?.map(s => s.month) || [],
                            datasets: [{ label: "Réservations", data: monthly?.map(s => s.total) || [], borderColor: PRIMARY, backgroundColor: "rgba(217,119,6,0.1)", fill: true, tension: 0.4 }]
                        }} options={lineChartOptions} />
                    </div>
                </div>
            </div>

            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}