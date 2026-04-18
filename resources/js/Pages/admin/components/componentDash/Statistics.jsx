import React, {
    useContext,
    useEffect,
    useState,
    createContext,
} from "react";
import { Link } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

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
        bgInput: dark ? "rgba(255,255,255,0.05)" : "#fff",
        border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        borderMd: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.13)",
        borderSm: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        text: dark ? "rgba(255,255,255,0.87)" : "#111",
        textSub: dark ? "rgba(255,255,255,0.6)" : "#374151",
        textMuted: dark ? "rgba(255,255,255,0.35)" : "#6b7280",
        textFaint: dark ? "rgba(255,255,255,0.22)" : "#9ca3af",
        shadow: dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.07)",
    };
}

function StatCard({ title, value, icon, trend, subtext }) {
    const t = useTheme();
    const isUp = trend >= 0;

    return (
        <div
            style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: t.shadow,
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {title}
                    </h3>
                    <div style={{ margin: "8px 0 0", fontSize: "2rem", fontWeight: 800, color: t.text, lineHeight: 1 }}>
                        {value}
                    </div>
                </div>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "rgba(217,119,6,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: PRIMARY,
                        fontSize: 20,
                    }}
                >
                    <i className={icon} />
                </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontWeight: 700,
                        background: isUp ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: isUp ? "#10b981" : "#ef4444",
                    }}
                >
                    <i className={isUp ? "fa-solid fa-arrow-trend-up" : "fa-solid fa-arrow-trend-down"} />
                    {isUp ? "+" : ""}{trend}%
                </span>
                <span style={{ color: t.textMuted }}>{subtext}</span>
            </div>
        </div>
    );
}

function SectionCard({ title, children, theme: t }) {
    return (
        <div
            style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                boxShadow: t.shadow,
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    padding: "18px 24px",
                    borderBottom: `1px solid ${t.border}`,
                    background: t.dark ? "rgba(255,255,255,0.01)" : "#fafbff",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: t.text, letterSpacing: "-0.01em" }}>
                    {title}
                </h2>
            </div>
            <div style={{ padding: 24, flex: 1, position: "relative" }}>{children}</div>
        </div>
    );
}

// Simulated data
const revData = [
    { name: "Jan", revenue: 4000, profit: 2400 },
    { name: "Fév", revenue: 3000, profit: 1398 },
    { name: "Mar", revenue: 2000, profit: 9800 },
    { name: "Avr", revenue: 2780, profit: 3908 },
    { name: "Mai", revenue: 1890, profit: 4800 },
    { name: "Juin", revenue: 2390, profit: 3800 },
    { name: "Juil", revenue: 3490, profit: 4300 },
];

const resData = [
    { name: "Lun", total: 12, annulees: 2 },
    { name: "Mar", total: 19, annulees: 1 },
    { name: "Mer", total: 15, annulees: 3 },
    { name: "Jeu", total: 22, annulees: 0 },
    { name: "Ven", total: 28, annulees: 4 },
    { name: "Sam", total: 35, annulees: 5 },
    { name: "Dim", total: 10, annulees: 1 },
];

export default function Statistics() {
    const dark = useDarkMode();
    const t = useTheme();

    return (
        <DM.Provider value={dark}>
            <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif", color: t.text, transition: "background 0.3s" }}>
                {/* ── Header ── */}
                <div style={{ borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 10 }}>
                            <i className="fa-solid fa-chart-pie" style={{ color: PRIMARY }} /> Statistiques
                        </h1>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                        <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Statistiques</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
                        <button
                            style={{ background: t.bgInput, color: t.text, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <i className="fa-solid fa-download" style={{ color: t.textSub }} /> Exporter PDF
                        </button>
                    </div>
                </div>

                <div style={{ padding: "24px 28px" }}>
                    
                    {/* ── Overview KPIs ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 24 }}>
                        <StatCard 
                            title="Total Réservations" 
                            value="342" 
                            icon="fa-regular fa-calendar-check" 
                            trend={12.5} 
                            subtext="vs mois précédent" 
                        />
                        <StatCard 
                            title="Revenus Mensuels" 
                            value="24.5K" 
                            icon="fa-solid fa-sack-dollar" 
                            trend={8.2} 
                            subtext="vs mois précédent" 
                        />
                        <StatCard 
                            title="Formations Actives" 
                            value="48" 
                            icon="fa-solid fa-chalkboard-user" 
                            trend={-2.4} 
                            subtext="vs mois précédent" 
                        />
                        <StatCard 
                            title="Taux d'Occupation" 
                            value="76%" 
                            icon="fa-solid fa-bed" 
                            trend={5.1} 
                            subtext="moyenne cette semaine" 
                        />
                    </div>

                    {/* ── Charts Grid ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                        <div style={{ height: 420 }}>
                            <SectionCard title="Évolution des Revenus" theme={t}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.border} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: t.textMuted, fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: t.textMuted, fontSize: 12 }} width={60} />
                                        <Tooltip 
                                            contentStyle={{ background: t.bg, border: `1px solid ${t.borderMd}`, borderRadius: 8, boxShadow: t.shadow }}
                                            itemStyle={{ color: t.text }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={3} dot={{ r: 4, fill: t.bg, stroke: PRIMARY, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>

                        <div style={{ height: 420 }}>
                            <SectionCard title="Demandes de Réservations (Hebdo)" theme={t}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.border} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: t.textMuted, fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: t.textMuted, fontSize: 12 }} width={60} />
                                        <Tooltip 
                                            contentStyle={{ background: t.bg, border: `1px solid ${t.borderMd}`, borderRadius: 8, boxShadow: t.shadow }}
                                            cursor={{ fill: t.bgHover }}
                                        />
                                        <Bar dataKey="total" fill={PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="annulees" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>
                        </div>
                    </div>

                </div>
            </div>
        </DM.Provider>
    );
}
