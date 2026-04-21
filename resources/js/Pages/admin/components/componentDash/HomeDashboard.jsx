import React, { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [statRes, userRes] = await Promise.all([
                    axios.get("/api/dashboard/summary", { headers }),
                    axios.get("/api/user", { headers })
                ]);
                setStats(statRes.data);
                setUser(userRes.data);
            } catch (err) {
                console.error("Dashboard data fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const StatCard = ({ icon, label, val, color, trend }) => (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: t.shadowHover }}
            style={{ 
                background: t.bg, padding: 24, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow,
                display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden"
            }}
        >
            <div style={{ zIndex: 1 }}>
                <p style={{ margin: 0, color: t.textSub, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <h3 style={{ margin: "8px 0 0", fontSize: "1.85rem", fontWeight: 800, color: t.text }}>{val}</h3>
                    {trend && <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>+{trend}%</span>}
                </div>
            </div>
            <div style={{ 
                width: 56, height: 56, borderRadius: 16, background: `color-mix(in srgb, ${color}, transparent 90%)`, 
                display: "flex", alignItems: "center", justifyContent: "center", color: color, fontSize: "1.5rem"
            }}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
        </motion.div>
    );

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
                <StatCard icon="fa-users" label="Bénéficiaires" val={stats.metrics.intervenants} color="#3b82f6" trend="12" />
                <StatCard icon="fa-graduation-cap" label="Formations" val={stats.metrics.formations} color="#8b5cf6" trend="5" />
                <StatCard icon="fa-calendar-check" label="Réservations" val={stats.metrics.reservations} color="#10b981" trend="8" />
                <StatCard icon="fa-earth-africa" label="Impact Global" val={stats.metrics.impact} color={PRIMARY} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
                {/* Main Activity Chart */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 6", background: t.bg, padding: 24, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Activité Mensuelle</h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: t.textSub }}>Comparatif formations/réservations</p>
                    </div>
                    <Chart options={{ ...chartOptions, legend: { show: false } }} series={chartSeries} type="area" height={280} />
                </motion.div>

                {/* Rooms Occupation Pie */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 3", background: t.bg, padding: "24px 20px", borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "0.95rem", fontWeight: 700 }}>Chambres</h4>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: t.textSub }}>État actuel</p>
                    </div>
                    <Chart 
                        options={{
                            labels: ['Libre', 'Occupée', 'Maint.'],
                            colors: ['#10b981', '#f43f5e', '#64748b'],
                            legend: { show: false },
                            stroke: { width: 0 },
                            dataLabels: { enabled: false },
                            plotOptions: {
                                pie: {
                                    donut: {
                                        size: '75%',
                                        labels: {
                                            show: true,
                                            name: { show: true, fontSize: '11px', color: t.textSub, offsetY: -8 },
                                            value: { show: true, fontSize: '18px', fontWeight: 800, color: t.text, offsetY: 8, formatter: (v) => v },
                                            total: {
                                                show: true,
                                                label: 'Total',
                                                fontSize: '11px',
                                                color: t.textSub,
                                                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                            }
                                        }
                                    }
                                }
                            },
                            tooltip: { theme: t.dark ? "dark" : "light" }
                        }} 
                        series={[stats.chambres.disponible, stats.chambres.occupee, stats.chambres.maintenance]} 
                        type="donut" 
                        height={240} 
                    />
                </motion.div>

                {/* Salles Occupation Pie - NEW */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 3", background: t.bg, padding: "24px 20px", borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "0.95rem", fontWeight: 700 }}>Salles</h4>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: t.textSub }}>Disponibilité</p>
                    </div>
                    <Chart 
                        options={{
                            labels: ['Libre', 'Occupée'],
                            colors: ['#f59e0b', '#3b82f6'],
                            legend: { show: false },
                            stroke: { width: 0 },
                            dataLabels: { enabled: false },
                            plotOptions: {
                                pie: {
                                    donut: {
                                        size: '75%',
                                        labels: {
                                            show: true,
                                            name: { show: true, fontSize: '11px', color: t.textSub, offsetY: -8 },
                                            value: { show: true, fontSize: '18px', fontWeight: 800, color: t.text, offsetY: 8, formatter: (v) => v },
                                            total: {
                                                show: true,
                                                label: 'Total',
                                                fontSize: '11px',
                                                color: t.textSub,
                                                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                            }
                                        }
                                    }
                                }
                            },
                            tooltip: { theme: t.dark ? "dark" : "light" }
                        }} 
                        series={[stats.salles.disponible, stats.salles.occupee]} 
                        type="donut" 
                        height={240} 
                    />
                </motion.div>

                {/* Recent Reservations Table */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 6", background: t.bg, padding: 24, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Réservations Récentes</h4>
                        <Link to="/dashboard/reservations" style={{ fontSize: "0.8rem", color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>Voir tout</Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {stats.recent.reservations.map((res, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: t.bgPage }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: PRIMARY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                                    {res.chambre.num_chambre}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: t.text }}>{res.intervenant.nom} {res.intervenant.prenom}</p>
                                    <p style={{ margin: 0, fontSize: "0.75rem", color: t.textSub }}>Du {new Date(res.date_debut).toLocaleDateString()}</p>
                                </div>
                                <span style={{ fontSize: "0.7rem", padding: "4px 8px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 700 }}>
                                    {res.statut}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Upcoming Formations */}
                <motion.div variants={itemVariants} style={{ gridColumn: "span 6", background: t.bg, padding: 24, borderRadius: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Prochaines Formations</h4>
                        <Link to="/dashboard/formations" style={{ fontSize: "0.8rem", color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>Voir tout</Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {stats.recent.formations.map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: t.bgPage }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#8b5cf6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="fa-solid fa-graduation-cap"></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: t.text }}>{f.sujet}</p>
                                    <p style={{ margin: 0, fontSize: "0.75rem", color: t.textSub }}>Prévu pour {new Date(f.date_debut).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: t.text }}>{f.nbr_prevu}</p>
                                    <p style={{ margin: 0, fontSize: "0.6rem", color: t.textSub }}>Bénéf.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
