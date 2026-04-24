import React, { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { motion, AnimatePresence } from "framer-motion";

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
        bgInput: dark ? "#1a1a1a" : "#f1f5f9",
        bgHover: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
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

export default function Reports() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <ReportsInner />
        </DM.Provider>
    );
}

function ReportsInner() {
    const t = useTheme();
    const [interStats, setInterStats] = useState(null);
    const [resevStats, setResevStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            setLoading(true);
            try {
                const [intRes, resRes] = await Promise.all([
                    axios.get("/api/intervenants/statistics", { headers }),
                    axios.get("/api/reservations/statistics", { headers })
                ]);
                setInterStats(intRes.data);
                setResevStats(resRes.data);
            } catch (err) {
                console.error("Error fetching report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: t.bgPage }}>
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ 
                        width: 44, height: 44, 
                        border: `4px solid ${t.borderMd}`, 
                        borderTopColor: PRIMARY, 
                        borderRadius: "50%" 
                    }}
                />
            </div>
        );
    }

    // Chart Options Factory
    const getCommonOptions = (extra = {}) => ({
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            background: "transparent",
            foreColor: t.textSub,
            fontFamily: "'DM Sans', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 }
            },
            ...extra.chart
        },
        theme: { mode: t.dark ? "dark" : "light" },
        colors: [PRIMARY, "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"],
        grid: {
            borderColor: t.chartGrid,
            strokeDashArray: 4,
            padding: { top: 10, right: 10, bottom: 0, left: 10 }
        },
        tooltip: {
            theme: t.dark ? "dark" : "light",
            x: { show: true },
            style: { fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }
        },
        dataLabels: { enabled: false },
        ...extra
    });

    // 1. Basic Area Chart: Evolution des Formations (Dynamic)
    const areaOptions = getCommonOptions({
        xaxis: { categories: interStats?.evolution?.map(e => e.label) || [] },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] }
        },
    });
    const areaSeries = [{ name: "Bénéficiaires", data: interStats?.evolution?.map(e => e.total) || [] }];

    // 2. Spline Area Chart: Flux des Bénéficiaires (Daily)
    const splineOptions = getCommonOptions({
        xaxis: { type: 'datetime', categories: interStats?.daily?.map(d => d.date) || [] },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 0, hover: { size: 6 } },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 }
        },
        colors: ["#3b82f6"]
    });
    const splineSeries = [{ name: "Bénéficiaires", data: interStats?.daily?.map(d => d.total) || [] }];

    // 3. Bar Chart (Horizontal): Top Organisations
    const barOptions = getCommonOptions({
        plotOptions: {
            bar: { borderRadius: 6, horizontal: true, distributed: true, barHeight: '65%' }
        },
        xaxis: { categories: interStats?.by_org?.map(o => o.org_nom) || [] },
        legend: { show: false }
    });
    const barSeries = [{ name: "Bénéficiaires", data: interStats?.by_org?.map(o => o.total) || [] }];

    // 4. Column Chart: Impact Global
    const columnOptions = getCommonOptions({
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 8 } },
        xaxis: { categories: ['Formations', 'Impact (Reel)', 'Hôtel Seul', 'Total'] },
        colors: ["#8b5cf6"]
    });
    const columnSeries = [{
        name: "Unités",
        data: [ interStats?.total_formation || 0, interStats?.sum_nbr_reel || 0, interStats?.total_hotel_seul || 0, interStats?.total_global || 0 ]
    }];

    // 5. Radar Chart: Analyse Hébergement (Replaced Bubble for a better premium look)
    const radarOptions = getCommonOptions({
        chart: { type: 'radar' },
        xaxis: { categories: resevStats?.by_room?.map(r => `Ch ${r.num_chambre}`) || [] },
        stroke: { width: 2 },
        fill: { opacity: 0.2 },
        markers: { size: 4, hover: { size: 7 } },
        colors: ["#10b981"]
    });
    const radarSeries = [{ name: "Réservations", data: resevStats?.by_room?.map(r => r.total) || [] }];

    return (
        <motion.div 
            initial="hidden" animate="show" variants={containerVariants}
            style={{ padding: "32px 32px", minHeight: "100%", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* Header */}
            <motion.div variants={itemVariants} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 20 }}>
                <div>
                     <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${PRIMARY}, transparent 85%)`, display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                            <i className="fa-solid fa-chart-pie" style={{ fontSize: 18 }}></i>
                        </div>
                        <h1 style={{ margin: 0, fontSize: "1.85rem", fontWeight: 800, color: t.text, letterSpacing: "-0.03em" }}>Rapports & Synthèse</h1>
                    </div>
                    <p style={{ margin: 0, color: t.textSub, fontSize: "0.95rem" }}>Aperçu détaillé et statistiques de la plateforme</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                     <button 
                        style={{ padding: "12px 24px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 20px color-mix(in srgb, ${PRIMARY}, transparent 60%)`, transition: "transform 0.2s, box-shadow 0.2s" }}
                        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                        onClick={() => window.print()}
                    >
                        <i className="fa-solid fa-cloud-arrow-down" /> Exporter PDF
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 32 }}>
                {[
                    { label: "Impact Global", val: interStats?.total_global || 0, icon: "fa-earth-africa", color: PRIMARY, bg: `color-mix(in srgb, ${PRIMARY}, transparent 88%)` },
                    { label: "Total Bénéficiaires", val: interStats?.sum_nbr_reel || 0, icon: "fa-users", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
                    { label: "Taux Confirmation", val: (resevStats?.kpi?.taux_confirmation || 0) + "%", icon: "fa-check-double", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
                    { label: "Moyenne Séjour", val: (resevStats?.avg_stay_days || 0) + " Jours", icon: "fa-bed", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -6, boxShadow: t.shadowHover, borderColor: t.borderMd }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ 
                            background: t.bg, borderRadius: 24, padding: "28px 24px", border: `1px solid ${t.border}`, 
                            boxShadow: t.shadow, display: "flex", justifyContent: "space-between", alignItems: "center",
                            position: "relative", overflow: "hidden", cursor: "default"
                        }}
                    >
                        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: s.bg, filter: "blur(30px)", opacity: 0.7 }} />
                        <div style={{ zIndex: 1 }}>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: t.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                            <p style={{ margin: "8px 0 0", fontSize: "2.2rem", fontWeight: 800, color: t.text, lineHeight: 1 }}>{s.val}</p>
                        </div>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, zIndex: 1, boxShadow: `0 8px 20px ${s.bg}` }}>
                             <i className={`fa-solid ${s.icon}`} style={{ fontSize: 26 }} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Grid */}
            <div className="charts-grid">
                
                {/* 1. Area Chart */}
                <motion.div className="chart-col-7" variants={itemVariants} style={{ background: t.bg, borderRadius: 24, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Evolution des Formations</h4>
                            <span style={{ fontSize: "0.85rem", color: t.textMuted }}>Croissance mensuelle globale</span>
                        </div>
                    </div>
                    <Chart options={areaOptions} series={areaSeries} type="area" height={320} />
                </motion.div>

                {/* 2. Radar Chart */}
                <motion.div className="chart-col-5" variants={itemVariants} style={{ background: t.bg, borderRadius: 24, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                     <div style={{ marginBottom: 8 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Occupation des Chambres</h4>
                        <span style={{ fontSize: "0.85rem", color: t.textMuted }}>Répartition par chambre</span>
                    </div>
                    <Chart options={radarOptions} series={radarSeries} type="radar" height={340} />
                </motion.div>

                {/* 3. Bar Chart Horizontal */}
                <motion.div className="chart-col-6" variants={itemVariants} style={{ background: t.bg, borderRadius: 24, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Top Organisations</h4>
                        <span style={{ fontSize: "0.85rem", color: t.textMuted }}>Classement par bénéficiaires</span>
                    </div>
                    <Chart options={barOptions} series={barSeries} type="bar" height={350} />
                </motion.div>

                {/* 4. Flux SPLINE Chart */}
                <motion.div className="chart-col-6" variants={itemVariants} style={{ background: t.bg, borderRadius: 24, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h4 style={{ margin: 0, color: t.text, fontSize: "1.1rem", fontWeight: 700 }}>Flux des Bénéficiaires</h4>
                            <span style={{ fontSize: "0.85rem", color: t.textMuted }}>Tendance des derniers jours</span>
                        </div>
                    </div>
                    <Chart options={splineOptions} series={splineSeries} type="area" height={350} />
                </motion.div>

            </div>

            <style>{`
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }
                .chart-col-7 { grid-column: span 7; }
                .chart-col-5 { grid-column: span 5; }
                .chart-col-6 { grid-column: span 6; }
                
                @media (max-width: 1100px) {
                    .chart-col-7, .chart-col-5, .chart-col-6 { grid-column: span 12; }
                }

                @media (max-width: 768px) {
                    .filter-pills { display: none !important; }
                }

                @media print {
                    body * { visibility: hidden; }
                    #admin-layout-main-content, #admin-layout-main-content * { visibility: visible; }
                    #admin-layout-main-content { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .apexcharts-toolbar { display: none !important; }
                    .charts-grid { display: block; }
                    .charts-grid > div { margin-bottom: 24px; page-break-inside: avoid; }
                }
            `}</style>
        </motion.div>
    );
}
