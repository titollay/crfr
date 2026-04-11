import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    createContext,
    useContext,
} from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import ReactApexChart from "react-apexcharts";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
);

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Dark mode hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        text: dark ? "rgba(255,255,255,0.87)" : "#111",
        textSub: dark ? "rgba(255,255,255,0.6)" : "#374151",
        textMuted: dark ? "rgba(255,255,255,0.35)" : "#6b7280",
        textFaint: dark ? "rgba(255,255,255,0.22)" : "#9ca3af",
        shadow: dark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.07)",
        shadowLg: dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.18)",
        toastShadow: dark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
    };
}

const PRIMARY = "#D97706";
const PALETTE = ["#D97706", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899"];

/* 25 nationalitÃ©s les plus frÃ©quentes en formation au Maroc */
const PAYS_LISTE = [
    "Marocaine",
    "AlgÃ©rienne",
    "Tunisienne",
    "Mauritanienne",
    "Libyenne",
    "Ã‰gyptienne",
    "SÃ©nÃ©galaise",
    "Maliéenne",
    "Ivoirienne",
    "GuinÃ©enne",
    "BurkinabÃ¨",
    "NigÃ©rienne",
    "Camerounaise",
    "Congolaise (RDC)",
    "Gabonaise",
    "Togolaise",
    "BÃ©ninoise",
    "Mauritanienne",
    "FranÃ§aise",
    "Espagnole",
    "Belge",
    "Canadienne",
    "Saoudienne",
    "Turque",
    "Autre",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
                position: "fixed", bottom: 24, right: 24, zIndex: 9999,
                background: t.bg, border: `1.5px solid ${c}`,
                borderLeft: `4px solid ${c}`, borderRadius: 8,
                padding: "12px 18px", display: "flex", alignItems: "center",
                gap: 10, boxShadow: t.toastShadow, fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: t.text, minWidth: 260,
                animation: "slideUp 0.3s ease",
            }}
        >
            <i className={`fa-solid ${type === "success" ? "fa-circle-Écheck" : type === "error" ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: c, fontSize: 16 }} />
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: t.textFaint, fontSize: 14 }}>
                <i className="fa-solid fa-xmark" />
            </button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Field({ label, required, children, error }) {
    const t = useTheme();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: t.textSub, letterSpacing: "0.04em" }}>
                {label}{required && <span style={{ color: PRIMARY }}> *</span>}
            </label>
            {children}
            {error && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{error}</span>}
        </div>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Intervenant Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function IntervenantForm({ initial = {}, onSubmit, loading, organisations }) {
    const t = useTheme();
    const [form, setForm] = useState({
        nom: initial.nom || "",
        prenom: initial.prenom || "",
        cin: initial.cin || "",
        telephone: initial.telephone || "",
        email: initial.email || "",
        ville: initial.ville || "",
        id_org: initial.id_org || "",
        date_naissance: initial.date_naissance || "",
        cadre: initial.cadre || "",
        mission: initial.mission || "",
        nationalite: initial.nationalite || "Marocaine",
        adresse: initial.adresse || "",
    });
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState(null);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.nom.trim()) e.nom = "Nom requis";
        if (!form.prenom.trim()) e.prenom = "PrÃ©nom requis";
        if (!form.cin.trim()) e.cin = "CIN requis";
        if (!form.telephone.trim()) e.telephone = "TÃ©lÃ©phone requis";
        if (!form.email.trim()) e.email = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
        if (!form.ville.trim()) e.ville = "Ville requise";
        if (!form.id_org) e.id_org = "Organisation requise";
        if (!form.date_naissance) e.date_naissance = "Date de naissance requise";
        if (!form.cadre.trim()) e.cadre = "Cadre requis";
        if (!form.mission.trim()) e.mission = "Mission requise";
        if (!form.nationalite.trim()) e.nationalite = "NationalitÃ© requise";
        if (!form.adresse.trim()) e.adresse = "Adresse requise";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handle = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const inputStyle = (k) => ({
        border: `1px solid ${errors[k] ? "#ef4444" : focus === k ? PRIMARY : t.borderMd}`,
        borderRadius: 7, padding: "9px 12px", fontSize: "0.85rem",
        fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
        boxSizing: "border-box", color: t.text, background: t.bgInput,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focus === k && !errors[k] ? "0 0 0 3px rgba(217,119,6,0.15)" : "none",
    });

    return (
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Nom" required error={errors.nom}>
                    <input style={inputStyle("nom")} value={form.nom}
                        onChange={(e) => set("nom", e.target.value)}
                        onFocus={() => setFocus("nom")} onBlur={() => setFocus(null)}
                        placeholder="Ex: Alaoui" />
                </Field>
                <Field label="PrÃ©nom" required error={errors.prenom}>
                    <input style={inputStyle("prenom")} value={form.prenom}
                        onChange={(e) => set("prenom", e.target.value)}
                        onFocus={() => setFocus("prenom")} onBlur={() => setFocus(null)}
                        placeholder="Ex: Mohammed" />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="CIN" required error={errors.cin}>
                    <input style={inputStyle("cin")} value={form.cin}
                        onChange={(e) => set("cin", e.target.value.toUpperCase())}
                        onFocus={() => setFocus("cin")} onBlur={() => setFocus(null)}
                        placeholder="Ex: BE123456" maxLength={20} />
                </Field>
                <Field label="Date de naissance" required error={errors.date_naissance}>
                    <input type="date" style={inputStyle("date_naissance")} value={form.date_naissance}
                        onChange={(e) => set("date_naissance", e.target.value)}
                        onFocus={() => setFocus("date_naissance")} onBlur={() => setFocus(null)} />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="TÃ©lÃ©phone" required error={errors.telephone}>
                    <input style={inputStyle("telephone")} value={form.telephone}
                        onChange={(e) => set("telephone", e.target.value)}
                        onFocus={() => setFocus("telephone")} onBlur={() => setFocus(null)}
                        placeholder="Ex: 0661234567" />
                </Field>
                <Field label="Email" required error={errors.email}>
                    <input type="email" style={inputStyle("email")} value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
                        placeholder="Ex: m.alaoui@mail.com" />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Ville" required error={errors.ville}>
                    <input style={inputStyle("ville")} value={form.ville}
                        onChange={(e) => set("ville", e.target.value)}
                        onFocus={() => setFocus("ville")} onBlur={() => setFocus(null)}
                        placeholder="Ex: Rabat" />
                </Field>
                <Field label="NationalitÃ©" required error={errors.nationalite}>
                    <select
                        style={{ ...inputStyle("nationalite"), appearance: "none", cursor: "pointer" }}
                        value={form.nationalite}
                        onChange={(e) => set("nationalite", e.target.value)}
                        onFocus={() => setFocus("nationalite")}
                        onBlur={() => setFocus(null)}
                    >
                        <option value="">â€” SÃ©lectionner la nationalitÃ© â€”</option>
                        {PAYS_LISTE.map((pays) => (
                            <option key={pays} value={pays}>{pays}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Cadre" required error={errors.cadre}>
                    <input style={inputStyle("cadre")} value={form.cadre}
                        onChange={(e) => set("cadre", e.target.value)}
                        onFocus={() => setFocus("cadre")} onBlur={() => setFocus(null)}
                        placeholder="Ex: Technicien" />
                </Field>
                <Field label="Mission" required error={errors.mission}>
                    <input style={inputStyle("mission")} value={form.mission}
                        onChange={(e) => set("mission", e.target.value)}
                        onFocus={() => setFocus("mission")} onBlur={() => setFocus(null)}
                        placeholder="Ex: Formation IT" />
                </Field>
            </div>

            <Field label="Organisation" required error={errors.id_org}>
                <select
                    style={{ ...inputStyle("id_org"), appearance: "none" }}
                    value={form.id_org}
                    onChange={(e) => set("id_org", e.target.value)}
                    onFocus={() => setFocus("id_org")} onBlur={() => setFocus(null)}
                >
                    <option value="">â€” SÃ©lectionner une organisation â€”</option>
                    {organisations.map((org) => (
                        <option key={org.id_org} value={org.id_org}>{org.nom}</option>
                    ))}
                </select>
            </Field>

            <Field label="Adresse" required error={errors.adresse}>
                <textarea
                    style={{ ...inputStyle("adresse"), resize: "vertical", minHeight: 72 }}
                    value={form.adresse}
                    onChange={(e) => set("adresse", e.target.value)}
                    onFocus={() => setFocus("adresse")} onBlur={() => setFocus(null)}
                    placeholder="Adresse complÃ¨te..."
                    rows={3}
                />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: PRIMARY, color: "#fff", border: "none",
                        borderRadius: 8, padding: "10px 24px", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8,
                        transition: "opacity 0.2s, transform 0.15s",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.35)",
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                    {loading
                        ? <><i className="fa-solid fa-spinner fa-spin" /> Traitement...</>
                        : <><i className="fa-solid fa-user-plus" /> {Object.keys(initial).length > 1 ? "Mettre Ã  jour" : "Ajouter"}</>
                    }
                </button>
            </div>
        </form>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatCard({ icon, label, value, color, sub }) {
    const t = useTheme();
    return (
        <div style={{
            background: t.bg, borderRadius: 12, padding: "18px 20px",
            border: `1px solid ${t.border}`, boxShadow: t.shadow,
            display: "flex", alignItems: "center", gap: 16,
            transition: "transform 0.2s, box-shadow 0.2s",
        }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = t.shadowLg; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = t.shadow; }}
        >
            <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <i className={icon} style={{ color, fontSize: 20 }} />
            </div>
            <div>
                <div style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: t.text, lineHeight: 1.2 }}>{value}</div>
                {sub && <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chart: RÃ©partition par ville â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function VilleChart({ data }) {
    const t = useTheme();
    const labels = data.map((d) => d.ville);
    const values = data.map((d) => Number(d.total));
    const chartData = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: PALETTE,
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };
    const options = {
        responsive: true, maintainAspectRatio: false, cutout: "60%",
        plugins: {
            legend: {
                position: "right",
                labels: { color: t.textSub, font: { size: 11, family: "'DM Sans'" }, boxWidth: 12, padding: 10 },
            },
            tooltip: { backgroundColor: "#111827", titleColor: "#fff", bodyColor: "#fff", padding: 10 },
        },
    };
    if (!data.length) return <p style={{ fontSize: "0.8rem", color: t.textFaint, textAlign: "center", padding: "20px 0" }}>Aucune donnÃ©e</p>;
    return <Doughnut data={chartData} options={options} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chart: Cadres (Bar horizontal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CadreChart({ data }) {
    const t = useTheme();
    const labels = data.map((d) => d.cadre);
    const values = data.map((d) => Number(d.total));
    const options = useMemo(() => ({
        chart: { type: "bar", toolbar: { show: false }, animations: { easing: "easeinout", speed: 600 } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
        colors: [PRIMARY],
        dataLabels: { enabled: false },
        grid: { borderColor: t.dark ? "rgba(255,255,255,0.08)" : "#eef2f7" },
        xaxis: {
            categories: labels,
            labels: { style: { colors: t.textMuted, fontSize: "11px" } },
        },
        yaxis: { labels: { style: { colors: t.textSub, fontSize: "11px" } } },
        tooltip: { theme: t.dark ? "dark" : "light" },
    }), [labels, t.dark, t.textMuted, t.textSub]);

    if (!data.length) return <p style={{ fontSize: "0.8rem", color: t.textFaint, textAlign: "center", padding: "20px 0" }}>Aucune donnÃ©e</p>;
    return <ReactApexChart type="bar" options={options} series={[{ name: "Intervenants", data: values }]} height={220} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chart: InsCrééiptions mensuelles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MonthlyChart({ data }) {
    const t = useTheme();
    const labels = data.map((d) => {
        const [y, m] = d.month.split("-");
        return new Date(y, m - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    });
    const values = data.map((d) => Number(d.total));

    const options = useMemo(() => ({
        chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: false }, animations: { easing: "easeinout", speed: 700 } },
        stroke: { curve: "smooth", width: 2 },
        colors: [PRIMARY],
        fill: {
            type: "gradient",
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: t.dark ? "rgba(255,255,255,0.07)" : "#eef2f7" },
        xaxis: {
            categories: labels,
            labels: { style: { colors: t.textMuted, fontSize: "11px" } },
        },
        yaxis: {
            min: 0,
            labels: { style: { colors: t.textMuted, fontSize: "11px" }, formatter: (v) => Math.round(v) },
        },
        tooltip: { theme: t.dark ? "dark" : "light" },
    }), [labels, t.dark, t.textMuted]);

    if (!data.length) return <p style={{ fontSize: "0.8rem", color: t.textFaint, textAlign: "center", padding: "20px 0" }}>Aucune donnÃ©e</p>;
    return <ReactApexChart type="area" options={options} series={[{ name: "Nouveaux", data: values }]} height={200} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chart: Organisations (radialBar) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function OrgChart({ data }) {
    const t = useTheme();
    const maxVal = Math.max(...data.map((d) => Number(d.total)), 1);
    const series = data.map((d) => Math.round((Number(d.total) / maxVal) * 100));
    const labels = data.map((d) => d.org_nom);

    const options = useMemo(() => ({
        chart: { type: "radialBar", toolbar: { show: false } },
        labels,
        colors: PALETTE,
        plotOptions: {
            radialBar: {
                hollow: { size: "20%" },
                track: { background: t.dark ? "rgba(255,255,255,0.08)" : "#eef2f7" },
                dataLabels: {
                    name: { color: t.textMuted, fontSize: "10px" },
                    value: { color: t.text, fontSize: "12px", formatter: (v) => `${Math.round((v / 100) * maxVal)}` },
                    total: {
                        show: true, label: "Total",
                        color: t.textSub,
                        formatter: () => `${data.reduce((s, d) => s + Number(d.total), 0)}`,
                    },
                },
            },
        },
        legend: { show: true, position: "bottom", labels: { colors: t.textMuted }, markers: { size: 6 } },
    }), [labels, data, maxVal, t]);

    if (!data.length) return <p style={{ fontSize: "0.8rem", color: t.textFaint, textAlign: "center", padding: "20px 0" }}>Aucune donnÃ©e</p>;
    return <ReactApexChart type="radialBar" options={options} series={series} height={260} />;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Chip({ label, color }) {
    return (
        <span style={{
            display: "inline-block", padding: "2px 9px", borderRadius: 999,
            background: `${color}18`, color, fontSize: "0.68rem", fontWeight: 600,
            letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>{label}</span>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Avatar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Avatar({ nom, prenom }) {
    const t = useTheme();
    const initials = `${(prenom || "?")[0]}${(nom || "?")[0]}`.toUpperCase();
    const hue = (nom.charCodeAt(0) || 65) * 6 % 360;
    return (
        <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: `hsl(${hue},60%,${t.dark ? "30%" : "88%"})`,
            color: `hsl(${hue},60%,${t.dark ? "70%" : "35%"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em",
        }}>
            {initials}
        </div>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Delete Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DeleteModal({ intervenant, onConfirm, onCancel, loading }) {
    const t = useTheme();
    return (
        <Modal title="suppriméer l'intervenant" onClose={onCancel} width={420}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 24 }} />
                </div>
                <p style={{ color: t.text, fontSize: "0.9rem", margin: "0 0 8px" }}>
                    ÃŠtes-vous sÃ»r de vouloir suppriméer
                </p>
                <p style={{ color: PRIMARY, fontWeight: 700, fontSize: "1rem", margin: "0 0 16px" }}>
                    {intervenant.prenom} {intervenant.nom}
                </p>
                <p style={{ color: t.textMuted, fontSize: "0.8rem", margin: 0 }}>
                    Cette action est irrÃ©versible.
                </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${t.borderMd}`, background: "transparent", color: t.textSub, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", fontWeight: 600 }}>
                    Annuler
                </button>
                <button onClick={onConfirm} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", fontWeight: 700, opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}>
                    {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Suppression...</> : <><i className="fa-solid fa-trash" /> suppriméer</>}
                </button>
            </div>
        </Modal>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Intervenants() {
    const dark = useDarkMode();
    return (
        <DM.Provider value={dark}>
            <IntervenantsInner />
        </DM.Provider>
    );
}

function IntervenantsInner() {
    const t = useTheme();

    const [intervenants, setIntervenants] = useState([]);
    const [organisations, setOrganisations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* UI state */
    const [cinSearch, setCinSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeTab, setActiveTab] = useState("liste"); // "liste" | "stats"
    const [toast, setToast] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

    /* â”€â”€ Fetch data â”€â”€ */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [intRes, orgRes] = await Promise.all([
                axios.get("/api/intervenants", { headers }),
                axios.get("/api/intervenants/organisations", { headers }),
            ]);
            setIntervenants(intRes.data);
            setOrganisations(orgRes.data);
        } catch (err) {
            showToast("Erreur de chargement des donnÃ©es", "error");
        }
        // Load statistics independently so a failure doesn't block the list/orgs
        try {
            const statsRes = await axios.get("/api/intervenants/statistics", { headers });
            setStats(statsRes.data);
        } catch (err) {
            showToast("Erreur de chargement des statistiques", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* â”€â”€ Filtered list by CIN â”€â”€ */
    const filtered = useMemo(() => {
        const q = cinSearch.trim().toUpperCase();
        if (!q) return intervenants;
        return intervenants.filter((i) => i.cin.toUpperCase().includes(q));
    }, [intervenants, cinSearch]);

    /* â”€â”€ Add â”€â”€ */
    const handleAdd = async (form) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/intervenants", form, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Intervenant ajoutÃ© avec succÃ¨s !");
            setShowAdd(false);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(" ")
                : "Erreur lors de l'ajout";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    /* â”€â”€ Edit â”€â”€ */
    const handleEdit = async (form) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/intervenants/${editTarget.id_inter}`, form, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Intervenant mis Ã  jour !");
            setEditTarget(null);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(" ")
                : "Erreur lors de la mise Ã  jour";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    /* â”€â”€ Delete â”€â”€ */
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/intervenants/${deleteTarget.id_inter}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Intervenant supprimÃ©.", "info");
            setDeleteTarget(null);
            fetchAll();
        } catch {
            showToast("Erreur lors de la suppression", "error");
        } finally {
            setDeleting(false);
        }
    };

    /* â”€â”€â”€ Render â”€â”€â”€ */
    return (
        <div style={{ minHeight: "100vh", background: t.bgPage, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s" }}>

            {/* â”€â”€ Header â”€â”€ */}
            <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: t.text }}>
                        <i className="fa-solid fa-user-tie" style={{ color: PRIMARY, marginRight: 10 }} />
                        Intervenants
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: t.textMuted }}>
                        Gestion des intervenants du centre
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Tabs */}
                    {["liste", "stats"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: "8px 16px", borderRadius: 8, border: `1px solid ${activeTab === tab ? PRIMARY : t.borderMd}`,
                            background: activeTab === tab ? `${PRIMARY}18` : "transparent",
                            color: activeTab === tab ? PRIMARY : t.textSub, fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                            transition: "all 0.2s",
                        }}>
                            <i className={`fa-solid ${tab === "liste" ? "fa-list" : "fa-chart-pie"}`} style={{ marginRight: 6 }} />
                            {tab === "liste" ? "Liste" : "Statistiques"}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowAdd(true)}
                        style={{
                            background: PRIMARY, color: "#fff", border: "none", borderRadius: 8,
                            padding: "9px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem",
                            fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                            boxShadow: "0 4px 14px rgba(217,119,6,0.3)", transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        <i className="fa-solid fa-user-plus" />
                        Ajouter
                    </button>
                </div>
            </div>

            <div style={{ padding: "24px 28px" }}>

                {/* â”€â”€â”€ LISTE TAB â”€â”€â”€ */}
                {activeTab === "liste" && (
                    <>
                        {/* Search bar */}
                        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: t.bg, border: `1px solid ${cinSearch ? PRIMARY : t.borderMd}`,
                                borderRadius: 10, padding: "9px 14px", maxWidth: 360, width: "100%",
                                boxShadow: cinSearch ? "0 0 0 3px rgba(217,119,6,0.12)" : t.shadow,
                                transition: "all 0.25s",
                            }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ color: cinSearch ? PRIMARY : t.textMuted, fontSize: 14 }} />
                                <input
                                    value={cinSearch}
                                    onChange={(e) => setCinSearch(e.target.value)}
                                    placeholder="Rechercher par CIN..."
                                    style={{
                                        border: "none", outline: "none", background: "transparent",
                                        color: t.text, fontSize: "0.87rem", fontFamily: "'DM Sans', sans-serif",
                                        width: "100%",
                                    }}
                                />
                                {cinSearch && (
                                    <button onClick={() => setCinSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: t.textFaint, fontSize: 12 }}>
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                )}
                            </div>
                            <span style={{ fontSize: "0.8rem", color: t.textMuted }}>
                                {filtered.length} rÃ©sultat{filtered.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* â”€â”€ Table â”€â”€ */}
                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                                <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px", background: t.bg, borderRadius: 12, border: `1px solid ${t.border}` }}>
                                <i className="fa-solid fa-user-slash" style={{ fontSize: 36, color: t.textFaint, marginBottom: 12 }} />
                                <p style={{ color: t.textMuted, margin: 0, fontSize: "0.9rem" }}>
                                    {cinSearch ? `Aucun intervenant avec CIN "${cinSearch}"` : "Aucun intervenant enregistrÃ©"}
                                </p>
                                {!cinSearch && (
                                    <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 8, background: PRIMARY, color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                                        <i className="fa-solid fa-user-plus" style={{ marginRight: 6 }} />Ajouter le premier
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: "hidden" }}>
                                {/* Table header */}
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr 1.4fr auto", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, background: t.bgAlt }}>
                                    {["Intervenant", "CIN", "TÃ©lÃ©phone", "Ville", "Organisation", ""].map((h, i) => (
                                        <div key={i} style={{ fontSize: "0.7rem", fontWeight: 700, color: t.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
                                    ))}
                                </div>

                                {/* Rows */}
                                {filtered.map((inv, idx) => (
                                    <div key={inv.id_inter}>
                                        <div
                                            style={{
                                                display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr 1.4fr auto",
                                                padding: "13px 18px", alignItems: "center",
                                                borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                                                transition: "background 0.15s",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = t.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                            onClick={() => setExpandedId(expandedId === inv.id_inter ? null : inv.id_inter)}
                                        >
                                            {/* Name + avatar */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <Avatar nom={inv.nom} prenom={inv.prenom} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: t.text }}>{inv.prenom} {inv.nom}</div>
                                                    <div style={{ fontSize: "0.72rem", color: t.textMuted }}>{inv.email}</div>
                                                </div>
                                            </div>
                                            {/* CIN */}
                                            <div>
                                                <code style={{ fontSize: "0.82rem", color: PRIMARY, fontWeight: 700, background: `${PRIMARY}12`, padding: "2px 7px", borderRadius: 5 }}>{inv.cin}</code>
                                            </div>
                                            {/* Tel */}
                                            <div style={{ fontSize: "0.83rem", color: t.textSub }}>{inv.telephone}</div>
                                            {/* Ville */}
                                            <div style={{ fontSize: "0.83rem", color: t.textSub }}>{inv.ville}</div>
                                            {/* Org */}
                                            <div>
                                                <Chip label={inv.organisation?.nom || "â€”"} color="#3b82f6" />
                                            </div>
                                            {/* Actions */}
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setEditTarget(inv)}
                                                    title="Modifier"
                                                    style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.textMuted, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = `${PRIMARY}12`; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                                                >
                                                    <i className="fa-solid fa-pen-to-square" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(inv)}
                                                    title="suppriméer"
                                                    style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.textMuted, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                                                >
                                                    <i className="fa-solid fa-trash" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded detail row */}
                                        {expandedId === inv.id_inter && (
                                            <div style={{ background: t.dark ? "rgba(255,255,255,0.02)" : "#faf9f7", padding: "14px 18px 18px 68px", borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                                                {[
                                                    { label: "Cadre", value: inv.cadre, icon: "fa-briefcase" },
                                                    { label: "Mission", value: inv.mission, icon: "fa-Crééosshairs" },
                                                    { label: "NationalitÃ©", value: inv.nationalite, icon: "fa-flag" },
                                                    { label: "Date naissance", value: inv.date_naissance, icon: "fa-cake-candles" },
                                                    { label: "Adresse", value: inv.adresse, icon: "fa-location-dot" },
                                                ].map((item) => (
                                                    <div key={item.label}>
                                                        <div style={{ fontSize: "0.65rem", color: t.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                                                            <i className={`fa-solid ${item.icon}`} style={{ marginRight: 5 }} />{item.label}
                                                        </div>
                                                        <div style={{ fontSize: "0.82rem", color: t.textSub }}>{item.value || "â€”"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* â”€â”€â”€ STATS TAB â”€â”€â”€ */}
                {activeTab === "stats" && (
                    <>
                        {loading || !stats ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                                <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : (
                            <>
                                {/* KPI Cards */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                                    <StatCard icon="fa-solid fa-users" label="Total Intervenants" value={stats.total} color={PRIMARY} />
                                    <StatCard icon="fa-solid fa-city" label="Villes reprÃ©sentÃ©es" value={stats.by_ville.length} color="#3b82f6" sub="villes distinctes" />
                                    <StatCard icon="fa-solid fa-flag" label="NationalitÃ©s" value={stats.by_nationalite.length} color="#8b5cf6" sub="nationalitÃ©s distinctes" />
                                    <StatCard icon="fa-solid fa-building" label="Organisations" value={stats.by_org.length} color="#10b981" sub="organismes partenaires" />
                                </div>

                                {/* Charts grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>

                                    {/* RÃ©partition par ville */}
                                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 20 }}>
                                        <h3 style={{ margin: "0 0 16px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                            <i className="fa-solid fa-map-pin" style={{ color: "#3b82f6", marginRight: 8 }} />
                                            RÃ©partition par Ville
                                        </h3>
                                        <div style={{ height: 220 }}>
                                            <VilleChart data={stats.by_ville} />
                                        </div>
                                    </div>

                                    {/* RÃ©partition par Cadre */}
                                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 20 }}>
                                        <h3 style={{ margin: "0 0 4px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                            <i className="fa-solid fa-briefcase" style={{ color: PRIMARY, marginRight: 8 }} />
                                            Intervenants par Cadre
                                        </h3>
                                        <CadreChart data={stats.by_cadre} />
                                    </div>

                                    {/* Organisations */}
                                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 20 }}>
                                        <h3 style={{ margin: "0 0 4px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                            <i className="fa-solid fa-building" style={{ color: "#10b981", marginRight: 8 }} />
                                            Intervenants par Organisation
                                        </h3>
                                        <OrgChart data={stats.by_org} />
                                    </div>

                                    {/* InsCrééiptions mensuelles */}
                                    <div style={{ background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 20 }}>
                                        <h3 style={{ margin: "0 0 4px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                            <i className="fa-solid fa-chart-line" style={{ color: "#8b5cf6", marginRight: 8 }} />
                                            InsCrééiptions Mensuelles
                                        </h3>
                                        <MonthlyChart data={stats.monthly} />
                                    </div>

                                </div>

                                {/* NationalitÃ©s list */}
                                {stats.by_nationalite.length > 0 && (
                                    <div style={{ marginTop: 20, background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, padding: 20 }}>
                                        <h3 style={{ margin: "0 0 14px", fontSize: "0.88rem", fontWeight: 700, color: t.text }}>
                                            <i className="fa-solid fa-flag" style={{ color: "#8b5cf6", marginRight: 8 }} />
                                            RÃ©partition par NationalitÃ©
                                        </h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                            {stats.by_nationalite.map((n, i) => (
                                                <div key={n.nationalite} style={{ display: "flex", alignItems: "center", gap: 8, background: t.dark ? "rgba(255,255,255,0.04)" : "#f9fafb", borderRadius: 8, padding: "8px 14px", border: `1px solid ${t.border}` }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                                                    <span style={{ fontSize: "0.82rem", color: t.text, fontWeight: 600 }}>{n.nationalite}</span>
                                                    <span style={{ fontSize: "0.75rem", color: t.textMuted }}>({n.total})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* â”€â”€ Modals â”€â”€ */}
            {showAdd && (
                <Modal title="Ajouter un intervenant" onClose={() => setShowAdd(false)} width={640}>
                    <IntervenantForm onSubmit={handleAdd} loading={saving} organisations={organisations} />
                </Modal>
            )}
            {editTarget && (
                <Modal title="Modifier l'intervenant" onClose={() => setEditTarget(null)} width={640}>
                    <IntervenantForm initial={editTarget} onSubmit={handleEdit} loading={saving} organisations={organisations} />
                </Modal>
            )}
            {deleteTarget && (
                <DeleteModal intervenant={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
            )}

            {/* â”€â”€ Toast â”€â”€ */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

