import React, { useState, useEffect, useMemo, useId, useRef, createContext, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr.js";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

const RES_CHART_PRIMARY = "#D97706";
const RES_CHART_SUCCESS = "#10b981";
const RES_CHART_INFO = "#3b82f6";
const RES_CHART_DANGER = "#ef4444";
const RES_CHART_VIOLET = "#8b5cf6";

function rechartsSurface(dark) {
    return {
        tooltip: {
            backgroundColor: dark ? "rgba(23,23,23,0.96)" : "#fff",
            border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            borderRadius: 10,
            color: dark ? "rgba(255,255,255,0.92)" : "#111",
            fontSize: 12,
            boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.08)",
        },
        grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        axis: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    };
}

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

    const selectStyles = (k) => ({
        control: (base, state) => ({
            ...base,
            border: `1px solid ${errors[k] ? "#ef4444" : state.isFocused ? PRIMARY : t.borderMd}`,
            borderRadius: 7,
            padding: "3px 4px",
            fontSize: "0.85rem",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: state.isFocused && !errors[k] ? "0 0 0 3px rgba(217,119,6,0.15)" : "none",
            backgroundColor: t.bgInput,
            color: t.text,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": {
                border: `1px solid ${errors[k] ? "#ef4444" : PRIMARY}`
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: t.bgInput,
            color: t.text,
            zIndex: 50
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" : "transparent",
            color: t.text,
            "&:active": {
                backgroundColor: PRIMARY + "33"
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: t.text,
        }),
        input: (base) => ({
            ...base,
            color: t.text,
        })
    });

    const intervenantOptions = (options.intervenants || []).map(inv => ({
        value: inv.id_inter,
        label: `${inv.prenom} ${inv.nom} (${inv.cin})`
    }));

    const secondIntervenantOptions = (options.intervenants || [])
        .filter(i => i.id_inter != form.id_inter)
        .map(inv => ({
            value: inv.id_inter,
            label: `${inv.prenom} ${inv.nom}`
        }));

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Intervenant principal" required error={errors.id_inter}>
                    <Select
                        styles={selectStyles("id_inter")}
                        value={intervenantOptions.find(o => o.value == form.id_inter) || null}
                        onChange={(option) => set("id_inter", option ? option.value : "")}
                        options={intervenantOptions}
                        placeholder="— Sélectionner un intervenant —"
                        isClearable
                    />
                </Field>
                <Field label="Deuxième intervenant (optionnel)">
                    <Select
                        styles={selectStyles("id_inter_2")}
                        value={secondIntervenantOptions.find(o => o.value == form.id_inter_2) || null}
                        onChange={(option) => set("id_inter_2", option ? option.value : "")}
                        options={secondIntervenantOptions}
                        placeholder="— Sélectionner —"
                        isClearable
                    />
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

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 4 }}>
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

