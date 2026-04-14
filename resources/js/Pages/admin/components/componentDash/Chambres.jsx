import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    createContext,
    useContext,
} from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip);

/* ─────────────────── Dark mode hook ─────────────────── */
function useDarkMode() {
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains("dark"),
    );
    useEffect(() => {
        const obs = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains("dark"));
        });
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => obs.disconnect();
    }, []);
    return dark;
}

const DM = createContext(false);

/* ─────────────────── Theme tokens ─────────────────── */
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
        shadow: dark
            ? "0 1px 4px rgba(0,0,0,0.4)"
            : "0 1px 4px rgba(0,0,0,0.07)",
        shadowLg: dark
            ? "0 24px 60px rgba(0,0,0,0.6)"
            : "0 24px 60px rgba(0,0,0,0.18)",
        toastShadow: dark
            ? "0 8px 24px rgba(0,0,0,0.5)"
            : "0 8px 24px rgba(0,0,0,0.12)",
    };
}

/* ─────────────────── constants ─────────────────── */
const PRIMARY = "#D97706";
const STATUTS = ["Disponible", "Occupée", "Maintenance"];
const TYPES = ["Double"];

const STATUT_CFG = {
    Disponible: {
        color: "#10b981",
        bg: "rgba(16,185,129,0.12)",
        icon: "fa-solid fa-circle-check",
    },
    Occupée: {
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        icon: "fa-solid fa-circle-xmark",
    },
    Maintenance: {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        icon: "fa-solid fa-circle-exclamation",
    },
};

const STATUT_PILLS = {
    Disponible: {
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(16,185,129,0.12)",
        color: "#10b981",
        fontSize: "0.7rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
    },
    Occupée: {
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(239,68,68,0.12)",
        color: "#ef4444",
        fontSize: "0.7rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
    },
    Maintenance: {
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(245,158,11,0.12)",
        color: "#f59e0b",
        fontSize: "0.7rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
    },
    DEFAULT: {
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(156,163,175,0.12)",
        color: "#9ca3af",
        fontSize: "0.7rem",
        fontWeight: 600,
    },
};

/* ─────────────────── Components ─────────────────── */

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

/* ─────────────────── Charts & Graphics ─────────────────── */

function ChambresStatusDoughnut({ stats }) {
    const data = useMemo(
        () => ({
            labels: ["Disponible", "Occupée", "Maintenance"],
            datasets: [
                {
                    data: [stats.disponible, stats.occupee, stats.maintenance],
                    backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
                    borderWidth: 0,
                    hoverOffset: 10,
                },
            ],
        }),
        [stats],
    );

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                tooltip: {
                    backgroundColor: "#111827",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 12,
                },
            },
        }),
        [],
    );

    return <Doughnut data={data} options={options} />;
}

function OperationalGaugeChart({ pct }) {
    const t = useTheme();
    const series = [Math.max(0, Math.min(100, Number(pct) || 0))];
    const options = useMemo(
        () => ({
            chart: { type: "radialBar", sparkline: { enabled: true } },
            plotOptions: {
                radialBar: {
                    startAngle: -135,
                    endAngle: 135,
                    hollow: { size: "64%" },
                    track: {
                        background: t.dark
                            ? "rgba(255,255,255,0.08)"
                            : "#eef2f7",
                    },
                    dataLabels: {
                        name: { show: false },
                        value: {
                            color: t.text,
                            fontSize: "20px",
                            fontWeight: 700,
                            formatter: (v) => `${Math.round(v)}%`,
                        },
                    },
                },
            },
            stroke: { lineCap: "round" },
            colors: [series[0] < 85 ? "#ef4444" : "#10b981"],
        }),
        [t.dark, t.text, series],
    );

    return (
        <ReactApexChart
            type="radialBar"
            options={options}
            series={series}
            height={170}
        />
    );
}

