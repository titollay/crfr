import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr.js";

const PRIMARY = "var(--admin-primary, #D97706)";
const DM = createContext(false);

const useTheme = () => {
    const dark = useContext(DM);
    return {
        dark,
        bg: dark ? "#111" : "#fff",
        bgPage: dark ? "#0a0a0a" : "#f8fafc",
        text: dark ? "#eee" : "#1e293b",
        textSub: dark ? "#94a3b8" : "#64748b",
        textMuted: dark ? "#64748b" : "#94a3b8",
        border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        borderMd: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
        shadow: dark ? "0 10px 40px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.04)",
        shadowHover: dark ? "0 15px 50px rgba(0,0,0,0.6)" : "0 15px 40px rgba(0,0,0,0.08)",
        chartGrid: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    };
};

const useDarkMode = () => {
    const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
    useEffect(() => {
        const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains("dark")));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);
    return dark;
};

/* ── Helpers ── */
function ymdAddDays(ymd, days) {
    if (!ymd) return ymd;
    const d = new Date(`${String(ymd).slice(0, 10)}T12:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const RES_STATUS_COLORS = {
    "Confirmée": { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    "En attente": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    "Annulée": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

function reservationsToFcEvents(list, dark) {
    const textColor = dark ? "rgba(255,255,255,0.92)" : "#111827";
    return (list || [])
        .map((res) => {
            const sc = RES_STATUS_COLORS[res.statut] || RES_STATUS_COLORS["En attente"];
            const nom = [res.intervenant?.prenom, res.intervenant?.nom].filter(Boolean).join(" ") || "Réservation";
            const ch = res.chambre?.num_chambre != null ? `Ch. ${res.chambre.num_chambre}` : "";
            const title = ch ? `${nom} — ${ch}` : nom;
            const start = res.date_debut?.slice(0, 10);
            if (!start) return null;
            const endExclusive = res.date_fin ? ymdAddDays(res.date_fin.slice(0, 10), 1) : ymdAddDays(start, 1);
            return {
                id: `res-${res.id_resev}`,
                title,
                start,
                end: endExclusive,
                allDay: true,
                backgroundColor: sc.bg,
                borderColor: sc.color,
                textColor,
                classNames: res.statut === "Annulée" ? ["res-fc-event-cancelled"] : [],
                extendedProps: { type: "reservation", data: res },
            };
        })
        .filter(Boolean);
}

function formationsToFcEvents(list, dark) {
    const textColor = dark ? "rgba(255,255,255,0.92)" : "#111827";
    return (list || [])
        .map((f) => {
            const start = f.date_debut?.slice(0, 10);
            if (!start) return null;
            const endExclusive = f.date_fin ? ymdAddDays(f.date_fin.slice(0, 10), 1) : ymdAddDays(start, 1);
            return {
                id: `forma-${f.id_forma}`,
                title: f.sujet,
                start,
                end: endExclusive,
                allDay: true,
                backgroundColor: "rgba(217,119,6,0.12)",
                borderColor: "#D97706",
                textColor,
                extendedProps: { type: "formation", data: f },
            };
        })
        .filter(Boolean);
}

function DashboardCalendar({ events, theme, title, icon }) {
    const calRef = useRef(null);
    const { dark, bg, border, text, textMuted, textSub } = theme;

    useEffect(() => {
        const api = calRef.current?.getApi?.();
        if (!api) return;
        const id = requestAnimationFrame(() => api.updateSize());
        return () => cancelAnimationFrame(id);
    }, [events, dark]);

    const fcVars = {
        "--fc-border-color": border,
        "--fc-page-bg-color": bg,
        "--fc-neutral-bg-color": dark ? "rgba(255,255,255,0.03)" : "#f7f8fb",
        "--fc-neutral-text-color": textMuted,
        "--fc-today-bg-color": "transparent",
        "--fc-list-event-hover-bg-color": dark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
        "--fc-button-bg-color": dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
        "--fc-button-border-color": border,
        "--fc-button-text-color": textSub,
        "--fc-button-hover-bg-color": dark ? "rgba(255,255,255,0.08)" : "rgba(217,119,6,0.08)",
        "--fc-button-active-bg-color": dark ? PRIMARY : "#111827",
        "--fc-button-active-border-color": dark ? PRIMARY : "#111827",
        "--fc-button-active-text-color": dark ? "#111" : "#fff",
        "--fc-highlight-color": dark ? "rgba(217,119,6,0.12)" : "rgba(217,119,6,0.15)",
        fontFamily: "'DM Sans', sans-serif",
    };

    return (
        <div style={{ background: bg, padding: 24, borderRadius: 24, border: `1px solid ${border}`, boxShadow: theme.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h4 style={{ margin: 0, color: text, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                    <i className={`fa-solid ${icon}`} style={{ color: PRIMARY }}></i>
                    {title}
                </h4>
            </div>
            <div 
                className="dashboard-fc-wrap"
                style={{
                    ...fcVars,
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: "16px 14px 18px",
                    overflow: "hidden",
                }}
            >
                <style>{`
                    .dashboard-fc-wrap .fc { color: ${text}; font-size: 0.78rem; }
                    .dashboard-fc-wrap .fc-toolbar-title { font-size: 0.9rem !important; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${text}; }
                    
                    /* Table Header */
                    .dashboard-fc-wrap .fc-col-header-cell { padding: 12px 0; background: ${dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}; }
                    .dashboard-fc-wrap .fc-col-header-cell-cushion { color: ${textSub}; font-weight: 700; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; }
                    
                    /* Day Grid */
                    .dashboard-fc-wrap .fc-daygrid-day-number { padding: 8px 12px; color: ${textSub}; font-weight: 600; font-size: 0.8rem; }
                    .dashboard-fc-wrap .fc-day-other .fc-daygrid-day-number { color: ${textMuted}; opacity: 0.5; }
                    
                    /* Buttons - Glassmorphism */
                    .dashboard-fc-wrap .fc-button { 
                        font-weight: 700; font-size: 0.7rem; border-radius: 10px; padding: 0.5em 1em; 
                        text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid ${border};
                        backdrop-filter: blur(4px); transition: all 0.2s ease;
                        display: inline-flex; align-items: center; justify-content: center;
                    }
                    .dashboard-fc-wrap .fc-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .dashboard-fc-wrap .fc-button-primary:not(:disabled):active,
                    .dashboard-fc-wrap .fc-button-primary:not(:disabled).fc-button-active {
                        background-color: ${PRIMARY} !important;
                        border-color: ${PRIMARY} !important;
                        color: ${dark ? "#111" : "#fff"} !important;
                        transform: translateY(0);
                    }
                    
                    /* Today Highlight */
                    .dashboard-fc-wrap .fc-day-today { background: transparent !important; }
                    .dashboard-fc-wrap .fc-day-today .fc-daygrid-day-number { 
                        background: ${PRIMARY}; color: ${dark ? "#111" : "#fff"} !important; 
                        border-radius: 8px; margin: 4px; padding: 4px 8px; display: inline-block;
                        box-shadow: 0 4px 10px color-mix(in srgb, ${PRIMARY}, transparent 60%);
                    }

                    /* Event Styling - Pill Look */
                    .dashboard-fc-wrap .fc-daygrid-event { 
                        border-radius: 20px; padding: 2px 8px; border: none !important;
                        font-weight: 600; font-size: 0.72rem; margin-top: 2px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        border-left: 3px solid transparent !important;
                    }
                    .dashboard-fc-wrap .fc-event-main { padding: 1px 0; }
                    .dashboard-fc-wrap .fc-daygrid-event:hover { filter: brightness(1.05); transform: translateX(2px); transition: all 0.2s ease; }
                    
                    /* List View Adjustments */
                    .dashboard-fc-wrap .fc-list-event { background: transparent !important; cursor: pointer; }
                    .dashboard-fc-wrap .fc-list-day-cushion { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'} !important; padding: 10px 15px !important; }
                    
                    .dashboard-fc-wrap .res-fc-event-cancelled { opacity: 0.45; text-decoration: line-through; }
                    .dashboard-fc-wrap .fc-scrollgrid { border-radius: 12px; overflow: hidden; border: 1px solid ${border} !important; }
                `}</style>
                <FullCalendar
                    ref={calRef}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    locale={frLocale}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next",
                        center: "title",
                        right: "dayGridMonth,listWeek",
                    }}
                    height="auto"
                    dayMaxEvents={2}
                    moreLinkClick="popover"
                    events={events}
                />
            </div>
        </div>
    );
}

const RecentFormations = ({ formations, theme: t }) => (
    <div style={{ background: t.bg, padding: 32, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
                <h4 style={{ margin: 0, color: t.text, fontSize: "1.2rem", fontWeight: 700 }}>Formations Récentes</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: t.textSub }}>Prochaines sessions planifiées</p>
            </div>
            <Link to="/admin/formations" style={{ fontSize: "0.75rem", color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>
                Voir tout <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.6rem", marginLeft: 4 }}></i>
            </Link>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            {(formations || []).slice(0, 5).map((f, i) => (
                <motion.div 
                    key={f.id_forma || i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ 
                        padding: "14px 16px", borderRadius: 16, background: t.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 16
                    }}
                >
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${PRIMARY}, transparent 92%)`,
                        display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY, fontSize: "1rem"
                    }}>
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ margin: 0, color: t.text, fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.sujet}</h5>
                        <p style={{ margin: 0, color: t.textSub, fontSize: "0.75rem" }}>{f.organisation?.nom || "Indisponible"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, color: t.text, fontSize: "0.75rem", fontWeight: 700 }}>{f.date_debut?.slice(8, 10)} / {f.date_debut?.slice(5, 7)}</p>
                        <p style={{ margin: 0, color: t.textMuted, fontSize: "0.65rem" }}>{f.date_debut?.slice(0, 4)}</p>
                    </div>
                </motion.div>
            ))}
            {!formations?.length && (
                <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted }}>
                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.5 }}></i>
                    <p style={{ fontSize: "0.85rem" }}>Aucune formation à venir</p>
                </div>
            )}
        </div>
    </div>
);