function ymdAddDays(ymd, days) {
    if (!ymd) return ymd;
    const d = new Date(`${String(ymd).slice(0, 10)}T12:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function reservationsToFcEvents(list, dark) {
    const textColor = dark ? "rgba(255,255,255,0.92)" : "#111827";
    return (list || [])
        .map((res) => {
            const sc = STATUT_COLORS[res.statut] || STATUT_COLORS["En attente"];
            const nom = [res.intervenant?.prenom, res.intervenant?.nom].filter(Boolean).join(" ") || "Réservation";
            const ch = res.chambre?.num_chambre != null ? `Ch. ${res.chambre.num_chambre}` : "";
            const title = ch ? `${nom} — ${ch}` : nom;
            const start = res.date_debut?.slice(0, 10);
            if (!start) return null;
            const endExclusive = res.date_fin ? ymdAddDays(res.date_fin.slice(0, 10), 1) : ymdAddDays(start, 1);
            return {
                id: String(res.id_resev),
                title,
                start,
                end: endExclusive,
                allDay: true,
                backgroundColor: sc.bg,
                borderColor: sc.color,
                textColor,
                classNames: res.statut === "Annulée" ? ["res-fc-event-cancelled"] : [],
                extendedProps: { reservation: res },
            };
        })
        .filter(Boolean);
}

function ReservationsCalendar({ reservations, theme, onEventClick }) {
    const calRef = useRef(null);
    const { dark, bg, border, text, textMuted, textSub } = theme;
    const events = useMemo(() => reservationsToFcEvents(reservations, dark), [reservations, dark]);

    useEffect(() => {
        const api = calRef.current?.getApi?.();
        if (!api) return;
        const id = requestAnimationFrame(() => api.updateSize());
        return () => cancelAnimationFrame(id);
    }, [reservations, dark]);

    const fcVars = {
        "--fc-border-color": border,
        "--fc-page-bg-color": bg,
        "--fc-neutral-bg-color": dark ? "rgba(255,255,255,0.04)" : "#f7f8fb",
        "--fc-neutral-text-color": textMuted,
        "--fc-today-bg-color": dark ? "rgba(251,191,36,0.14)" : "rgba(253,224,71,0.35)",
        "--fc-list-event-hover-bg-color": dark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
        "--fc-button-bg-color": dark ? "#1f1f1f" : "#fff",
        "--fc-button-border-color": border,
        "--fc-button-text-color": textSub,
        "--fc-button-hover-bg-color": dark ? "rgba(255,255,255,0.08)" : "rgba(217,119,6,0.08)",
        "--fc-button-active-bg-color": dark ? PRIMARY : "#111827",
        "--fc-button-active-border-color": dark ? PRIMARY : "#111827",
        "--fc-button-active-text-color": dark ? "#111" : "#fff",
        "--fc-highlight-color": dark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.2)",
        fontFamily: "'DM Sans', sans-serif",
    };

    return (
        <div
            className="reservations-fc-wrap"
            style={{
                ...fcVars,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: "16px 14px 18px",
                overflow: "hidden",
                boxShadow: theme.shadow,
            }}
        >
            <style>{`
                .reservations-fc-wrap .fc { color: ${text}; font-size: 0.82rem; }
                .reservations-fc-wrap .fc-toolbar-title { font-size: 1rem !important; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
                .reservations-fc-wrap .fc-col-header-cell-cushion,
                .reservations-fc-wrap .fc-daygrid-day-number { color: ${textSub}; font-weight: 600; }
                .reservations-fc-wrap .fc-day-other .fc-daygrid-day-number { color: ${textMuted}; opacity: 0.85; }
                .reservations-fc-wrap .fc-button { font-weight: 600; font-size: 0.78rem; border-radius: 8px; padding: 0.35em 0.65em; text-transform: capitalize; }
                .reservations-fc-wrap .fc-button-primary:not(:disabled):active,
                .reservations-fc-wrap .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: ${dark ? PRIMARY : "#111827"} !important;
                    border-color: ${dark ? PRIMARY : "#111827"} !important;
                    color: ${dark ? "#111" : "#fff"} !important;
                }
                .reservations-fc-wrap .res-fc-event-cancelled { opacity: 0.55; }
                .reservations-fc-wrap .fc-daygrid-event { border-radius: 6px; }
                .reservations-fc-wrap .fc-scrollgrid { border-radius: 8px; overflow: hidden; }
            `}</style>
            <FullCalendar
                ref={calRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                locale={frLocale}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                buttonText={{
                    today: "Aujourd'hui",
                    month: "Mois",
                    week: "Semaine",
                    day: "Jour",
                    list: "Liste",
                }}
                height="auto"
                contentHeight="auto"
                dayMaxEvents={3}
                moreLinkClick="popover"
                weekends
                firstDay={0}
                navLinks
                nowIndicator
                events={events}
                eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    const r = info.event.extendedProps?.reservation;
                    if (r) onEventClick(r);
                }}
            />
        </div>
    );
}

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
    const [searchRes, setSearchRes] = useState("");
    const [page, setPage] = useState(1);
    const showToast = (msg, type = "success") => setToast({ msg, type });
    const btnAction = (c) => ({ border: "solid 1px ", background: "transparent", color: c, cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5});

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

    const filteredReservations = reservations.filter(res => {
        const s = searchRes.toLowerCase();
        return (
            (res.intervenant?.prenom || "").toLowerCase().includes(s) ||
            (res.intervenant?.nom || "").toLowerCase().includes(s) ||
            (res.intervenant?.cin || "").toLowerCase().includes(s) ||
            (res.chambre?.num_chambre || "").toString().toLowerCase().includes(s)
        );
    });

    useEffect(() => { setPage(1); }, [searchRes]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const paginatedReservations = filteredReservations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="fa-solid fa-calendar-check" style={{ color: PRIMARY }} /> Réservations
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                    <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                    <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Réservations</span>
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
                {activeTab === "liste" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div className="flex justify-between items-center">
                            <div
                                style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    background: t.bgInput, border: `1px solid ${searchRes ? PRIMARY : t.borderMd}`,
                                    borderRadius: 8, padding: "2px 6px", width: 240,
                                    boxShadow: searchRes ? "0 0 0 3px rgba(217,119,6,0.12)" : "none",
                                    transition: "all 0.25s",
                                }}
                            >
                                <i className="fa-solid fa-magnifying-glass" style={{ color: searchRes ? PRIMARY : t.textMuted, fontSize: 11 }} />
                                <input
                                    value={searchRes}
                                    onChange={(e) => setSearchRes(e.target.value)}
                                    placeholder="Rechercher (Nom, CIN, Ch...)"
                                    style={{
                                        border: "none", background: "transparent", outline: "none",
                                        color: t.text, fontSize: "0.82rem", width: "100%", padding: "6px 4px",
                                    }}
                                />
                                {searchRes && (
                                    <button onClick={() => setSearchRes("")} style={{ border: "none", background: "transparent", color: t.textMuted, cursor: "pointer", padding: "0 4px" }}>
                                        <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                                <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : reservations.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px", background: t.dark ? "rgba(255,255,255,0.02)" : "#fff", borderRadius: 12, border: `1px solid ${t.border}` }}>
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
                                                {["Intervenant", "Chambre", "Dates", "Statut", "Créé par", "Actions"].map((h, i) => (
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
                                            {paginatedReservations.map((res, idx) => {
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
                                                                <button onClick={() => { setEditTarget(res); setModal("edit"); }} style={btnAction(PRIMARY)}>
                                                                    <i className="fa-solid fa-pen" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget(res)} style={btnAction("#ef4444")}>
                                                                    <i className="fa-solid fa-trash" />
                                                                </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Controls */}
                                {!loading && filteredReservations.length > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${t.borderSm}`, background: t.dark ? "rgba(255,255,255,0.01)" : "#f9fafb" }}>
                                        <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                                            Affichage de {(page - 1) * itemsPerPage + 1} à {Math.min(page * itemsPerPage, filteredReservations.length)} sur {filteredReservations.length} résultats
                                        </span>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === 1 ? "transparent" : t.bgInput, color: page === 1 ? t.textFaint : t.text, cursor: page === 1 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-left" /></button>
                                            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === totalPages || totalPages === 0 ? "transparent" : t.bgInput, color: page === totalPages || totalPages === 0 ? t.textFaint : t.text, cursor: page === totalPages || totalPages === 0 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-right" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && reservations.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className="fa-solid fa-calendar-days" style={{ color: PRIMARY }} />
                                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: t.text }}>Calendrier des réservations</h3>
                                </div>
                                <ReservationsCalendar
                                    reservations={reservations}
                                    theme={t}
                                    onEventClick={(r) => {
                                        setEditTarget(r);
                                        setModal("edit");
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "stats" && (
                    loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                            <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : stats ? (
                        <ReservationsAnalyticsSection stats={stats} theme={t} />
                    ) : (
                        <p style={{ color: t.textMuted, textAlign: "center", padding: 40 }}>Impossible de charger les statistiques.</p>
                    )
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

function SectionCard({ title, hint, children, theme, style = {} }) {
    const { dark, border, text, textSub } = theme;
    const cardStyle = {
        background: dark ? "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" : "#fff",
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: "24px",
        boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 8px 24px rgba(0,0,0,0.04)",
        ...style,
    };
    return (
        <div style={cardStyle}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: text, margin: "0 0 6px" }}>{title}</h3>
            {hint && <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: textSub, lineHeight: 1.45 }}>{hint}</p>}
            {children}
        </div>
    );
}