function FloorChargeApexChart({ floorRows }) {
    const t = useTheme();
    const categories = floorRows.map((f) => `Étage ${f.etage}`);
    const totals = floorRows.map((f) => Number(f.total) || 0);
    const occupied = floorRows.map((f) => Number(f.occupees) || 0);
    const maxRooms = totals.length ? Math.max(...totals) : 1;
    const options = useMemo(
        () => ({
            chart: {
                type: "bar",
                toolbar: { show: false },
                animations: { easing: "easeinout", speed: 650 },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    barHeight: "58%",
                },
            },
            grid: {
                borderColor: t.dark ? "rgba(255,255,255,0.08)" : "#eef2f7",
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: false } },
            },
            xaxis: {
                categories,
                min: 0,
                max: maxRooms,
                tickAmount: maxRooms,
                decimalsInFloat: 0,
                labels: {
                    style: { colors: t.textMuted, fontSize: "11px" },
                    formatter: (value) => `${Math.round(value)}`,
                },
            },
            yaxis: {
                labels: { style: { colors: t.textSub, fontSize: "12px" } },
            },
            legend: {
                position: "top",
                horizontalAlign: "left",
                labels: { colors: t.textMuted },
            },
            tooltip: {
                theme: t.dark ? "dark" : "light",
                y: {
                    formatter: (value) => `${Math.round(value)}`,
                },
            },
            colors: ["#D97706", "#ef4444"],
            dataLabels: { enabled: false },
        }),
        [categories, maxRooms, t.dark, t.textMuted, t.textSub],
    );

    const series = [
        { name: "Total", data: totals },
        { name: "Occupées", data: occupied },
    ];

    if (!floorRows.length) {
        return (
            <p style={{ fontSize: "0.8rem", color: t.textFaint, marginTop: 12 }}>
                Aucune donnée
            </p>
        );
    }

    return (
        <ReactApexChart type="bar" options={options} series={series} height={220} />
    );
}

function HealthAlertsApexChart({ stats }) {
    const t = useTheme();
    const availabilityPct =
        stats.total > 0 ? Math.round((stats.disponible / stats.total) * 100) : 0;
    const series = [stats.taux_maintenance, availabilityPct];
    const options = useMemo(
        () => ({
            chart: { type: "radialBar", sparkline: { enabled: true } },
            labels: ["Maintenance %", "Disponibilité %"],
            colors: [
                stats.taux_maintenance > 15 ? "#ef4444" : "#f59e0b",
                stats.disponible < 5 ? "#ef4444" : "#10b981",
            ],
            plotOptions: {
                radialBar: {
                    hollow: { size: "28%" },
                    dataLabels: {
                        name: { color: t.textMuted, fontSize: "11px" },
                        value: {
                            color: t.text,
                            fontSize: "14px",
                            formatter: (v) => `${Math.round(v)}%`,
                        },
                        total: {
                            show: true,
                            label: "Health",
                            color: t.textSub,
                            formatter: () =>
                                stats.taux_maintenance > 15 || stats.disponible < 5
                                    ? "Warning"
                                    : "OK",
                        },
                    },
                    track: {
                        background: t.dark
                            ? "rgba(255,255,255,0.08)"
                            : "#eef2f7",
                    },
                },
            },
            legend: {
                show: true,
                position: "bottom",
                labels: { colors: t.textMuted },
            },
        }),
        [stats, availabilityPct, t.dark, t.text, t.textMuted, t.textSub],
    );

    return (
        <ReactApexChart
            type="radialBar"
            options={options}
            series={series}
            height={230}
        />
    );
}

function Badge({ statut }) {
    const cfg = STATUT_CFG[statut] || STATUT_CFG.Disponible;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 999,
                background: cfg.bg,
                color: cfg.color,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
            }}
        >
            <i className={cfg.icon} style={{ fontSize: 10 }} />
            {statut}
        </span>
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
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                background: t.bg,
                border: `1.5px solid ${c}`,
                borderLeft: `4px solid ${c}`,
                borderRadius: 8,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: t.toastShadow,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem",
                color: t.text,
                minWidth: 260,
                animation: "slideUp 0.3s ease",
            }}
        >
            <i
                className={`fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-info"}`}
                style={{ color: c, fontSize: 16 }}
            />
            <span style={{ flex: 1 }}>{msg}</span>
            <button
                onClick={onClose}
                style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.textFaint,
                    fontSize: 14,
                }}
            >
                <i className="fa-solid fa-xmark" />
            </button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