export default function HomeDashboard() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <HomeDashboardInner />
        </DM.Provider>
    );
}

function HomeDashboardInner() {
    const t = useTheme();
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [pInter, setPInter] = useState("Total");
    const [pForma, setPForma] = useState("Total");
    const [pRes, setPRes] = useState("Total");
    const [pImpact, setPImpact] = useState("Total");

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [statRes, userRes, resRes, formRes] = await Promise.all([
                    axios.get("/api/dashboard/summary", { headers }),
                    axios.get("/api/user", { headers }),
                    axios.get("/api/reservations", { headers }),
                    axios.get("/api/formations", { headers })
                ]);
                setStats(statRes.data);
                setUser(userRes.data);
                setReservations(resRes.data);
                setFormations(formRes.data);
            } catch (err) {
                console.error("Dashboard data fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const resEvents = useMemo(() => reservationsToFcEvents(reservations, t.dark), [reservations, t.dark]);
    const formEvents = useMemo(() => formationsToFcEvents(formations, t.dark), [formations, t.dark]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const getFilteredMetrics = (type, period) => {
        if (!stats) return 0;
        let data = [];
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const thisMonth = now.toISOString().slice(0, 7);
        const thisYear = now.getFullYear().toString();

        const filterFn = (item) => {
            if (period === "Total") return true;
            const itemDate = (item.date_debut || item.date).slice(0, 10);
            if (period === "Aujourd'hui") return itemDate === today;
            if (period === "Ce mois") return itemDate.startsWith(thisMonth);
            if (period === "Cette année") return itemDate.startsWith(thisYear);
            return true;
        };

        if (type === "formations") {
            const filtered = formations.filter(filterFn);
            return filtered.length;
        }
        if (type === "reservations") {
            return reservations.filter(filterFn).length;
        }
        if (type === "impact") {
            return formations.filter(filterFn).reduce((sum, f) => sum + (f.nbr_reel || 0), 0);
        }
        if (type === "intervenants") {
            // Count unique intervenant names/ids across filtered formations and reservations
            const fInter = formations.filter(filterFn).map(f => f.organisation?.nom); // Just a proxy if real IDs missing
            const rInter = reservations.filter(filterFn).map(r => r.id_intervenant);
            const combined = [...new Set([...fInter, ...rInter])].filter(Boolean);
            
            // If Total, return the absolute metric from stats
            if (period === "Total") return stats.metrics.intervenants;
            return combined.length;
        }
        return 0;
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "60vh" }}>
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 40, height: 40, border: `4px solid ${t.borderMd}`, borderTopColor: PRIMARY, borderRadius: "50%" }}
                />
            </div>
        );
    }

    const chartOptions = {
        chart: { 
            toolbar: { show: false }, 
            fontFamily: "'DM Sans', sans-serif",
            zoom: { enabled: false }
        },
        theme: { mode: t.dark ? "dark" : "light" },
        colors: [PRIMARY, "#3b82f6"],
        stroke: { curve: 'smooth', width: 3 },
        grid: { borderColor: t.chartGrid, strokeDashArray: 4 },
        xaxis: { categories: stats.chart.map(c => c.month) },
        tooltip: { theme: t.dark ? "dark" : "light" },
        legend: { position: 'top', horizontalAlign: 'right' }
    };

    const chartSeries = [
        { name: "Formations", data: stats.chart.map(c => c.formations) },
        { name: "Réservations", data: stats.chart.map(c => c.reservations) }
    ];

