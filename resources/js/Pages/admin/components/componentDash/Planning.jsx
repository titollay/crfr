import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr.js";
import { Link } from "react-router-dom";

const PRIMARY = "#D97706";

/* ─────────── Theme ─────────── */
function useDarkMode() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains("dark")),
        );
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
    };
}

/* ─────────── Shared UI Components ─────────── */
function SectionCard({ title, children, theme: t, headerRight }) {
    return (
        <div style={{
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: t.shadow,
            overflow: "hidden",
            marginBottom: 24,
            transition: "background 0.3s, border-color 0.3s",
        }}>
            <div style={{
                padding: "18px 24px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: t.dark ? "rgba(255,255,255,0.01)" : "#fafbff",
            }}>
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

function Chip({ label, color }) {
    return (
        <span style={{
            display: "inline-block", padding: "2px 9px", borderRadius: 999,
            background: `${color}18`, color, fontSize: "0.68rem", fontWeight: 600,
            letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>{label}</span>
    );
}

/* ─────────── Constants ─────────── */
const ORG_COLORS = {
    Entreprise: "#2563eb",
    Association: "#0891b2",
    "Établissement public": "#4f46e5",
    ONG: "#059669",
    Collectivité: "#7c3aed",
    Coopérative: "#0d9488",
    Autre: "#64748b",
};

const FALLBACK_PALETTE = ["#2563eb", "#0ea5e9", "#6366f1", "#8b5cf6", "#0d9488", "#ca8a04", "#e11d48"];

const MOIS_NOMS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function getColorForOrg(org) {
    const type = org?.type?.trim();
    if (type && ORG_COLORS[type]) return ORG_COLORS[type];
    if (!org?.nom) return FALLBACK_PALETTE[0];
    const code = org.nom.charCodeAt(0);
    return FALLBACK_PALETTE[Math.abs(code) % FALLBACK_PALETTE.length];
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
}

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return (new Date(year, month, 1).getDay() + 6) % 7; } // Mon=0

/* ─────────── Main export ─────────── */
export default function Planning() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <PlanningInner />
        </DM.Provider>
    );
}

const thBase = {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9ca3af",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
};

const tdBase = {
    padding: "16px",
    fontSize: "0.85rem",
    verticalAlign: "middle",
};

/* ─────────── PlanningInner ─────────── */
function PlanningInner() {
    const t = useTheme();
    const [formations, setFormations]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [currentDate, setCurrentDate]       = useState(new Date());
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [activeTab, setActiveTab]           = useState("calendrier");
    const [search, setSearch]                 = useState("");

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get("/api/formations", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => { setFormations(res.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const changeMonth = (delta) => setCurrentDate(new Date(year, month + delta, 1));

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return formations.filter((f) => {
            const d  = f.date_debut?.split(" ")[0];
            const f2 = f.date_fin?.split(" ")[0];
            return d <= dateStr && f2 >= dateStr;
        });
    };

    const totalDays = daysInMonth(year, month);
    const startDay  = firstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const formationsInMonth = useMemo(() => {
        const mStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        return formations.filter((f) => f.date_debut?.startsWith(mStr) || f.date_fin?.startsWith(mStr));
    }, [formations, year, month]);

    const orgStats = useMemo(() => {
        const stats = {};
        formations.forEach((f) => {
            const type = f.organisation?.type || "Autre";
            stats[type] = (stats[type] || 0) + 1;
        });
        return Object.entries(stats).map(([org, count]) => ({ org, count }));
    }, [formations]);

    const totalParticipants = formations.reduce((a, b) => a + (b.nbr_prevu || 0), 0);
    const totalOrgs         = new Set(formations.map((f) => f.organisation?.id_org).filter(Boolean)).size;

    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="fa-solid fa-calendar-days" style={{ color: PRIMARY }} /> Planning des Formations
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                    <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                    <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Planning</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", background: t.bgInput, borderRadius: 8, padding: 2, border: `1px solid ${t.borderMd}` }}>
                        {[
                            { id: "calendrier", label: "Calendrier", icon: "fa-calendar" },
                            { id: "liste", label: "Liste", icon: "fa-list" },
                            { id: "stats", label: "Statistiques", icon: "fa-chart-pie" }
                        ].map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setActiveTab(b.id)}
                                style={{
                                    border: "none", background: activeTab === b.id ? PRIMARY : "transparent", color: activeTab === b.id ? "#fff" : t.textSub,
                                    padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", display: "flex", gap: 5, alignItems: "center", transition: "all 0.2s"
                                }}
                            >
                                <i className={`fa-solid ${b.icon}`} /> {b.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    <div className="flex flex-col gap-4">
                        {activeTab === "calendrier" && (
                    <div className="planning-calendar-wrapper">
                        <style>{`
                            .planning-calendar-wrapper .fc { font-family: 'DM Sans', sans-serif; --fc-border-color: ${t.borderSm}; --fc-button-bg-color: ${PRIMARY}; --fc-button-border-color: ${PRIMARY}; --fc-today-bg-color: ${t.dark ? 'rgba(217,119,6,0.1)' : 'rgba(217,119,6,0.05)'}; }
                            .planning-calendar-wrapper .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 800; color: ${t.text}; }
                            .planning-calendar-wrapper .fc-col-header-cell { background: ${t.bgAlt}; padding: 10px 0; }
                            .planning-calendar-wrapper .fc-col-header-cell-cushion { font-size: 0.75rem; font-weight: 700; color: ${t.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; }
                            .planning-calendar-wrapper .fc-daygrid-day-number { font-size: 0.85rem; font-weight: 600; color: ${t.textSub}; padding: 8px !important; }
                            .planning-calendar-wrapper .fc-event { border: none; border-radius: 6px; padding: 2px 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.15s; }
                            .planning-calendar-wrapper .fc-event:hover { transform: scale(1.02); }
                        `}</style>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale={frLocale}
                            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listMonth" }}
                            events={formations.map(f => ({
                                id: f.id_forma,
                                title: f.sujet,
                                start: f.date_debut,
                                end: f.date_fin,
                                backgroundColor: getColorForOrg(f.organisation),
                                extendedProps: { ...f }
                            }))}
                            eventClick={(info) => setSelectedFormation(info.event.extendedProps)}
                            height="auto"
                        />
                    </div>
                )}

                {activeTab === "liste" && (
                     <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={thBase}>Sujet</th>
                                    <th style={thBase}>Organisation</th>
                                    <th style={thBase}>Dates</th>
                                    <th style={thBase}>Lieu</th>
                                    <th style={{ ...thBase, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formations.map((f, i) => (
                                    <tr key={f.id_forma} style={{ background: i % 2 === 0 ? t.bg : t.bgAlt, borderBottom: `1px solid ${t.borderSm}` }}>
                                        <td style={{ ...tdBase, fontWeight: 700, color: t.text }}>{f.sujet}</td>
                                        <td style={tdBase}><Chip label={f.organisation?.nom || "—"} color={getColorForOrg(f.organisation)} /></td>
                                        <td style={{ ...tdBase, color: t.textSub, fontSize: "0.78rem" }}>{formatDate(f.date_debut)} {f.date_fin ? `→ ${formatDate(f.date_fin)}` : ""}</td>
                                        <td style={{ ...tdBase, color: t.textSub }}>{f.lieu || f.salle || "—"}</td>
                                        <td style={{ ...tdBase, textAlign: "right" }}>
                                            <button onClick={() => setSelectedFormation(f)} style={{ border: "none", background: "transparent", color: PRIMARY, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Détails</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                )}

                {activeTab === "stats" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* ── KPI Cards ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                            <StatCard icon="fa-solid fa-graduation-cap"  label="Total Formations"   value={loading ? "…" : formations.length}      color="#D97706" />
                            <StatCard icon="fa-solid fa-calendar-check"  label="Ce mois"            value={loading ? "…" : formationsInMonth.length} color="#10B981" />
                            <StatCard icon="fa-solid fa-users"           label="Participants prévus" value={loading ? "…" : totalParticipants}       color="#8B5CF6" />
                            <StatCard icon="fa-solid fa-building"        label="Organisations"       value={loading ? "…" : totalOrgs}              color="#3B82F6" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
                        <SectionCard title="Répartition par Type d'Organisation" theme={t}>
                             <div style={{ height: 300 }}>
                                <ReactApexChart
                                    type="donut"
                                    height="100%"
                                    series={orgStats.map(s => s.count)}
                                    options={{
                                        labels: orgStats.map(s => s.org),
                                        colors: ["#D97706", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#6366F1"],
                                        legend: { position: "bottom", labels: { colors: t.textSub } },
                                        plotOptions: { pie: { donut: { size: "70%" } } }
                                    }}
                                />
                             </div>
                        </SectionCard>
                        <SectionCard title="Volume de Participants" theme={t}>
                             {/* Simplified bar chart for participants per formation (top 10) */}
                             <div style={{ height: 300 }}>
                                <ReactApexChart
                                    type="bar"
                                    height="100%"
                                    series={[{ name: "Prévus", data: formations.slice(0, 10).map(f => f.nbr_prevu || 0) }]}
                                    options={{
                                        xaxis: { categories: formations.slice(0, 10).map(f => f.sujet.slice(0, 10) + "..."), labels: { style: { colors: t.textMuted } } },
                                        colors: [PRIMARY],
                                        plotOptions: { bar: { borderRadius: 4 } }
                                    }}
                                />
                             </div>
                        </SectionCard>
                    </div>
                    </div>
                )}
                    </div>
                </div>
            </div>
            {/* ── Formation detail modal ── */}
            {selectedFormation && (
                <Modal title="Détails de la formation" onClose={() => setSelectedFormation(null)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Sujet</div>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: t.text }}>{selectedFormation.sujet}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Organisation</div>
                            <Chip label={selectedFormation.organisation?.nom || "—"} color={getColorForOrg(selectedFormation.organisation)} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Date début</div>
                                <div style={{ color: t.text, fontWeight: 600 }}>{formatDate(selectedFormation.date_debut)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Date fin</div>
                                <div style={{ color: t.text, fontWeight: 600 }}>{formatDate(selectedFormation.date_fin)}</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Lieu</div>
                            <div style={{ color: t.text }}>{selectedFormation.lieu || selectedFormation.salle || "—"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Participants prévus</div>
                            <div style={{ color: t.text, fontWeight: 700, fontSize: "1.1rem" }}>{selectedFormation.nbr_prevu || 0}</div>
                        </div>
                        {selectedFormation.superviseur && (
                            <div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Superviseur</div>
                                <div style={{ color: t.text }}>{selectedFormation.superviseur}</div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}