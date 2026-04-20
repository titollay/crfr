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

export default function Profile() {
    const dark = useDarkMode();

    return (
        <DM.Provider value={dark}>
            <ProfileInner />
        </DM.Provider>
    );
}

function ProfileInner() {
    const t = useTheme();
    const [user, setUser] = useState({ id_user: null, prenom: "", nom: "", email: "", photo: null });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/user", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setPreview(res.data.photo);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const fd = new FormData();
            fd.append("nom", user.nom);
            fd.append("prenom", user.prenom);
            fd.append("_method", "PUT");
            if (photoFile) {
                fd.append("photo", photoFile);
            }

            const res = await axios.post(`/api/users/${user.id_user}`, fd, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            });
            
            setUser(res.data);
            setPreview(res.data.photo);
            setToast({ msg: "Profil mis à jour avec succès", type: "success" });
            
            // Dispatch event to update avatar in other components like Sidebar if needed
            window.dispatchEvent(new Event("userUpdated"));
        } catch (err) {
            console.error(err);
            setToast({ msg: "Erreur lors de la mise à jour", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        background: t.bgInput,
        border: `1px solid ${t.borderMd}`,
        borderRadius: 8,
        color: t.text,
        fontSize: "0.9rem",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        marginBottom: 8,
        fontSize: "0.85rem",
        fontWeight: 600,
        color: t.textSub
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: t.text }}>
            Chargement...
        </div>
    );

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

            {/* Header matches Settings.jsx style with centered breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${t.border}`, gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="fa-solid fa-user-circle" style={{ color: PRIMARY }} /> Mon Profil
                    </h1>
                </div>

                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: t.bgInput, borderRadius: 20, border: `1px solid ${t.borderMd}` }}>
                        <Link to="/dashboard" style={{ fontSize: "0.75rem", color: t.textSub, textDecoration: "none" }}>Dashboard</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9, color: t.textFaint }} />
                        <span style={{ fontSize: "0.75rem", color: t.text, fontWeight: 700 }}>Profil</span>
                    </div>
                </div>

                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    {/* Empty placeholder */}
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {/* Profile Section */}
                <div style={{ background: t.bg, borderRadius: 16, padding: 32, border: `1px solid ${t.border}`, boxShadow: t.shadow, marginBottom: 24 }}>
                    <h3 style={{ margin: "0 0 24px", color: t.text, fontSize: "1.1rem" }}>Profil Utilisateur</h3>
                    
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                        <div style={{ flex: "0 0 100px" }}>
                            <div 
                                style={{ width: 100, height: 100, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2rem", fontWeight: 700, overflow: "hidden", cursor: "pointer", position: "relative" }}
                                onClick={() => document.getElementById("profile-photo").click()}
                            >
                                {preview ? (
                                    <img 
                                        src={preview.startsWith('http') || preview.startsWith('blob:') ? preview : `http://localhost:8000${preview}`} 
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                        alt="" 
                                    />
                                ) : (
                                    `${user.prenom[0]}${user.nom[0]}`
                                )}
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", height: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="fa-solid fa-camera" style={{ fontSize: 12 }} />
                                </div>
                                <input id="profile-photo" type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Prénom</label>
                                <input style={inputStyle} value={user.prenom} onChange={e => setUser({...user, prenom: e.target.value})} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom</label>
                                <input style={inputStyle} value={user.nom} onChange={e => setUser({...user, nom: e.target.value})} />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} value={user.email} disabled />
                                <p style={{ fontSize: "0.75rem", color: t.textMuted, marginTop: 6 }}>L'adresse email ne peut pas être modifiée ici.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: "10px 24px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </div>

                {/* Preferences Section */}
                <div style={{ background: t.bg, borderRadius: 16, padding: 32, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <h3 style={{ margin: "0 0 24px", color: t.text, fontSize: "1.1rem" }}>Préférences de l'application</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, color: t.text }}>Notifications par email</p>
                                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: t.textSub }}>Recevoir un récapitulatif quotidien des réservations</p>
                            </div>
                            <div style={{ width: 44, height: 24, background: PRIMARY, borderRadius: 12, position: "relative", cursor: "pointer" }}>
                                <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, right: 3 }} />
                            </div>
                        </div>

                        <div style={{ height: 1, background: t.border }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, color: t.text }}>Mode sombre automatique</p>
                                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: t.textSub }}>Synchroniser avec les paramètres du système</p>
                            </div>
                            <div style={{ width: 44, height: 24, background: t.borderMd, borderRadius: 12, position: "relative", cursor: "pointer" }}>
                                <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: 3 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
