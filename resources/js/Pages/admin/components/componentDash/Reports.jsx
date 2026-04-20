import React, { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";

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
        border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
        borderMd: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        bgInput: dark ? "#1a1a1a" : "#f1f5f9",
        bgAlt: dark ? "#161616" : "#f8fafc",
        shadow: dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 15px rgba(0,0,0,0.05)",
        chartGrid: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
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

    const cardStyle = {
        background: t.bg,
        borderRadius: 16,
        padding: 24,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: t.bgPage }}>
                <div style={{ color: PRIMARY, fontWeight: 700 }}>Chargement des analyses...</div>
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
            ...extra.chart
        },
        theme: {
            mode: t.dark ? "dark" : "light",
        },
        colors: [PRIMARY, "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"],
        grid: {
            borderColor: t.chartGrid,
            strokeDashArray: 4,
        },
        tooltip: {
            theme: t.dark ? "dark" : "light",
            x: { show: true },
        },
        ...extra
    });

    // 1. Basic Area Chart: Evolution des Formations (Monthly)
    const areaOptions = getCommonOptions({
        xaxis: {
            categories: interStats?.monthly?.map(m => m.month) || [],
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100]
            }
        },
    });
    const areaSeries = [{
        name: "Nombre de participants",
        data: interStats?.monthly?.map(m => m.total) || []
    }];

    // 2. Spline Area Chart: Flux des Bénéficiaires (Daily - Last 30 days)
    const splineOptions = getCommonOptions({
        xaxis: {
            type: 'datetime',
            categories: interStats?.daily?.map(d => d.date) || [],
        },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 0 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0,
            }
        },
    });
    const splineSeries = [{
        name: "Inscriptions quotidiennes",
        data: interStats?.daily?.map(d => d.total) || []
    }];

    // 3. Bar Chart (Horizontal): Palmarès des Organisations
    const barOptions = getCommonOptions({
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true,
                barHeight: '70%',
            }
        },
        xaxis: {
            categories: interStats?.by_org?.map(o => o.org_nom) || [],
        },
        show: { toolbar: { show: false } },
        legend: { show: false }
    });
    const barSeries = [{
        name: "Bénéficiaires",
        data: interStats?.by_org?.map(o => o.total) || []
    }];

    // 4. Column Chart: Impact Global (Participants vs Sessions vs Hotel only)
    const columnOptions = getCommonOptions({
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 6,
            }
        },
        xaxis: {
            categories: ['Formations', 'Impact (nbr_reel)', 'Hôtel Seul', 'Total Global'],
        },
    });
    const columnSeries = [{
        name: "Unités",
        data: [
            interStats?.total_formation || 0,
            interStats?.sum_nbr_reel || 0,
            interStats?.total_hotel_seul || 0,
            interStats?.total_global || 0
        ]
    }];

    // 5. 3D Bubble Chart: Analyse de l'Hébergement
    // X: Chambre (Index), Y: Total Réservations, Z: Poids (Volume)
    const bubbleOptions = getCommonOptions({
        dataLabels: { enabled: false },
        fill: { opacity: 0.8 },
        xaxis: {
            tickAmount: 12,
            type: 'category',
            categories: resevStats?.by_room?.map(r => `Ch ${r.num_chambre}`) || [],
            labels: { rotate: -45 }
        },
        yaxis: { max: Math.max(...(resevStats?.by_room?.map(r => r.total) || [10])) + 5 },
    });
    const bubbleSeries = [{
        name: "Fréquentation des Chambres",
        data: resevStats?.by_room?.map((item, idx) => [
            idx + 1, // X
            item.total, // Y
            item.total * 2 // Z (Size)
        ]) || []
    }];

    return (
        <div style={{ padding: "28px 24px", minHeight: "100%", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: t.text }}>Rapports & Analyses</h1>
                    <p style={{ margin: "4px 0 0", color: t.textSub, fontSize: "0.9rem" }}>Vue d'ensemble de l'activité du centre</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                     <button 
                        style={{ padding: "10px 20px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}
                        onClick={() => window.print()}
                    >
                        <i className="fa-solid fa-file-pdf" /> Exporter PDF
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: t.bg, borderRadius: 12, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.8rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: t.textMuted }} />
                        <span style={{ fontSize: "0.8rem", color: t.text, fontWeight: 700 }}>Rapports</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
                {[
                    { label: "Impact Global", val: interStats?.total_global, icon: "fa-earth-africa", color: PRIMARY, bg: "rgba(217,119,6,0.1)" },
                    { label: "Participants", val: interStats?.sum_nbr_reel, icon: "fa-users-rectangle", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                    { label: "Taux Confirmation", val: resevStats?.kpi?.taux_confirmation + "%", icon: "fa-calendar-check", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                    { label: "Moyenne Séjour", val: resevStats?.avg_stay_days + " Nuites", icon: "fa-clock", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                ].map((s, i) => (
                    <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: t.textSub, fontWeight: 600 }}>{s.label}</p>
                            <p style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 800, color: t.text }}>{s.val}</p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                             <i className={`fa-solid ${s.icon}`} style={{ fontSize: 20 }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
                
                {/* 1. Basic Area Chart */}
                <div style={{ ...cardStyle, gridColumn: "span 6" }}>
                    <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1rem" }}>Evolution des Formations</h4>
                        <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Mensuel</span>
                    </div>
                    <Chart options={areaOptions} series={areaSeries} type="area" height={320} />
                </div>

                {/* 2. Area Spline Chart */}
                <div style={{ ...cardStyle, gridColumn: "span 6" }}>
                    <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1rem" }}>Flux des Bénéficiaires</h4>
                        <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Derniers 30 jours</span>
                    </div>
                    <Chart options={splineOptions} series={splineSeries} type="area" height={320} />
                </div>

                {/* 3. Bar Chart Horizontal */}
                <div style={{ ...cardStyle, gridColumn: "span 4" }}>
                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1rem" }}>Top Organisations</h4>
                    </div>
                    <Chart options={barOptions} series={barSeries} type="bar" height={350} />
                </div>

                {/* 4. Column Chart */}
                <div style={{ ...cardStyle, gridColumn: "span 4" }}>
                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1rem" }}>Répartition de l'Impact</h4>
                    </div>
                    <Chart options={columnOptions} series={columnSeries} type="bar" height={350} />
                </div>

                {/* 5. 3D Bubble Chart */}
                <div style={{ ...cardStyle, gridColumn: "span 4" }}>
                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ margin: 0, color: t.text, fontSize: "1rem" }}>Analyse Hébergement</h4>
                    </div>
                    <Chart options={bubbleOptions} series={bubbleSeries} type="bubble" height={350} />
                </div>

            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #admin-layout-main-content, #admin-layout-main-content * { visibility: visible; }
                    #admin-layout-main-content { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
}