function OccupancyHeatmap({ days, theme }) {
    const { dark, textMuted, textFaint } = theme;
    const max = Math.max(1, ...days.map((d) => d.count));
    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                    gap: 4,
                    maxWidth: "100%",
                }}
            >
                {days.map(({ date, count }) => {
                    const intensity = count / max;
                    const bg = dark
                        ? `rgba(251, 191, 36, ${0.12 + intensity * 0.88})`
                        : `rgba(217, 119, 6, ${0.15 + intensity * 0.75})`;
                    return (
                        <div
                            key={date}
                            title={`${date} — ${count} réservation(s) active(s)`}
                            style={{
                                aspectRatio: "1",
                                minHeight: 12,
                                borderRadius: 4,
                                background: bg,
                                border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                            }}
                        />
                    );
                })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", color: textMuted }}>Moins</span>
                <div style={{ display: "flex", gap: 3 }}>
                    {[0.15, 0.35, 0.55, 0.75, 0.95].map((a) => (
                        <div key={a} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(217, 119, 6, ${a})` }} />
                    ))}
                </div>
                <span style={{ fontSize: "0.72rem", color: textMuted }}>Plus (pics / forte occupation)</span>
                <span style={{ fontSize: "0.7rem", color: textFaint, marginLeft: "auto" }}>90 derniers jours</span>
            </div>
        </div>
    );
}

function ReservationsAnalyticsSection({ stats, theme }) {
    const [timeMode, setTimeMode] = useState("month");
    const gradId = useId().replace(/:/g, "");

    const kpi = stats?.kpi ?? {
        total: 0,
        confirmees: 0,
        attente: 0,
        annulees: 0,
        taux_confirmation: 0,
    };
    const monthly = stats?.monthly ?? [];
    const daily_created = stats?.daily_created ?? [];
    const by_room = stats?.by_room ?? [];
    const occupancy_by_day = stats?.occupancy_by_day ?? [];
    const avg_stay_days = stats?.avg_stay_days ?? 0;
    const by_creator = stats?.by_creator ?? [];
    const single_vs_double = stats?.single_vs_double ?? { single: 0, double: 0 };
    const active_vs_past = stats?.active_vs_past ?? { active: 0, past: 0 };

    const { dark, border, text, textSub, textMuted, textFaint } = theme;
    const surface = useMemo(() => rechartsSurface(dark), [dark]);

    const PRIMARY = RES_CHART_PRIMARY;
    const SUCCESS = RES_CHART_SUCCESS;
    const INFO = RES_CHART_INFO;
    const DANGER = RES_CHART_DANGER;
    const VIOLET = RES_CHART_VIOLET;

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

    const chartData = useMemo(() => {
        let categories = [];
        let data = [];
        if (timeMode === "day") {
            categories = daily_created.map(d => {
                if (!d.date) return "N/A";
                const parts = d.date.split("-");
                return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : d.date;
            });
            data = daily_created.map(d => d.total || 0);
        } else if (timeMode === "year") {
            const allYears = monthly.map(m => {
                const val = m.month_key || m.month || "";
                return parseInt(val.split("-")[0], 10) || parseInt(val.split(" ")[1], 10);
            }).filter(y => !isNaN(y));

            if (allYears.length > 0) {
                const minYear = Math.min(...allYears);
                const maxYear = Math.max(...allYears);

                for (let y = minYear; y <= maxYear; y++) {
                    const yearTotal = monthly.reduce((sum, m) => {
                        const val = m.month_key || m.month || "";
                        const mYear = parseInt(val.split("-")[0], 10) || parseInt(val.split(" ")[1], 10);
                        return mYear === y ? sum + (Number(m.total) || Number(m.count) || 0) : sum;
                    }, 0);
                    
                    categories.push(y.toString());
                    data.push(yearTotal);
                }
            }
        } else {
            const currentYear = new Date().getFullYear();
            const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
            
            for (let i = 1; i <= 12; i++) {
                const mm = i.toString().padStart(2, "0");
                const targetMatch = `${currentYear}-${mm}`;
                
               
                const matches = monthly.filter(m => {
                    const dateVal = m.month_key || m.month || m.date; 
                    return dateVal && String(dateVal).startsWith(targetMatch);
                });

                const monthlyTotal = matches.reduce((sum, m) => {
                    return sum + (Number(m.total) || Number(m.count) || 0);
                }, 0);
                
                categories.push([monthNames[i - 1], currentYear.toString()]);
                data.push(monthlyTotal);
            }
        }
        return { categories, data };
    }, [timeMode, daily_created, monthly]);

    const statusPie = useMemo(
        () => [
            { name: "Confirmées", value: kpi.confirmees, fill: SUCCESS },
            { name: "En attente", value: kpi.attente, fill: INFO },
            { name: "Annulées", value: kpi.annulees, fill: DANGER },
        ],
        [kpi.confirmees, kpi.attente, kpi.annulees, SUCCESS, INFO, DANGER],
    );

    const roomRows = useMemo(
        () => by_room.map((r) => ({ room: `Ch. ${r.num_chambre}`, total: r.total })),
        [by_room],
    );

    const creatorRows = useMemo(
        () =>
            by_creator.map((u) => ({
                name: `${u.prenom || ""} ${u.nom || ""}`.trim() || `User #${u.id_user}`,
                total: u.total,
            })),
        [by_creator],
    );

    const singleDoublePie = useMemo(
        () => [
            { name: "Une personne", value: single_vs_double.single, fill: INFO },
            { name: "Deux personnes", value: single_vs_double.double, fill: VIOLET },
        ],
        [single_vs_double, INFO, VIOLET],
    );

    const activePastPie = useMemo(
        () => [
            { name: "Actives / en cours", value: active_vs_past.active, fill: SUCCESS },
            {
                name: "Passées / terminées",
                value: active_vs_past.past,
                fill: dark ? "#64748b" : "#94a3b8",
            },
        ],
        [active_vs_past, dark, SUCCESS],
    );

    const occupancyTrend = useMemo(
        () => occupancy_by_day.map((d) => ({ period: d.date.slice(5), load: d.count, fullDate: d.date })),
        [occupancy_by_day],
    );

    const tooltipProps = useMemo(
        () => ({
            contentStyle: surface.tooltip,
            labelStyle: { fontWeight: 600, color: text },
        }),
        [surface.tooltip, text],
    );

    return (
        <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: text, margin: "0 0 4px" }}>Tableau de bord analytique</h2>
                <p style={{ margin: 0, fontSize: "0.9rem", color: textSub }}>
                    Graphiques Recharts (area, bar, pie) — style proche des exemples officiels.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 24 }}>
                {kpiCards.map((card, idx) => (
                    <div key={idx} style={{ ...cardStyle, animation: `fadeInUp 0.45s ease-out ${idx * 0.06}s both` }}>
                        <div>
                            <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>{card.label}</p>
                            <h3 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: text }}>{card.value}</h3>
                        </div>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: dark ? `rgba(${card.bgStr}, 0.1)` : `rgba(${card.bgStr}, 0.08)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: card.color,
                                fontSize: 20,
                            }}
                        >
                            <i className={`fa-solid ${card.icon}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 1 — Area chart (Recharts “Simple Area Chart” style) */}
            <SectionCard
                theme={theme}
                title="Réservations dans le temps"
                hint="Évolution des réservations par jour, mois ou année."
            >
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {[
                        { id: "day", label: "Par jour" },
                        { id: "month", label: "Par mois" },
                        { id: "year", label: "Par an" },
                    ].map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => setTimeMode(b.id)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                border: `1px solid ${timeMode === b.id ? PRIMARY : border}`,
                                background: timeMode === b.id ? "rgba(217,119,6,0.15)" : "transparent",
                                color: timeMode === b.id ? PRIMARY : textSub,
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
                <div style={{ width: "100%", height: 350 }}>
                    <ReactApexChart 
                        options={{
                            chart: {
                                height: 350,
                                type: 'line',
                                zoom: { enabled: false },
                                background: 'transparent'
                            },
                            dataLabels: {
                                enabled: false
                            },
                            stroke: {
                                curve: 'smooth',
                                colors: [PRIMARY]
                            },
                            title: {
                                text: 'Tendance des Réservations',
                                align: 'left',
                                style: { color: text, fontFamily: "'DM Sans', sans-serif" }
                            },
                            grid: {
                                row: {
                                    colors: [dark ? 'rgba(255,255,255,0.02)' : '#f3f3f3', 'transparent'],
                                    opacity: 0.5
                                },
                                borderColor: border
                            },
                            xaxis: {
                                categories: chartData.categories,
                                labels: { style: { colors: textSub, fontFamily: "'DM Sans', sans-serif" } }
                            },
                            yaxis: {
                                labels: { style: { colors: textSub, fontFamily: "'DM Sans', sans-serif" } }
                            },
                            theme: { mode: dark ? 'dark' : 'light' }
                        }} 
                        series={[{ name: "Réservations", data: chartData.data }]} 
                        type="line" 
                        height={350} 
                    />
                </div>
            </SectionCard>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
                    gap: 24,
                    marginTop: 24,
                }}
            >
                {/* 2 — Status Donut */}
                <SectionCard theme={theme} title="Répartition par statut" hint="Répartition des réservations par état actuel.">
                    <div style={{ width: "100%", height: 320, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <ReactApexChart 
                            options={{
                                chart: { type: 'donut', background: 'transparent' },
                                labels: ["Confirmées", "En attente", "Annulées"],
                                colors: [SUCCESS, INFO, DANGER],
                                plotOptions: {
                                    pie: {
                                        startAngle: -90,
                                        endAngle: 270,
                                        donut: {
                                            size: '75%',
                                            labels: {
                                                show: true,
                                                total: {
                                                    show: true,
                                                    label: 'Confirm.',
                                                    formatter: () => `${kpi.taux_confirmation}%`,
                                                    color: text
                                                }
                                            }
                                        }
                                    }
                                },
                                dataLabels: { enabled: false },
                                fill: { type: 'gradient' },
                                legend: {
                                    position: 'bottom',
                                    fontFamily: "'DM Sans', sans-serif",
                                    labels: { colors: text },
                                    formatter: (val, opts) => val + " - " + opts.w.globals.series[opts.seriesIndex]
                                },
                                theme: { mode: dark ? 'dark' : 'light' },
                                stroke: { show: false }
                            }} 
                            series={[kpi.confirmees, kpi.attente, kpi.annulees]} 
                            type="donut" 
                            width="100%"
                        />
                    </div>
                </SectionCard>

                {/* 3 — Stay Gauge */}
                <SectionCard theme={theme} title="Durée moyenne de séjour" hint="Moyenne des nuitées par réservation confirmée.">
                    <div style={{ width: "100%", height: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ReactApexChart 
                                options={{
                                    chart: { type: 'radialBar', offsetY: -10, sparkline: { enabled: true } },
                                    plotOptions: {
                                        radialBar: {
                                            startAngle: -90,
                                            endAngle: 90,
                                            max: 14, 
                                            hollow: { size: '65%' },
                                            track: { background: border, strokeWidth: '97%', margin: 5 },
                                            dataLabels: {
                                                name: { show: false },
                                                value: {
                                                    offsetY: -2,
                                                    fontSize: '28px',
                                                    fontWeight: 800,
                                                    color: text,
                                                    formatter: () => avg_stay_days
                                                }
                                            }
                                        }
                                    },
                                    fill: {
                                        type: 'gradient',
                                        gradient: {
                                            shade: 'dark',
                                            type: 'horizontal',
                                            gradientToColors: [RES_CHART_VIOLET],
                                            stops: [0, 100]
                                        }
                                    },
                                    stroke: { lineCap: 'round' },
                                    theme: { mode: dark ? 'dark' : 'light' }
                                }} 
                                series={[avg_stay_days]} 
                                type="radialBar" 
                                width="100%"
                                height="100%"
                            />
                        </div>
                        <div style={{ textAlign: "center", paddingBottom: 20 }}>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: textSub, fontWeight: 600 }}>jours en moyenne</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

           


           

            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}