const StatCard = ({ icon, label, val, color, trend, subtext, theme: t, period, setPeriod }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const periods = ["Total", "Aujourd'hui", "Ce mois", "Cette année"];

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: t.shadowHover }}
            style={{ 
                background: t.bg, padding: "20px 24px", borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow,
                display: "flex", gap: 20, alignItems: "center", position: "relative", overflow: "visible",
                zIndex: open ? 50 : 1
            }}
        >
            {/* Propagating Ripples - Slower */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", borderRadius: 24 }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0.2 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{
                            duration: 7, 
                            repeat: Infinity,
                            delay: i * 1.8,
                            ease: "easeOut"
                        }}
                        style={{
                            position: "absolute",
                            left: "0%",
                            top: "50%",
                            transform: "translate(-35%, -50%)",
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            backgroundColor: color,
                            zIndex: 0
                        }}
                    />
                ))}
            </div>

            {/* Icon - Left side */}
            <div style={{ 
                width: 52, height: 52, borderRadius: 14, background: `color-mix(in srgb, ${color}, transparent 92%)`, 
                display: "flex", alignItems: "center", justifyContent: "center", color: color, fontSize: "1.4rem",
                zIndex: 1, boxShadow: `0 8px 20px color-mix(in srgb, ${color}, transparent 85%)`
            }}>
                <i className={`fa-solid ${icon}`}></i>
            </div>

            {/* Content */}
            <div style={{ zIndex: 1, flex: 1 }}>
                <p style={{ margin: 0, color: t.textSub, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <h3 style={{ margin: "4px 0", fontSize: "1.8rem", fontWeight: 800, color: t.text }}>{val}</h3>
                    {trend && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981" }}>
                            <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: "0.65rem" }}></i>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>+{trend}%</span>
                        </div>
                    )}
                </div>
                {subtext && <p style={{ margin: 0, fontSize: "0.72rem", color: t.textMuted, opacity: 0.8 }}>{subtext}</p>}
            </div>

            {/* Period Dropdown */}
            <div style={{ position: "relative", zIndex: 10 }}>
                <button 
                    onClick={() => setOpen(!open)}
                    style={{ 
                        padding: "6px 12px", borderRadius: 12, border: `1px solid ${color}40`, background: `${color}08`,
                        color: color, fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", outline: "none",
                        display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
                    }}
                >
                    {period}
                    <i className={`fa-solid fa-chevron-down`} style={{ fontSize: "0.55rem", opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}></i>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ 
                                position: "absolute", top: "110%", right: 0, width: 140, background: t.bg,
                                borderRadius: 16, border: `1px solid ${t.border}`, boxShadow: t.shadowHover,
                                overflow: "hidden", zIndex: 10, padding: 6, backdropFilter: "blur(10px)"
                            }}
                        >
                            {periods.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => { setPeriod(p); setOpen(false); }}
                                    style={{ 
                                        width: "100%", padding: "8px 12px", border: "none", 
                                        background: period === p ? color : "transparent",
                                        color: period === p ? "#fff" : t.text, 
                                        textAlign: "left", borderRadius: 10,
                                        fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "0.2s"
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

    return (
        <motion.div 
            initial="hidden" animate="show" variants={containerVariants}
            style={{ padding: "32px", fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* Greeting */}
            <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
                <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: t.text }}>
                    Bienvenue, <span style={{ color: PRIMARY }}>{user?.nom} {user?.prenom}</span> 👋
                </h2>
                <p style={{ margin: "4px 0 0", color: t.textSub }}>Voici une vue d'ensemble de l'activité du centre.</p>
            </motion.div>

            {/* Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
                <StatCard 
                    icon="fa-users" label="Bénéficiaires" 
                    val={getFilteredMetrics("intervenants", pInter)} 
                    color="#3b82f6" trend="12" 
                    subtext={pInter === "Total" ? "Inscrits au total" : "Actifs sur cette période"}
                    period={pInter} setPeriod={setPInter} theme={t} 
                />
                <StatCard 
                    icon="fa-graduation-cap" label="Formations" 
                    val={getFilteredMetrics("formations", pForma)} 
                    color="#8b5cf6" trend="5" 
                    subtext={pForma === "Total" ? "Depuis le lancement" : "Sessions planifiées"}
                    period={pForma} setPeriod={setPForma} theme={t} 
                />
                <StatCard 
                    icon="fa-calendar-check" label="Réservations" 
                    val={getFilteredMetrics("reservations", pRes)} 
                    color="#10b981" trend="8" 
                    subtext={pRes === "Total" ? "Historique complet" : "Séjours enregistrés"}
                    period={pRes} setPeriod={setPRes} theme={t} 
                />
                <StatCard 
                    icon="fa-earth-africa" label="Impact Global" 
                    val={getFilteredMetrics("impact", pImpact)} 
                    color={PRIMARY} 
                    subtext="Nombre total de participants"
                    period={pImpact} setPeriod={setPImpact} theme={t} 
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
                {/* Main Activity Chart */}
                <motion.div variants={itemVariants} style={{ 
                    gridColumn: "span 8", 
                    background: t.bg, padding: 32, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow,
                    "@media (max-width: 1200px)": { gridColumn: "span 12" } 
                }}>
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.2rem", fontWeight: 700 }}>Activité Mensuelle</h4>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: t.textSub }}>Flux des formations et réservations sur l'année</p>
                    </div>
                    <Chart options={{ 
                        ...chartOptions, 
                        legend: { show: true, position: 'top', horizontalAlign: 'right' },
                        grid: { ...chartOptions.grid, padding: { left: 20, right: 20 } }
                    }} series={chartSeries} type="area" height={350} />
                </motion.div>

                {/* Recent Formations List */}
                <motion.div variants={itemVariants} style={{ 
                    gridColumn: "span 4", 
                    "@media (max-width: 1200px)": { gridColumn: "span 12" } 
                }}>
                    <RecentFormations formations={stats?.recent?.formations} theme={t} />
                </motion.div>

                {/* Reservations Calendar */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 12" }}>
                    <DashboardCalendar 
                        title="Calendrier des Réservations" 
                        icon="fa-calendar-check"
                        events={resEvents}
                        theme={t}
                    />
                </motion.div>

                {/* Formations Calendar */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 12" }}>
                    <DashboardCalendar 
                        title="Calendrier des Formations" 
                        icon="fa-graduation-cap"
                        events={formEvents}
                        theme={t}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
