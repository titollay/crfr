import React, { useState, useEffect, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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

export default function Settings() {
    const dark = useDarkMode();

    return (
        <DM.Provider value={dark}>
            <SettingsInner />
        </DM.Provider>
    );
}

function SettingsInner() {
    const t = useTheme();
    const [settingsList, setSettingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get("/api/settings");
            setSettingsList(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setToast({ msg: "Erreur de chargement", type: "error" });
        }
    };

    const getSetting = (key) => settingsList.find(s => s.key === key);
    
    const updateLocalValue = (key, value) => {
        setSettingsList(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            const payload = {};
            settingsList.forEach(s => {
                if (s.type === 'file' && s.file) {
                    formData.append(s.key, s.file);
                } else if (s.type === 'json') {
                    payload[s.key] = Array.isArray(s.value) ? s.value : (typeof s.value === 'string' ? JSON.parse(s.value) : s.value);
                } else {
                    payload[s.key] = s.value;
                }
            });

            Object.keys(payload).forEach(k => {
                if (typeof payload[k] === 'object') {
                    formData.append(k, JSON.stringify(payload[k]));
                } else {
                    formData.append(k, payload[k]);
                }
            });

            await axios.post("/api/settings", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setToast({ msg: "Paramètres mis à jour", type: "success" });
            fetchSettings();
        } catch (error) {
            console.error(error);
            setToast({ msg: "Erreur lors de la sauvegarde", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir réinitialiser les paramètres par défaut ?")) return;
        
        setSaving(true);
        try {
            await axios.post("/api/settings/reset");
            setToast({ msg: "Paramètres réinitialisés", type: "success" });
            await fetchSettings();
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            setToast({ msg: "Erreur lors de la réinitialisation", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const addListItem = (key, currentList) => {
        const newItem = prompt("Ajouter un nouvel élément :");
        if (newItem && !currentList.includes(newItem)) {
            updateLocalValue(key, [...currentList, newItem]);
        }
    };

    const removeListItem = (key, currentList, index) => {
        const newList = [...currentList];
        newList.splice(index, 1);
        updateLocalValue(key, newList);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (loading) return <div style={{ padding: 40, color: t.text }}>Chargement...</div>;

    const tabs = [
        { id: "general", label: "Général", icon: "fa-sliders" },
        { id: "formation", label: "Taxis Formation", icon: "fa-graduation-cap" },
        { id: "rh", label: "Ressources Humaines", icon: "fa-users-gear" },
    ];

    const cardStyle = {
        background: t.bg,
        borderRadius: 16,
        padding: 32,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        marginBottom: 24
    };

    const labelStyle = {
        display: "block",
        marginBottom: 8,
        fontSize: "0.85rem",
        fontWeight: 600,
        color: t.textSub
    };

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        background: t.bgInput,
        border: `1px solid ${t.borderMd}`,
        borderRadius: 8,
        color: t.text,
        fontSize: "0.9rem",
        outline: "none",
        transition: "0.2s"
    };

    const renderJsonList = (key, label) => {
        const setting = getSetting(key);
        if (!setting) return null;
        let list = [];
        try {
            list = typeof setting.value === 'string' ? JSON.parse(setting.value) : (Array.isArray(setting.value) ? setting.value : []);
        } catch (e) { list = []; }

        return (
            <div key={key} style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{label}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                    {list.map((item, idx) => (
                        <div key={idx} style={{ 
                            display: "flex", alignItems: "center", gap: 8, 
                            padding: "6px 14px", background: PRIMARY + "22", 
                            border: `1px solid ${PRIMARY}44`, borderRadius: 20,
                            color: PRIMARY, fontSize: "0.85rem", fontWeight: 600
                        }}>
                            {item}
                            <i 
                                onClick={() => removeListItem(key, list, idx)}
                                className="fa-solid fa-xmark" 
                                style={{ cursor: "pointer", fontSize: 12 }} 
                            />
                        </div>
                    ))}
                    <button 
                        onClick={() => addListItem(key, list)}
                        style={{ padding: "6px 14px", borderRadius: 20, border: `1px dashed ${t.borderMd}`, background: "none", color: t.textSub, cursor: "pointer", fontSize: "0.85rem" }}
                    >
                        <i className="fa-solid fa-plus" style={{ marginRight: 6 }} /> Ajouter
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: "28px 24px", minHeight: "100%", background: t.bgPage, fontFamily: "'DM Sans', sans-serif" }}>
            {toast && (
                <div style={{ 
                    position: "fixed", top: 20, right: 20, padding: "12px 24px", borderRadius: 8, 
                    background: toast.type === "success" ? "#10b981" : "#ef4444", 
                    color: "#fff", zIndex: 9999, boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                    animation: "slideIn 0.3s ease-out"
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header matches Chambres.jsx style with centered breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${t.border}`, gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="fa-solid fa-gear" style={{ color: PRIMARY }} /> Paramètres
                    </h1>
                </div>

                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                        <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Paramètres</span>
                    </div>
                </div>

                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    {/* Empty placeholder to ensure center div stays centered */}
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={cardStyle}>
                    <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: 0, color: t.text, fontSize: "1rem", fontWeight: 700 }}>Identité Visuelle & Branding</h3>
                        <p style={{ margin: "4px 0 0", color: t.textSub, fontSize: "0.82rem" }}>Personnalisez l'apparence globale de votre application</p>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div>
                            <label style={labelStyle}>Nom de l'application</label>
                            <input 
                                style={inputStyle} 
                                placeholder="Ex: CRFR"
                                value={getSetting('site_name')?.value || ""} 
                                onChange={e => updateLocalValue('site_name', e.target.value)} 
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Logo Officiel</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 24, background: t.bgAlt, padding: 20, borderRadius: 12, border: `1px solid ${t.border}` }}>
                                <div style={{ width: 100, height: 100, borderRadius: 10, border: `2px dashed ${t.borderMd}`, display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, overflow: "hidden" }}>
                                    {getSetting('site_logo')?.value ? (
                                        <img src={getSetting('site_logo').value} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    ) : (
                                        <i className="fa-solid fa-image" style={{ color: t.textMuted, fontSize: 32 }} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input 
                                        type="file" 
                                        id="logoUpload" 
                                        style={{ display: "none" }} 
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setSettingsList(prev => prev.map(s => s.key === 'site_logo' ? { ...s, value: url, file: file } : s));
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={() => document.getElementById("logoUpload").click()}
                                        style={{ padding: "10px 20px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}
                                    >
                                        <i className="fa-solid fa-cloud-arrow-up" /> Choisir une image
                                    </button>
                                    <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: t.textMuted, lineHeight: 1.5 }}>
                                        Recommandé : PNG transparent, 200x200px minimum. <br/>
                                        L'image sera utilisée dans la barre latérale et les documents.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ width: "fit-content" }}>
                            <label style={labelStyle}>Couleur Thème (Primaire)</label>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", background: t.bgInput, padding: "10px 16px", borderRadius: 8, border: `1px solid ${t.borderMd}` }}>
                                <input 
                                    type="color" 
                                    value={getSetting('primary_color')?.value || "#000"} 
                                    onChange={e => updateLocalValue('primary_color', e.target.value)} 
                                    style={{ border: "none", width: 32, height: 32, cursor: "pointer", background: "none", padding: 0 }}
                                />
                                <span style={{ fontSize: "0.9rem", color: t.text, fontWeight: 600, fontFamily: "monospace" }}>{getSetting('primary_color')?.value?.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                    <button 
                        onClick={handleReset}
                        disabled={saving}
                        style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${t.borderMd}`, borderRadius: 8, color: t.textSub, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.85rem" }}
                    >
                        Réinitialiser
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        style={{ padding: "10px 24px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}
                    >
                        {saving ? (
                            <i className="fa-solid fa-spinner fa-spin" />
                        ) : (
                            <i className="fa-solid fa-floppy-disk" />
                        )}
                        {saving ? "Enregistrement..." : "Sauvegarder les réglages"}
                    </button>
                </div>
            </div>
        </div>
    );
}

