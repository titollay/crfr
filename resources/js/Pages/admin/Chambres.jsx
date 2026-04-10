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

/* ─────────────────── Chart.js : statut (doughnut) ─────────────────── */
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

/* ─────────────────── Badge ─────────────────── */
function Badge({ statut }) {
    const cfg = STATUT_CFG[statut] || {};
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

/* ─────────────────── Toast ─────────────────── */
function Toast({ msg, type, onClose }) {
    const t = useTheme();
    useEffect(() => {
        const id = setTimeout(onClose, 3500);
        return () => clearTimeout(id);
    }, [onClose]);
    const colors = { success: "#10b981", error: "#ef4444", info: PRIMARY };
    const c = colors[type];
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
                transition: "background 0.3s",
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

/* ─────────────────── Modal wrapper ─────────────────── */
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
                    transition: "background 0.3s, border-color 0.3s",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: `1px solid ${t.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: t.text,
                        }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: t.textFaint,
                            fontSize: 15,
                            transition: "all 0.2s",
                        }}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
                <div style={{ padding: "24px" }}>{children}</div>
            </div>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
    );
}

/* ─────────────────── Form field ─────────────────── */
function Field({ label, required, children }) {
    const t = useTheme();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
                style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: t.textSub,
                    letterSpacing: "0.04em",
                }}
            >
                {label}
                {required && <span style={{ color: PRIMARY }}> *</span>}
            </label>
            {children}
        </div>
    );
}

/* ─────────────────── Custom Select (dark-mode safe) ─────────────────── */
function CustomSelect({
    value,
    onChange,
    options,
    focused,
    onFocus,
    onBlur,
    error,
}) {
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

    const borderColor = error ? "#ef4444" : focused ? PRIMARY : t.borderMd;
    const shadow =
        focused && !error ? `0 0 0 3px rgba(217,119,6,0.15)` : "none";

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => {
                    setOpen((o) => !o);
                    onFocus?.();
                }}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 7,
                    padding: "9px 12px",
                    fontSize: "0.85rem",
                    fontFamily: "'DM Sans', sans-serif",
                    background: t.bgInput,
                    color: t.text,
                    cursor: "pointer",
                    boxShadow: shadow,
                    transition:
                        "border-color 0.2s, box-shadow 0.2s, background 0.3s",
                    textAlign: "left",
                }}
            >
                <span>{value}</span>
                <i
                    className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
                    style={{
                        fontSize: 10,
                        color: t.textMuted,
                        marginLeft: 8,
                        flexShrink: 0,
                    }}
                />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        borderRadius: 8,
                        boxShadow: t.dark
                            ? "0 8px 24px rgba(0,0,0,0.6)"
                            : "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 500,
                        overflow: "hidden",
                        maxHeight: 220,
                        overflowY: "auto",
                    }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt}
                            onMouseDown={() => {
                                onChange(opt);
                                setOpen(false);
                                onBlur?.();
                            }}
                            style={{
                                padding: "9px 14px",
                                fontSize: "0.84rem",
                                color: opt === value ? PRIMARY : t.text,
                                background:
                                    opt === value
                                        ? t.dark
                                            ? "rgba(217,119,6,0.15)"
                                            : "rgba(217,119,6,0.08)"
                                        : "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontWeight: opt === value ? 600 : 400,
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                if (opt !== value)
                                    e.currentTarget.style.background = t.dark
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.04)";
                            }}
                            onMouseLeave={(e) => {
                                if (opt !== value)
                                    e.currentTarget.style.background =
                                        "transparent";
                            }}
                        >
                            {opt}
                            {opt === value && (
                                <i
                                    className="fa-solid fa-check"
                                    style={{ fontSize: 11, color: PRIMARY }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────── Chambre Form ─────────────────── */
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
    const [focus, setFocus] = useState(null);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.num_chambre.trim()) e.num_chambre = "Numéro requis";
        if (!form.type_chambre.trim()) e.type_chambre = "Type requis";
        if (!form.statut) e.statut = "Statut requis";
        if (
            form.statut === "Maintenance" &&
            !String(form.maintenance_duree).trim()
        ) {
            e.maintenance_duree = "Durée de maintenance requise";
        }
        if (form.etage < 0) e.etage = "Étage invalide";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const inputBase = {
        border: "1px solid",
        borderRadius: 7,
        padding: "9px 12px",
        fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
        color: t.text,
        background: t.bgInput,
    };

    const fldStyle = (k) => ({
        ...inputBase,
        borderColor: errors[k] ? "#ef4444" : focus === k ? PRIMARY : t.borderMd,
        boxShadow:
            focus === k && !errors[k]
                ? `0 0 0 3px rgba(217,119,6,0.15)`
                : "none",
    });

    return (
        <form
            onSubmit={handle}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                }}
            >
                <Field label="N° Chambre" required>
                    <input
                        style={fldStyle("num_chambre")}
                        value={form.num_chambre}
                        onChange={(e) => set("num_chambre", e.target.value)}
                        onFocus={() => setFocus("num_chambre")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex: 101"
                    />
                    {errors.num_chambre && (
                        <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>
                            {errors.num_chambre}
                        </span>
                    )}
                </Field>

                <Field label="Étage" required>
                    <input
                        type="number"
                        min={0}
                        max={99}
                        style={fldStyle("etage")}
                        value={form.etage}
                        onChange={(e) =>
                            set("etage", parseInt(e.target.value) || 0)
                        }
                        onFocus={() => setFocus("etage")}
                        onBlur={() => setFocus(null)}
                    />
                    {errors.etage && (
                        <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>
                            {errors.etage}
                        </span>
                    )}
                </Field>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                }}
            >
                <Field label="Type de chambre" required>
                    <CustomSelect
                        value={form.type_chambre}
                        onChange={(v) => set("type_chambre", v)}
                        options={TYPES}
                        focused={focus === "type_chambre"}
                        onFocus={() => setFocus("type_chambre")}
                        onBlur={() => setFocus(null)}
                        error={errors.type_chambre}
                    />
                </Field>

                <Field label="Statut" required>
                    <CustomSelect
                        value={form.statut}
                        onChange={(v) => set("statut", v)}
                        options={STATUTS}
                        focused={focus === "statut"}
                        onFocus={() => setFocus("statut")}
                        onBlur={() => setFocus(null)}
                        error={errors.statut}
                    />
                </Field>
            </div>

            {form.statut === "Maintenance" && (
                <Field label="Durée de maintenance (jours)" required>
                    <input
                        type="number"
                        min={1}
                        max={365}
                        style={fldStyle("maintenance_duree")}
                        value={form.maintenance_duree}
                        onChange={(e) =>
                            set(
                                "maintenance_duree",
                                parseInt(e.target.value) || "",
                            )
                        }
                        onFocus={() => setFocus("maintenance_duree")}
                        onBlur={() => setFocus(null)}
                        placeholder="Ex: 7"
                    />
                    {errors.maintenance_duree && (
                        <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>
                            {errors.maintenance_duree}
                        </span>
                    )}
                </Field>
            )}

            <Field label="Équipements">
                <textarea
                    style={{
                        ...fldStyle("equipements"),
                        resize: "vertical",
                        minHeight: 80,
                    }}
                    value={form.equipements}
                    onChange={(e) => set("equipements", e.target.value)}
                    onFocus={() => setFocus("equipements")}
                    onBlur={() => setFocus(null)}
                    placeholder="WiFi, Climatisation, Télévision, Minibar…"
                />
            </Field>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 6,
                }}
            >
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: loading
                            ? t.dark
                                ? "#4b5563"
                                : "#d1d5db"
                            : PRIMARY,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 28px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s",
                    }}
                >
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    {loading ? "Enregistrement…" : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}

/* ─────────────────── Delete Confirm ─────────────────── */
function DeleteConfirm({ chambre, onConfirm, onClose, loading }) {
    const t = useTheme();
    return (
        <Modal title="Supprimer la chambre" onClose={onClose} width={420}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    <i
                        className="fa-solid fa-triangle-exclamation"
                        style={{ color: "#ef4444", fontSize: 22 }}
                    />
                </div>
                <p
                    style={{
                        fontSize: "0.9rem",
                        color: t.textSub,
                        marginBottom: 8,
                    }}
                >
                    Voulez-vous vraiment supprimer la chambre{" "}
                    <strong style={{ color: t.text }}>
                        N° {chambre.num_chambre}
                    </strong>{" "}
                    ?
                </p>
                <p style={{ fontSize: "0.78rem", color: t.textFaint }}>
                    Cette action est irréversible.
                </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                    onClick={onClose}
                    style={{
                        border: `1px solid ${t.borderMd}`,
                        background: t.bgInput,
                        borderRadius: 8,
                        padding: "9px 24px",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: t.textSub,
                        transition: "all 0.2s",
                    }}
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        background: loading ? "#fca5a5" : "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "9px 24px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    Supprimer
                </button>
            </div>
        </Modal>
    );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
function ChambresInner() {
    const t = useTheme();

    const [chambres, setChambres] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [filterStatut, setFilter] = useState("Tous");
    const [filterType, setFilterT] = useState("Tous");
    const [sortKey, setSortKey] = useState("num_chambre");
    const [sortDir, setSortDir] = useState("asc");
    const [isMobileTable, setIsMobileTable] = useState(
        () => typeof window !== "undefined" && window.innerWidth < 860,
    );

    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const showToast = useCallback(
        (msg, type = "success") => setToast({ msg, type }),
        [],
    );

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
            showToast("Erreur de chargement des chambres", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        const onResize = () => setIsMobileTable(window.innerWidth < 860);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    /* ── CRUD ── */
    const handleAdd = async (form) => {
        setSaving(true);
        try {
            await axios.post("/api/chambres", form, { headers });
            showToast("Chambre ajoutée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            showToast(
                err.response?.data?.message || "Erreur lors de l'ajout",
                "error",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (form) => {
        setSaving(true);
        try {
            await axios.put(`/api/chambres/${modal.edit.id_chambre}`, form, {
                headers,
            });
            showToast("Chambre modifiée avec succès");
            setModal(null);
            fetchAll();
        } catch (err) {
            showToast(
                err.response?.data?.message || "Erreur lors de la modification",
                "error",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/chambres/${modal.del.id_chambre}`, {
                headers,
            });
            showToast("Chambre supprimée");
            setModal(null);
            fetchAll();
        } catch {
            showToast("Erreur lors de la suppression", "error");
        } finally {
            setDeleting(false);
        }
    };

    /* ── Filter + Sort ── */
    const filtered = chambres
        .filter((c) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                c.num_chambre?.toLowerCase().includes(q) ||
                c.type_chambre?.toLowerCase().includes(q) ||
                c.equipements?.toLowerCase().includes(q);
            const matchStatut =
                filterStatut === "Tous" || c.statut === filterStatut;
            const matchType =
                filterType === "Tous" || c.type_chambre === filterType;
            return matchSearch && matchStatut && matchType;
        })
        .sort((a, b) => {
            let va = a[sortKey],
                vb = b[sortKey];
            if (sortKey === "etage") {
                va = Number(va);
                vb = Number(vb);
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ k }) => {
        if (sortKey !== k)
            return (
                <i
                    className="fa-solid fa-sort"
                    style={{ opacity: 0.25, fontSize: 10 }}
                />
            );
        return (
            <i
                className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"}`}
                style={{ color: PRIMARY, fontSize: 10 }}
            />
        );
    };

    const typesList = ["Tous", ...new Set(chambres.map((c) => c.type_chambre))];
    const maintenanceRooms = chambres
        .filter((c) => c.statut === "Maintenance")
        .map((c) => {
            const updatedAt = c.updated_at ? new Date(c.updated_at) : null;
            const explicitDuration = Number(c.maintenance_duree);
            const daysInMaintenance =
                Number.isFinite(explicitDuration) && explicitDuration > 0
                    ? explicitDuration
                    : updatedAt && !Number.isNaN(updatedAt.getTime())
                      ? Math.max(
                            1,
                            Math.floor(
                                (Date.now() - updatedAt.getTime()) /
                                    (1000 * 60 * 60 * 24),
                            ),
                        )
                      : null;
            return { ...c, daysInMaintenance };
        })
        .sort(
            (a, b) => (b.daysInMaintenance ?? 0) - (a.daysInMaintenance ?? 0),
        );

    /* shared styles */
    const cardStyle = {
        background: t.bg,
        borderRadius: 12,
        boxShadow: t.shadow,
        border: `1px solid ${t.border}`,
        transition: "background 0.3s, border-color 0.3s",
    };

    const thBase = {
        padding: "11px 14px",
        textAlign: "left",
        fontSize: "0.68rem",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 700,
        color: t.textMuted,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        background: t.dark ? "rgba(255,255,255,0.035)" : "#f7f8fb",
        borderBottom: `1px solid ${t.border}`,
        transition: "background 0.3s",
    };
    const tdBase = {
        padding: "11px 14px",
        fontSize: "0.82rem",
        borderBottom: `1px solid ${t.borderSm}`,
        verticalAlign: "middle",
    };
    const rowEvenBg = t.bg;
    const rowOddBg = t.dark ? "rgba(255,255,255,0.02)" : "#fcfcfd";

    const selectStyle = {
        border: `1px solid ${t.borderMd}`,
        borderRadius: 7,
        padding: "8px 12px",
        fontSize: "0.82rem",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        background: t.bgInput,
        color: t.text,
        cursor: "pointer",
        transition: "background 0.3s, border-color 0.3s, color 0.3s",
    };
    const operationalRooms = stats ? stats.total - stats.maintenance : 0;
    const operationalPct =
        stats && stats.total > 0
            ? Math.round((operationalRooms / stats.total) * 100)
            : 0;
    const floorRows = stats?.by_floor || [];
    const alerts = stats
        ? [
              stats.taux_maintenance > 15
                  ? {
                        level: "warning",
                        text: `Maintenance élevée (${stats.taux_maintenance}%).`,
                    }
                  : null,
              stats.disponible < 5
                  ? {
                        level: "danger",
                        text: `Disponibilité critique (${stats.disponible} chambres).`,
                    }
                  : null,
          ].filter(Boolean)
        : [];

    return (
        <div
            style={{
                padding: "28px 24px",
                fontFamily: "'DM Sans', sans-serif",
                minHeight: "100%",
                background: t.bgPage,
                transition: "background 0.3s",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ── Page header ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div style={{ minWidth: 220 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.2rem",
                            fontWeight: 800,
                            color: t.text,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <i
                            className="fa-solid fa-bed"
                            style={{ color: PRIMARY }}
                        />
                        Gestion des Chambres
                    </h1>
                </div>
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 14px",
                            borderRadius: 999,
                            border: `1px solid ${t.border}`,
                            background: t.dark
                                ? "rgba(255,255,255,0.03)"
                                : "#fff",
                        }}
                    >
                        <Link to="/index">Dashboard</Link>

                        <i
                            className="fa-solid fa-chevron-right"
                            style={{ fontSize: 10, color: t.textFaint }}
                        />
                        <span
                            style={{
                                fontSize: "0.82rem",
                                color: t.text,
                                fontWeight: 700,
                            }}
                        >
                            Chambres
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setModal("add")}
                    style={{
                        background: PRIMARY,
                        color: "#fff",
                        border: "none",
                        borderRadius: 9,
                        padding: "10px 22px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        letterSpacing: "0.05em",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-1px)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                    }
                >
                    <i className="fa-solid fa-plus" />
                    Ajouter une chambre
                </button>
            </div>

            {/* ── Statistics (répartition statuts) ── */}
            {stats && (
                <div style={{ marginBottom: 24, order: 2 }}>
                    <div
                        style={{
                            ...cardStyle,
                            marginTop: 14,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${t.border}`,
                                fontSize: "0.72rem",
                                color: t.textMuted,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                background: t.dark
                                    ? "rgba(255,255,255,0.02)"
                                    : "#fafbff",
                            }}
                        >
                            Chambres en maintenance (actionable)
                        </div>
                        <div
                            style={{
                                overflowX: "auto",
                                display: isMobileTable ? "none" : "block",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            "N° Chambre",
                                            "Type",
                                            "Étage",
                                            "Durée maintenance",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    ...thBase,
                                                    cursor: "default",
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintenanceRooms.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                style={{
                                                    padding: "14px",
                                                    textAlign: "center",
                                                    color: t.textFaint,
                                                    fontSize: "0.82rem",
                                                }}
                                            >
                                                Aucune chambre en maintenance.
                                            </td>
                                        </tr>
                                    ) : (
                                        maintenanceRooms
                                            .slice(0, 8)
                                            .map((c, i) => (
                                                <tr
                                                    key={`m-${c.id_chambre}`}
                                                    style={{
                                                        background:
                                                            i % 2 === 0
                                                                ? rowEvenBg
                                                                : rowOddBg,
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            ...tdBase,
                                                            color: t.text,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {c.num_chambre}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdBase,
                                                            color: t.textSub,
                                                        }}
                                                    >
                                                        {c.type_chambre}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdBase,
                                                            color: t.textSub,
                                                        }}
                                                    >
                                                        Étage {c.etage}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdBase,
                                                            color:
                                                                c.daysInMaintenance &&
                                                                c.daysInMaintenance >=
                                                                    7
                                                                    ? "#ef4444"
                                                                    : t.textSub,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {c.daysInMaintenance
                                                            ? `${c.daysInMaintenance} jour${c.daysInMaintenance > 1 ? "s" : ""}`
                                                            : "N/A"}
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div
                            style={{
                                display: isMobileTable ? "grid" : "none",
                                gap: 10,
                                padding: 12,
                            }}
                        >
                            {maintenanceRooms.length === 0 ? (
                                <div
                                    style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        color: t.textFaint,
                                        fontSize: "0.82rem",
                                        border: `1px dashed ${t.borderMd}`,
                                        borderRadius: 10,
                                    }}
                                >
                                    Aucune chambre en maintenance.
                                </div>
                            ) : (
                                maintenanceRooms.slice(0, 8).map((c) => (
                                    <div
                                        key={`m-card-${c.id_chambre}`}
                                        style={{
                                            border: `1px solid ${t.border}`,
                                            borderRadius: 10,
                                            padding: "12px",
                                            background: t.dark
                                                ? "rgba(255,255,255,0.02)"
                                                : "#fff",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <strong style={{ color: t.text }}>
                                                #{c.num_chambre}
                                            </strong>
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color:
                                                        c.daysInMaintenance &&
                                                        c.daysInMaintenance >= 7
                                                            ? "#ef4444"
                                                            : t.textSub,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {c.daysInMaintenance
                                                    ? `${c.daysInMaintenance} j`
                                                    : "N/A"}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.78rem",
                                                color: t.textSub,
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <span>{c.type_chambre}</span>
                                            <span>Étage {c.etage}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                            gap: 14,
                            marginTop: 14,
                        }}
                    >
                        <div
                            style={{
                                ...cardStyle,
                                padding: "18px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: t.textMuted,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                Répartition
                            </span>
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    height: 200,
                                }}
                            >
                                <ChambresStatusDoughnut stats={stats} />
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "1.2rem",
                                            fontWeight: 800,
                                            color: t.text,
                                        }}
                                    >
                                        {stats.total}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.6rem",
                                            color: t.textFaint,
                                        }}
                                    >
                                        total
                                    </span>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 5,
                                    width: "100%",
                                }}
                            >
                                {[
                                    {
                                        label: "Disponible",
                                        color: "#10b981",
                                        pct: stats.taux_disponible,
                                    },
                                    {
                                        label: "Occupée",
                                        color: "#ef4444",
                                        pct: stats.taux_occupation,
                                    },
                                    {
                                        label: "Maintenance",
                                        color: "#f59e0b",
                                        pct: stats.taux_maintenance,
                                    },
                                ].map((s) => (
                                    <div
                                        key={s.label}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
                                            fontSize: "0.72rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 2,
                                                background: s.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <span
                                            style={{
                                                flex: 1,
                                                color: t.textSub,
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color: s.color,
                                            }}
                                        >
                                            {s.pct}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ ...cardStyle, padding: "18px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 10,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.72rem",
                                        color: t.textMuted,
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    Jauge opérationnelle
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        color:
                                            operationalPct < 85
                                                ? "#ef4444"
                                                : "#10b981",
                                    }}
                                >
                                    {operationalPct}%
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: "1.6rem",
                                    fontWeight: 800,
                                    color: t.text,
                                    lineHeight: 1,
                                }}
                            >
                                {operationalRooms}
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        color: t.textFaint,
                                        marginLeft: 8,
                                    }}
                                >
                                    chambres opérationnelles
                                </span>
                            </div>
                            <div style={{ marginTop: 6 }}>
                                <OperationalGaugeChart pct={operationalPct} />
                            </div>
                            <p
                                style={{
                                    margin: "10px 0 0",
                                    fontSize: "0.74rem",
                                    color: t.textFaint,
                                }}
                            >
                                Operational Rooms = total - maintenance
                            </p>
                        </div>

                        <div style={{ ...cardStyle, padding: "18px" }}>
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: t.textMuted,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                Charge par étage (total / occupées)
                            </span>
                            <div style={{ marginTop: 10 }}>
                                <FloorChargeApexChart floorRows={floorRows} />
                            </div>
                        </div>

                        <div style={{ ...cardStyle, padding: "18px" }}>
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: t.textMuted,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                Health alerts
                            </span>
                            <div style={{ marginTop: 6 }}>
                                <HealthAlertsApexChart stats={stats} />
                            </div>
                            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                {alerts.length === 0 ? (
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "#10b981",
                                            background: t.dark
                                                ? "rgba(16,185,129,0.14)"
                                                : "rgba(16,185,129,0.1)",
                                            border: "1px solid rgba(16,185,129,0.35)",
                                            borderRadius: 8,
                                            padding: "8px 10px",
                                        }}
                                    >
                                        Aucun signal critique.
                                    </div>
                                ) : (
                                    alerts.map((a, idx) => (
                                        <div
                                            key={`${a.text}-${idx}`}
                                            style={{
                                                fontSize: "0.8rem",
                                                color:
                                                    a.level === "danger"
                                                        ? "#ef4444"
                                                        : "#f59e0b",
                                                background:
                                                    a.level === "danger"
                                                        ? t.dark
                                                            ? "rgba(239,68,68,0.15)"
                                                            : "rgba(239,68,68,0.1)"
                                                        : t.dark
                                                          ? "rgba(245,158,11,0.16)"
                                                          : "rgba(245,158,11,0.12)",
                                                border: `1px solid ${a.level === "danger" ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.35)"}`,
                                                borderRadius: 8,
                                                padding: "8px 10px",
                                            }}
                                        >
                                            <i
                                                className={`fa-solid ${a.level === "danger" ? "fa-triangle-exclamation" : "fa-circle-exclamation"}`}
                                                style={{ marginRight: 8 }}
                                            />
                                            {a.text}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Table section ── */}
            <div style={{ ...cardStyle, overflow: "hidden", order: 1 }}>
                {/* Toolbar */}
                <div
                    style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${t.border}`,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        background: t.dark
                            ? "rgba(255,255,255,0.02)"
                            : "#fafbff",
                    }}
                >
                    {/* Search */}
                    <div
                        style={{
                            flex: 1,
                            minWidth: 200,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: `1px solid ${t.borderMd}`,
                            borderRadius: 8,
                            padding: "8px 12px",
                            background: t.bgInput,
                            transition: "background 0.3s, border-color 0.3s",
                        }}
                    >
                        <i
                            className="fa-solid fa-magnifying-glass"
                            style={{ color: t.textFaint, fontSize: 12 }}
                        />
                        <input
                            style={{
                                border: "none",
                                outline: "none",
                                fontSize: "0.82rem",
                                flex: 1,
                                fontFamily: "'DM Sans', sans-serif",
                                color: t.text,
                                background: "transparent",
                            }}
                            placeholder="Rechercher une chambre…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: t.textFaint,
                                    fontSize: 12,
                                }}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        )}
                    </div>

                    <div style={{ minWidth: 140 }}>
                        <CustomSelect
                            value={filterStatut}
                            onChange={setFilter}
                            options={["Tous", ...STATUTS]}
                        />
                    </div>

                    <div style={{ minWidth: 160 }}>
                        <CustomSelect
                            value={filterType}
                            onChange={setFilterT}
                            options={typesList}
                        />
                    </div>

                    <span
                        style={{
                            fontSize: "0.75rem",
                            color: t.textFaint,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {filtered.length} résultat
                        {filtered.length > 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div
                    style={{
                        overflowX: "auto",
                        display: isMobileTable ? "none" : "block",
                    }}
                >
                    <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                        <thead>
                            <tr>
                                {[
                                    { label: "N° Chambre", key: "num_chambre" },
                                    { label: "Type", key: "type_chambre" },
                                    { label: "Étage", key: "etage" },
                                    { label: "Statut", key: "statut" },
                                    { label: "Équipements", key: null },
                                ].map((col) => (
                                    <th
                                        key={col.label}
                                        style={thBase}
                                        onClick={() =>
                                            col.key && toggleSort(col.key)
                                        }
                                    >
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            {col.label}
                                            {col.key && (
                                                <SortIcon k={col.key} />
                                            )}
                                        </span>
                                    </th>
                                ))}
                                <th style={{ ...thBase, textAlign: "right" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: "40px",
                                            textAlign: "center",
                                            color: t.textFaint,
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-spinner fa-spin"
                                            style={{
                                                fontSize: 22,
                                                color: PRIMARY,
                                            }}
                                        />
                                        <p
                                            style={{
                                                marginTop: 10,
                                                fontSize: "0.82rem",
                                            }}
                                        >
                                            Chargement des chambres…
                                        </p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: "40px",
                                            textAlign: "center",
                                            color: t.textFaint,
                                        }}
                                    >
                                        <i
                                            className="fa-regular fa-folder-open"
                                            style={{
                                                fontSize: 28,
                                                marginBottom: 10,
                                                display: "block",
                                                opacity: 0.4,
                                            }}
                                        />
                                        <p
                                            style={{
                                                fontSize: "0.82rem",
                                                margin: 0,
                                            }}
                                        >
                                            Aucune chambre trouvée
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c, i) => {
                                    const isEven = i % 2 === 0;
                                    return (
                                        <tr
                                            key={c.id_chambre}
                                            style={{
                                                borderBottom: `1px solid ${t.borderSm}`,
                                                background: isEven
                                                    ? rowEvenBg
                                                    : rowOddBg,
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    t.bgHover)
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    isEven ? t.bg : t.bgAlt2)
                                            }
                                        >
                                            <td style={tdBase}>
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        color: t.text,
                                                        fontSize: "0.88rem",
                                                        background: t.bgTag,
                                                        padding: "3px 10px",
                                                        borderRadius: 6,
                                                        border: `1px solid ${t.border}`,
                                                        transition:
                                                            "background 0.3s",
                                                    }}
                                                >
                                                    {c.num_chambre}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    ...tdBase,
                                                    color: t.textSub,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <i
                                                        className="fa-solid fa-bed"
                                                        style={{
                                                            color: PRIMARY,
                                                            fontSize: 12,
                                                        }}
                                                    />
                                                    {c.type_chambre}
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    ...tdBase,
                                                    color: t.textSub,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        background: t.bgTag,
                                                        padding: "3px 10px",
                                                        borderRadius: 6,
                                                        fontWeight: 600,
                                                        border: `1px solid ${t.border}`,
                                                        color: t.text,
                                                        transition:
                                                            "background 0.3s",
                                                    }}
                                                >
                                                    Étage {c.etage}
                                                </span>
                                            </td>
                                            <td style={tdBase}>
                                                <Badge statut={c.statut} />
                                            </td>
                                            <td
                                                style={{
                                                    ...tdBase,
                                                    fontSize: "0.78rem",
                                                    color: t.textMuted,
                                                    maxWidth: 200,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {c.equipements || (
                                                        <span
                                                            style={{
                                                                opacity: 0.35,
                                                            }}
                                                        >
                                                            —
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td style={tdBase}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                        justifyContent:
                                                            "flex-end",
                                                    }}
                                                >
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() =>
                                                            setModal({
                                                                edit: c,
                                                            })
                                                        }
                                                        title="Modifier"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 7,
                                                            border: `1px solid ${t.border}`,
                                                            background: t.bg,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color: PRIMARY,
                                                            fontSize: 13,
                                                            transition:
                                                                "all 0.15s",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background =
                                                                t.dark
                                                                    ? "rgba(217,119,6,0.15)"
                                                                    : "#fff7ed";
                                                            e.currentTarget.style.borderColor =
                                                                PRIMARY;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background =
                                                                t.bg;
                                                            e.currentTarget.style.borderColor =
                                                                t.border;
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square" />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            setModal({ del: c })
                                                        }
                                                        title="Supprimer"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 7,
                                                            border: `1px solid ${t.border}`,
                                                            background: t.bg,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color: "#ef4444",
                                                            fontSize: 13,
                                                            transition:
                                                                "all 0.15s",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background =
                                                                t.dark
                                                                    ? "rgba(239,68,68,0.12)"
                                                                    : "#fef2f2";
                                                            e.currentTarget.style.borderColor =
                                                                "#ef4444";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background =
                                                                t.bg;
                                                            e.currentTarget.style.borderColor =
                                                                t.border;
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div
                    style={{
                        display: isMobileTable ? "grid" : "none",
                        gap: 10,
                        padding: 12,
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                padding: "18px",
                                textAlign: "center",
                                color: t.textFaint,
                                border: `1px dashed ${t.borderMd}`,
                                borderRadius: 10,
                            }}
                        >
                            <i
                                className="fa-solid fa-spinner fa-spin"
                                style={{ marginRight: 8 }}
                            />
                            Chargement des chambres…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div
                            style={{
                                padding: "18px",
                                textAlign: "center",
                                color: t.textFaint,
                                border: `1px dashed ${t.borderMd}`,
                                borderRadius: 10,
                            }}
                        >
                            Aucune chambre trouvée
                        </div>
                    ) : (
                        filtered.map((c) => (
                            <div
                                key={`card-${c.id_chambre}`}
                                style={{
                                    border: `1px solid ${t.border}`,
                                    borderRadius: 10,
                                    padding: 12,
                                    background: t.dark
                                        ? "rgba(255,255,255,0.02)"
                                        : "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            color: t.text,
                                        }}
                                    >
                                        #{c.num_chambre}
                                    </span>
                                    <Badge statut={c.statut} />
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: t.textSub,
                                        display: "grid",
                                        gap: 6,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span>Type</span>
                                        <strong>{c.type_chambre}</strong>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span>Étage</span>
                                        <strong>{c.etage}</strong>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 8,
                                        }}
                                    >
                                        <span>Équipements</span>
                                        <span
                                            style={{
                                                textAlign: "right",
                                                maxWidth: "65%",
                                            }}
                                        >
                                            {c.equipements || "—"}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 8,
                                        marginTop: 10,
                                    }}
                                >
                                    <button
                                        onClick={() => setModal({ edit: c })}
                                        title="Modifier"
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 8,
                                            border: `1px solid ${t.border}`,
                                            background: t.bg,
                                            cursor: "pointer",
                                            color: PRIMARY,
                                        }}
                                    >
                                        <i className="fa-solid fa-pen-to-square" />
                                    </button>
                                    <button
                                        onClick={() => setModal({ del: c })}
                                        title="Supprimer"
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 8,
                                            border: `1px solid ${t.border}`,
                                            background: t.bg,
                                            cursor: "pointer",
                                            color: "#ef4444",
                                        }}
                                    >
                                        <i className="fa-solid fa-trash" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "10px 20px",
                        borderTop: `1px solid ${t.border}`,
                        fontSize: "0.72rem",
                        color: t.textFaint,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        {filtered.length} chambre
                        {filtered.length > 1 ? "s" : ""} affichée
                        {filtered.length > 1 ? "s" : ""}
                    </span>
                    <span>{chambres.length} au total</span>
                </div>
            </div>

            {/* ── Modals ── */}
            {modal === "add" && (
                <Modal
                    title="Ajouter une chambre"
                    onClose={() => setModal(null)}
                >
                    <ChambreForm onSubmit={handleAdd} loading={saving} />
                </Modal>
            )}
            {modal?.edit && (
                <Modal
                    title={`Modifier la chambre N° ${modal.edit.num_chambre}`}
                    onClose={() => setModal(null)}
                >
                    <ChambreForm
                        initial={modal.edit}
                        onSubmit={handleEdit}
                        loading={saving}
                    />
                </Modal>
            )}
            {modal?.del && (
                <DeleteConfirm
                    chambre={modal.del}
                    onConfirm={handleDelete}
                    onClose={() => setModal(null)}
                    loading={deleting}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

/* ── Wrap with dark mode context ── */
export default function Chambres() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <ChambresInner />
        </DM.Provider>
    );
}
