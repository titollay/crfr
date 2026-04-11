import React, { useEffect, useRef } from "react";
import { Doughnut, Line } from "react-chartjs-2";

export function PremiumStats({ stats, theme }) {
    if (!stats) return null;

    const { kpi, monthly } = stats;
    const { dark, bg, bgPage, border, text, textSub, textFaint, shadow, shadowLg } = theme;

    const PRIMARY = "#D97706";
    const SUCCESS = "#10b981";
    const INFO = "#3b82f6";
    const DANGER = "#ef4444";

    const kpiCards = [
        { label: "Total Réservations", value: kpi.total, icon: "fa-calendar-days", color: PRIMARY, bgStr: "217, 119, 6" },
        { label: "Confirmées", value: kpi.confirmees, icon: "fa-Écheck-double", color: SUCCESS, bgStr: "16, 185, 129" },
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
        backdropFilter: "blur(10px)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
        cursor: "default",
    };

    const handleHover = (e, isHover) => {
        if (isHover) {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = dark ? "0 12px 40px rgba(0,0,0,0.4)" : "0 12px 32px rgba(0,0,0,0.08)";
        } else {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = dark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 8px 24px rgba(0,0,0,0.04)";
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: dark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)",
                titleColor: dark ? "#fff" : "#111",
                bodyColor: dark ? "rgba(255,255,255,0.8)" : "#333",
                borderColor: border,
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
            }
        },
        scales: {
            x: { 
                grid: { display: false }, 
                ticks: { color: textFaint, font: { family: "'DM Sans', sans-serif" } } 
            },
            y: { 
                border: { display: false }, 
                grid: { color: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", drawBorder: false }, 
                ticks: { color: textFaint, stepSize: 1, font: { family: "'DM Sans', sans-serif" } } 
            }
        },
        interaction: {
            mode: "index",
            intersect: false,
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "78%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: text,
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'DM Sans', sans-serif", size: 13, weight: 500 }
                }
            },
            tooltip: {
                backgroundColor: dark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)",
                titleColor: dark ? "#fff" : "#111",
                bodyColor: dark ? "rgba(255,255,255,0.8)" : "#333",
                borderColor: border,
                borderWidth: 1,
                padding: 12,
            }
        }
    };

    return (
        <div style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }}>
            {/* Header Area */}
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: text, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
                    Tableau de Bord Analytique
                </h2>
                <p style={{ margin: 0, fontSize: "0.9rem", color: textSub }}>
                    Vue panoramique et statistiques détaillées des réservations.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                {kpiCards.map((card, idx) => (
                    <div 
                        key={idx} 
                        style={{...cardStyle, animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards`, opacity: 0}}
                        onMouseEnter={(e) => handleHover(e, true)}
                        onMouseLeave={(e) => handleHover(e, false)}
                    >
                        <div>
                            <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {card.label}
                            </p>
                            <h3 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: text, lineHeight: 1 }}>
                                {card.value}
                            </h3>
                        </div>
                        <div style={{ 
                            width: 56, height: 56, borderRadius: 16, 
                            background: dark ? `rgba(${card.bgStr}, 0.1)` : `rgba(${card.bgStr}, 0.08)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: card.color, fontSize: 24,
                            boxShadow: `inset 0 0 0 1px rgba(${card.bgStr}, 0.2)`
                        }}>
                            <i className={`fa-solid ${card.icon}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                {/* Doughnut Chart */}
                <div style={{...cardStyle, flexDirection: "column", alignItems: "flex-start", opacity: 0, animation: "fadeInUp 0.5s ease-out 0.4s forwards"}}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: text, margin: "0 0 24px" }}>
                        Répartition des Statuts
                    </h3>
                    <div style={{ position: "relative", width: "100%", height: 260, display: "flex", justifyContent: "center" }}>
                        <Doughnut 
                            data={{
                                labels: ["Confirmées", "En Attente", "Annulées"],
                                datasets: [{
                                    data: [kpi.confirmees, kpi.attente, kpi.annulees],
                                    backgroundColor: [SUCCESS, INFO, DANGER],
                                    borderWidth: 0,
                                    hoverOffset: 8,
                                }]
                            }} 
                            options={doughnutOptions} 
                        />
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -65%)", textAlign: "center", pointerEvents: "none" }}>
                            <span style={{ display: "block", fontSize: "2.5rem", fontWeight: 800, color: text, lineHeight: 1 }}>
                                {kpi.taux_confirmation}%
                            </span>
                            <span style={{ fontSize: "0.75rem", color: textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Confirmation
                            </span>
                        </div>
                    </div>
                </div>

                {/* Line Chart */}
                <div style={{...cardStyle, flexDirection: "column", alignItems: "flex-start", opacity: 0, animation: "fadeInUp 0.5s ease-out 0.5s forwards"}}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: 24 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: text, margin: 0 }}>
                            ÉÉvolution Mensuelle
                        </h3>
                        <div style={{ padding: "6px 12px", background: dark ? "rgba(217,119,6,0.1)" : "rgba(217,119,6,0.08)", borderRadius: 20, color: PRIMARY, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em" }}>
                            <i className="fa-solid fa-chart-line" style={{ marginRight: 6 }} />
                            Aperçu Global
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 280 }}>
                        <Line 
                            data={{
                                labels: monthly?.map(s => s.month) || [],
                                datasets: [{
                                    label: "Réservations Créééées",
                                    data: monthly?.map(s => s.total) || [],
                                    borderColor: PRIMARY,
                                    backgroundColor: dark ? "rgba(217, 119, 6, 0.15)" : "rgba(217, 119, 6, 0.1)",
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 3,
                                    pointRadius: 5,
                                    pointHoverRadius: 7,
                                    pointBackgroundColor: dark ? "#111" : "#fff",
                                    pointBorderColor: PRIMARY,
                                    pointBorderWidth: 2,
                                }]
                            }} 
                            options={lineChartOptions} 
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