function Modal({ title, onClose, children, width = 540 }) {
    const t = useTheme();
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: t.dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: t.bg,
                    borderRadius: 14,
                    width: "100%",
                    maxWidth: width,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: t.shadowLg,
                    border: `1px solid ${t.border}`,
                    animation: "modalIn 0.25s ease",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: `1px solid ${t.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: t.text }}>{title}</h3>
                    <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: t.textFaint, fontSize: 15 }}><i className="fa-solid fa-xmark" /></button>
                </div>
                <div style={{ padding: "24px" }}>{children}</div>
            </div>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
    );
}

function CustomSelect({ value, onChange, options, focused, onFocus, onBlur, error }) {
    const t = useTheme();
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                onBlur?.();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onBlur]);

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => { setOpen(!open); onFocus?.(); }}
                style={{
                    width: "100%",
                    display: "flex", alignPadding: "9px 12px",
                    alignItems: "center", justifyContent: "space-between",
                    border: `1px solid ${error ? "#ef4444" : focused ? PRIMARY : t.borderMd}`,
                    borderRadius: 7, padding: "9px 12px", background: t.bgInput, color: t.text,
                    cursor: "pointer", textAlign: "left", fontSize: "0.82rem",
                }}
            >
                <span>{value}</span>
                <i className={`fa-solid fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: 10, color: t.textMuted }} />
            </button>
            {open && (
                <div style={{ position: "absolute", top: "105%", left: 0, right: 0, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, boxShadow: t.shadowLg, zIndex: 50, overflow: "hidden" }}>
                    {options.map(opt => (
                        <div key={opt} onMouseDown={() => { onChange(opt); setOpen(false); }} style={{ padding: "10px 14px", fontSize: "0.82rem", color: opt === value ? PRIMARY : t.text, background: opt === value ? (t.dark ? "rgba(217,119,6,0.15)" : "#fff7ed") : "transparent", cursor: "pointer" }}>{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────── Forms ─────────────────── */

function ChambreForm({ initial = {}, onSubmit, loading }) {
    const t = useTheme();
    const [form, setForm] = useState({
        num_chambre: initial.num_chambre || "",
        type_chambre: initial.type_chambre || "Double",
        statut: initial.statut || "Disponible",
        maintenance_duree: initial.maintenance_duree || "",
        etage: initial.etage || 0,
        equipements: initial.equipements || "",
    });
    const [errors, setErrors] = useState({});
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handle = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const inputBase = { border: `1px solid ${t.borderMd}`, borderRadius: 7, padding: "9px 12px", fontSize: "0.85rem", background: t.bgInput, color: t.text, width: "100%", outline: "none" };

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.textSub }}>N° Chambre</label>
                    <input style={inputBase} value={form.num_chambre} onChange={e => set("num_chambre", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.textSub }}>Étage</label>
                    <input type="number" style={inputBase} value={form.etage} onChange={e => set("etage", e.target.value)} />
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.textSub }}>Type</label>
                    <CustomSelect value={form.type_chambre} options={TYPES} onChange={v => set("type_chambre", v)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.textSub }}>Statut</label>
                    <CustomSelect value={form.statut} options={STATUTS} onChange={v => set("statut", v)} />
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.textSub }}>Équipements</label>
                <textarea style={{ ...inputBase, minHeight: 80 }} value={form.equipements} onChange={e => set("equipements", e.target.value)} />
            </div>
            <button type="submit" disabled={loading} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
                {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
        </form>
    );
}

function DeleteConfirm({ chambre, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer" onClose={onClose} width={400}>
            <p style={{ textAlign: "center", color: t.textSub }}>Voulez-vous supprimer la chambre <strong>{chambre.num_chambre}</strong>?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                <button onClick={onClose} style={{ border: `1px solid ${t.borderMd}`, background: "transparent", padding: "8px 20px", borderRadius: 8, color: t.textSub }}>Annuler</button>
                <button onClick={onConfirm} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8 }}>Supprimer</button>
            </div>
        </Modal>
    );
}

/* ─────────────────── Main component ─────────────────── */

