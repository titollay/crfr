import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import ReactApexChart from "react-apexcharts";

ChartJS.register(ArcElement, Tooltip, Legend);

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
        text: dark ? "rgba(255,255,255,0.87)" : "#111",
        textSub: dark ? "rgba(255,255,255,0.6)" : "#374151",
        textMuted: dark ? "rgba(255,255,255,0.35)" : "#6b7280",
        textFaint: dark ? "rgba(255,255,255,0.22)" : "#9ca3af",
        shadow: dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.07)",
        shadowLg: dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.18)",
    };
}

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

function getColorForOrg(org) {
    const type = org?.type?.trim();
    if (type && ORG_COLORS[type]) return ORG_COLORS[type];
    if (!org?.nom) return FALLBACK_PALETTE[0];
    const code = org.nom.charCodeAt(0);
    return FALLBACK_PALETTE[Math.abs(code) % FALLBACK_PALETTE.length];
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
}

const MOIS_NOMS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
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

export default function Planning() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <PlanningInner />
        </DM.Provider>
    );
}

function PlanningInner() {
    const t = useTheme();
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedFormation, setSelectedFormation] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get("/api/formations", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => { setFormations(res.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const formationsInMonth = useMemo(() => {
        const mStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        return formations.filter(f => f.date_debut?.startsWith(mStr) || f.date_fin?.startsWith(mStr));
    }, [formations, year, month]);

    const changeMonth = (delta) => {
        setCurrentDate(new Date(year, month + delta, 1));
    };

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return formations.filter(f => {
            const d = f.date_debut?.split(" ")[0];
            const f2 = f.date_fin?.split(" ")[0];
            return d <= dateStr && f2 >= dateStr;
        });
    };

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const orgStats = useMemo(() => {
        const stats = {};
        formations.forEach(f => {
            const type = f.organisation?.type || "Autre";
            stats[type] = (stats[type] || 0) + 1;
        });
        return Object.entries(stats).map(([org, count]) => ({ org, count }));
    }, [formations]);

    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
            <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: t.text }}>
                        <i className="fa-solid fa-calendar-days" style={{ color: PRIMARY, marginRight: 10 }} />
                        Planning des formations
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: t.textMuted }}>
                        Calendrier mensuel avec toutes les formations planifiées
                    </p>
                </div>
            </div>

            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
                <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: t.shadow }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button onClick={() => changeMonth(-1)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.borderMd}`, background: "transparent", cursor: "pointer", color: t.textSub }}>
                            <i className="fa-solid fa-chevron-left" />
                        </button>
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: t.text }}>{MOIS_NOMS[month]} {year}</h2>
                        <button onClick={() => changeMonth(1)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.borderMd}`, background: "transparent", cursor: "pointer", color: t.textSub }}>
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>

                    <div style={{ padding: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(jour => (
                                <div key={jour} style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" }}>{jour}</div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                            {days.map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} />;
                                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const events = getEventsForDay(day);
                                const isToday = new Date().toISOString().startsWith(dateStr);
                                return (
                                    <div key={day} style={{ minHeight: 80, background: t.bgAlt, borderRadius: 8, padding: 4, border: isToday ? `2px solid ${PRIMARY}` : `1px solid ${t.borderSm}` }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: isToday ? PRIMARY : t.textMuted, marginBottom: 4 }}>{day}</div>
                                        {events.slice(0, 2).map((ev, i) => (
                                            <div key={ev.id_forma} onClick={() => setSelectedFormation(ev)}
                                                style={{ fontSize: "0.65rem", padding: "2px 4px", borderRadius: 4, background: getColorForOrg(ev.organisation), color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                                                {ev.sujet}
                                            </div>
                                        ))}
                                        {events.length > 2 && <div style={{ fontSize: "0.6rem", color: t.textMuted }}>+{events.length - 2} plus</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, boxShadow: t.shadow }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: t.text }}>Par type d'organisation</h3>
                        {orgStats.length === 0 ? (
                            <p style={{ color: t.textFaint, fontSize: "0.85rem" }}>Aucune formation</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {orgStats.map(({ org, count }) => {
                                    const total = formations.length;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={org}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: "0.8rem", color: t.textSub }}>{org}</span>
                                                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: t.text }}>{count}</span>
                                            </div>
                                            <div style={{ height: 6, background: t.border, borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: ORG_COLORS[org] || "#64748b", borderRadius: 3, transition: "width 0.3s" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, boxShadow: t.shadow }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: t.text }}>Légende</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {Object.entries(ORG_COLORS).map(([org, color]) => (
                                <div key={org} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                                    <span style={{ fontSize: "0.7rem", color: t.textSub }}>{org}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, boxShadow: t.shadow }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700, color: t.text }}>Statistiques</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ textAlign: "center", padding: 12, background: t.bgAlt, borderRadius: 8 }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: PRIMARY }}>{formations.length}</div>
                                <div style={{ fontSize: "0.7rem", color: t.textMuted }}>Total</div>
                            </div>
                            <div style={{ textAlign: "center", padding: 12, background: t.bgAlt, borderRadius: 8 }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>{formations.filter(f => f.nbr_prevu || 0).reduce((a, b) => a + (b.nbr_prevu || 0), 0)}</div>
                                <div style={{ fontSize: "0.7rem", color: t.textMuted }}>Participants</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedFormation && (
                <Modal title="Détails de la formation" onClose={() => setSelectedFormation(null)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Sujet</div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: t.text }}>{selectedFormation.sujet}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Organisation</div>
                            <Chip label={selectedFormation.organisation?.nom || "—"} color={getColorForOrg(selectedFormation.organisation)} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Date début</div>
                                <div style={{ color: t.text }}>{formatDate(selectedFormation.date_debut)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Date fin</div>
                                <div style={{ color: t.text }}>{formatDate(selectedFormation.date_fin)}</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Lieu</div>
                            <div style={{ color: t.text }}>{selectedFormation.lieu || selectedFormation.salle || "—"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: t.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Participants prévus</div>
                            <div style={{ color: t.text }}>{selectedFormation.nbr_prevu || 0}</div>
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