function ChambresInner() {
    const t = useTheme();
    const [chambres, setChambres] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("liste");
    const [search, setSearch] = useState("");
    const [filterStatut, setFilter] = useState("Tous");
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [sortKey, setSortKey] = useState("num_chambre");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [r1, r2] = await Promise.all([
                axios.get("/api/chambres", { headers }),
                axios.get("/api/chambres/statistics", { headers }),
            ]);
            setChambres(r1.data);
            setStats(r2.data);
        } catch {
            setToast({ msg: "Erreur de chargement", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleAdd = async (form) => {
        try {
            await axios.post("/api/chambres", form, { headers });
            setToast({ msg: "Chambre ajoutée" });
            setModal(null); fetchAll();
        } catch {
            setToast({ msg: "Erreur", type: "error" });
        }
    };

    const handleEdit = async (form) => {
        try {
            await axios.put(`/api/chambres/${modal.edit.id_chambre}`, form, { headers });
            setToast({ msg: "Chambre modifiée" });
            setModal(null); fetchAll();
        } catch {
            setToast({ msg: "Erreur", type: "error" });
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/chambres/${modal.del.id_chambre}`, { headers });
            setToast({ msg: "Chambre supprimée" });
            setModal(null); fetchAll();
        } catch {
            setToast({ msg: "Erreur", type: "error" });
        }
    };

    const filtered = useMemo(() => {
        return chambres.filter(c => {
            const q = search.toLowerCase();
            const matchSearch = !q || c.num_chambre?.toLowerCase().includes(q) || c.type_chambre?.toLowerCase().includes(q);
            const matchStatut = filterStatut === "Tous" || c.statut === filterStatut;
            return matchSearch && matchStatut;
        }).sort((a,b) => {
            let va = a[sortKey], vb = b[sortKey];
            if (sortKey === "etage") { va = Number(va); vb = Number(vb); }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [chambres, search, filterStatut, sortKey, sortDir]);

    useEffect(() => { setPage(1); }, [search, filterStatut, sortKey, sortDir]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const maintenanceRooms = chambres.filter(c => c.statut === "Maintenance").map(c => {
        const upAt = c.updated_at ? new Date(c.updated_at) : new Date();
        const diff = Math.floor((Date.now() - upAt.getTime()) / (1000*60*60*24));
        return { ...c, daysInMaintenance: diff || 1 };
    }).sort((a,b) => b.daysInMaintenance - a.daysInMaintenance);

    const toggleSort = (k) => {
        if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(k); setSortDir("asc"); }
    };

    const cardStyle = { background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: "hidden" };
    const thBase = { padding: "12px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", background: t.bgAlt, borderBottom: `1px solid ${t.border}` };
    const tdBase = { padding: "12px 16px", fontSize: "0.82rem", color: t.text, borderBottom: `1px solid ${t.borderSm}` };
    const btnAction = (c) => ({ border: "solid 1px ", background: "transparent", color: c, cursor: "pointer", fontSize: 13, borderRadius: "5px", padding: 5, marginRight: 5});

    return (
        <DM.Provider value={useDarkMode()}>
            <div style={{ padding: "28px 24px", minHeight: "100%", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${t.border}`, gap: 12, flexWrap: "wrap" }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="fa-solid fa-bed" style={{ color: PRIMARY }} /> Chambres
                    </h1>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                        <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Chambres</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

                {/* Content */}
                {activeTab === "stats" ? (
                    stats && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {/* KPI Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                                <StatCard icon="fa-solid fa-hotel" label="Total Chambres" value={stats.total} color={PRIMARY} />
                                <StatCard icon="fa-solid fa-circle-check" label="Disponibles" value={stats.disponible} color="#10b981" sub={`${Math.round((stats.disponible/stats.total)*100)}% du parc`} />
                                <StatCard icon="fa-solid fa-circle-xmark" label="Occupées" value={stats.occupee} color="#ef4444" sub={`${Math.round((stats.occupee/stats.total)*100)}% d'occupation`} />
                                <StatCard icon="fa-solid fa-toolbox" label="Maintenance" value={stats.maintenance} color="#f59e0b" sub={`${stats.taux_maintenance}% du parc`} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                            <div style={{ ...cardStyle, padding: 20 }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.textMuted, marginBottom: 15, textTransform: "uppercase" }}>Répartition</div>
                                <div style={{ height: 200, position: "relative" }}>
                                    <ChambresStatusDoughnut stats={stats} />
                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: t.text }}>{stats.total}</div>
                                        <div style={{ fontSize: "0.65rem", color: t.textFaint }}>TOTAL</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ ...cardStyle, padding: 20 }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.textMuted, marginBottom: 15, textTransform: "uppercase" }}>Jauge opérationnelle</div>
                                <OperationalGaugeChart pct={Math.round(((stats.total - stats.maintenance) / stats.total) * 100)} />
                                <div style={{ textAlign: "center", fontSize: "0.72rem", color: t.textFaint, marginTop: 10 }}>Total: {stats.total} | Service: {stats.total - stats.maintenance}</div>
                            </div>
                            <div style={{ ...cardStyle, padding: 20 }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.textMuted, marginBottom: 15, textTransform: "uppercase" }}>Charge par étage</div>
                                <FloorChargeApexChart floorRows={stats.by_floor || []} />
                            </div>
                            <div style={{ ...cardStyle, padding: 20 }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.textMuted, marginBottom: 15, textTransform: "uppercase" }}>Health Alerts</div>
                                <HealthAlertsApexChart stats={stats} />
                            </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Main Table */}
                        <div style={cardStyle}>
                            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: t.bgAlt }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.bgInput, border: `1px solid ${t.borderMd}`, borderRadius: 8, padding: "4px 10px", width: 240 }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: t.textFaint }} />
                                    <input placeholder="Rechercher..." style={{ border: "none", background: "transparent", outline: "none", color: t.text, fontSize: "0.82rem", flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div style={{ width: 150 }}>
                                    <CustomSelect value={filterStatut} options={["Tous", ...STATUTS]} onChange={setFilter} />
                                </div>
                                <div style={{ fontSize: "0.75rem", color: t.textFaint }}>{filtered.length} résultats</div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {[{l:"N° Chambre", k:"num_chambre"}, {l:"Type", k:"type_chambre"}, {l:"Étage", k:"etage"}, {l:"Statut", k:"statut"}, {l:"Equipements", k:null}].map(c => (
                                                <th key={c.l} style={thBase} onClick={() => c.k && toggleSort(c.k)}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {c.l} {c.k === sortKey && <i className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"}`} style={{ color: PRIMARY }} />}
                                                    </div>
                                                </th>
                                            ))}
                                            <th style={{ ...thBase, textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={6} style={{ padding: 40, textAlign: "center" }}><i className="fa-solid fa-spinner fa-spin" /></td></tr>
                                        ) : paginated.map((c, i) => (
                                            <tr key={c.id_chambre} style={{ background: i % 2 === 0 ? t.bg : t.bgAlt2 }}>
                                                <td style={{ ...tdBase, fontWeight: 700 }}>{c.num_chambre}</td>
                                                <td style={tdBase}>{c.type_chambre}</td>
                                                <td style={tdBase}>Étage {c.etage}</td>
                                                <td style={tdBase}><Badge statut={c.statut} /></td>
                                                <td style={{ ...tdBase, color: t.textMuted, fontSize: "0.75rem" }}>{c.equipements || "—"}</td>
                                                <td style={{ ...tdBase, textAlign: "right" }}>
                                                    <button onClick={() => setModal({edit: c})} style={btnAction(PRIMARY)}><i className="fa-solid fa-pen" /></button>
                                                    <button onClick={() => setModal({del: c})} style={btnAction("#ef4444")}><i className="fa-solid fa-trash" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination Controls */}
                            {!loading && filtered.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${t.borderSm}`, background: t.bgAlt }}>
                                    <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                                        Affichage de {(page - 1) * itemsPerPage + 1} à {Math.min(page * itemsPerPage, filtered.length)} sur {filtered.length} résultats
                                    </span>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === 1 ? "transparent" : t.bgInput, color: page === 1 ? t.textFaint : t.text, cursor: page === 1 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-left" /></button>
                                        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${t.borderMd}`, background: page === totalPages || totalPages === 0 ? "transparent" : t.bgInput, color: page === totalPages || totalPages === 0 ? t.textFaint : t.text, cursor: page === totalPages || totalPages === 0 ? "default" : "pointer" }}><i className="fa-solid fa-chevron-right" /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Maintenance Table */}
                        <div style={cardStyle}>
                            <div style={{ padding: "12px 20px", background: t.bgAlt, borderBottom: `1px solid ${t.border}`, fontSize: "0.75rem", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" }}>
                                <i className="fa-solid fa-toolbox" style={{ marginRight: 8, color: PRIMARY }} /> Maintenance
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {["N° Chambre", "Type", "Durée"].map(h => <th key={h} style={thBase}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenanceRooms.length === 0 ? (
                                            <tr><td colSpan={3} style={{ padding: 20, textAlign: "center", color: t.textFaint }}>Aucune chambre en maintenance</td></tr>
                                        ) : maintenanceRooms.map((c, i) => (
                                            <tr key={c.id_chambre} style={{ background: i % 2 === 0 ? t.bg : t.bgAlt2 }}>
                                                <td style={{ ...tdBase, fontWeight: 700 }}>{c.num_chambre}</td>
                                                <td style={tdBase}>{c.type_chambre}</td>
                                                <td style={{ ...tdBase, color: c.daysInMaintenance >= 3 ? "#ef4444" : t.textSub, fontWeight: 600 }}>{c.daysInMaintenance} jours</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals & Toast */}
                {modal === "add" && <Modal title="Ajouter" onClose={() => setModal(null)}><ChambreForm onSubmit={handleAdd} /></Modal>}
                {modal?.edit && <Modal title="Modifier" onClose={() => setModal(null)}><ChambreForm initial={modal.edit} onSubmit={handleEdit} /></Modal>}
                {modal?.del && <DeleteConfirm chambre={modal.del} onConfirm={handleDelete} onClose={() => setModal(null)} />}
                {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            </div>
        </DM.Provider>
    );
}

export default ChambresInner;
