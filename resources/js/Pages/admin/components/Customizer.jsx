import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Customizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [layout, setLayout] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    const [layoutType, setLayoutType] = useState("ltr"); // ltr, rtl, box
    const [sidebarType, setSidebarType] = useState("vertical"); // vertical, horizontal
    const [sidebarTheme, setSidebarTheme] = useState("auto");
    const [primaryColor, setPrimaryColor] = useState(
        getComputedStyle(document.documentElement).getPropertyValue("--admin-primary").trim() || "#D97706"
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (document.documentElement.classList.contains("dark")) setLayout("dark");
            else setLayout("light");
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty("--admin-primary", primaryColor);
    }, [primaryColor]);

    useEffect(() => {
        if (sidebarTheme === "auto") {
            document.documentElement.removeAttribute("data-sidebar");
        } else {
            document.documentElement.setAttribute("data-sidebar", sidebarTheme);
        }
    }, [sidebarTheme]);

    // Handle Sidebar Type (Vertical/Horizontal)
    useEffect(() => {
        document.documentElement.setAttribute("data-sidebar-type", sidebarType);
    }, [sidebarType]);

    // Handle RTL
    useEffect(() => {
        if (layoutType === "rtl") {
            document.documentElement.setAttribute("dir", "rtl");
        } else {
            document.documentElement.setAttribute("dir", "ltr");
        }
    }, [layoutType]);

    const toggleLayoutMode = (val) => {
        console.log("Setting layout mode:", val);
        setLayout(val);
        if (val === "dark") {
            document.documentElement.classList.add("dark");
            setSidebarTheme("dark");
        } else if (val === "light") {
            document.documentElement.classList.remove("dark");
            setSidebarTheme("light");
        } else if (val === "mix") {
            document.documentElement.classList.remove("dark");
            setSidebarTheme("dark");
        }
    };

    const handleSaveGlobally = async () => {
        try {
            await axios.post("/api/settings", {
                settings: [{ key: "primary_color", value: primaryColor }]
            });
            alert("Paramètres enregistrés avec succès !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement.");
        }
    };

    const PRIMARY = primaryColor;

    const barContainerStyle = {
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1990,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        boxShadow: "-2px 0 15px rgba(0,0,0,0.1)",
        borderRadius: "8px 0 0 8px",
        overflow: "hidden"
    };

    const triggerBtnStyle = (isColored = false) => ({
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: isColored ? PRIMARY : "#fff",
        color: isColored ? "#fff" : "#777",
        borderBottom: `1px solid ${isColored ? "rgba(255,255,255,0.1)" : "#f0f0f0"}`,
        transition: "all 0.2s ease",
        textDecoration: "none"
    });

    const panelStyle = {
        position: "fixed",
        right: isOpen ? 0 : -350,
        top: 0,
        bottom: 0,
        width: 350,
        background: layout === "dark" ? "#111" : "#fff",
        boxShadow: "-10px 0 50px rgba(0,0,0,0.15)",
        zIndex: 2000,
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${layout === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        fontFamily: "'DM Sans', sans-serif"
    };

    const overlayStyle = {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(2px)",
        zIndex: 1999,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.3s ease"
    };

    return (
        <>
            <div style={overlayStyle} onClick={() => setIsOpen(false)} />

            {/* Vertical Trigger Bar */}
            <div style={barContainerStyle} className="customizer-trigger-bar">
                <div 
                    style={triggerBtnStyle()} 
                    title="Layout Options" 
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#777"; }}
                >
                    <i className="fa-solid fa-fill-drip" />
                </div>
                <Link 
                    to="/dashboard/settings" 
                    style={triggerBtnStyle()} 
                    title="Quick Settings"
                    onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#777"; }}
                >
                    <i className="fa-solid fa-gear" />
                </Link>
                <div 
                    style={{ ...triggerBtnStyle(true), borderBottom: "none" }} 
                    title="Support"
                    onClick={() => alert("Contact Support: 06 00 00 00 00")}
                >
                    <i className="fa-solid fa-headset" />
                </div>
            </div>

            {/* Advanced Drawer Panel */}
            <div style={panelStyle}>
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${layout === "dark" ? "rgba(255,255,255,0.08)" : "#f0f0f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: layout === "dark" ? "#fff" : "#111", textTransform: "uppercase", letterSpacing: "1px" }}>
                            PREVIEW SETTINGS
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: layout === "dark" ? "#666" : "#666" }}>
                            Try It Real Time 👍
                        </p>
                    </div>
                    <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "1.2rem" }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    
                    {/* section: UNLIMITED COLOR */}
                    <SectionLabel label="UNLIMITED COLOR" />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                        <div style={{ display: "flex", gap: 8, flex: 1 }}>
                            <div style={{ width: 45, height: 35, background: PRIMARY, borderRadius: 6, border: "1px solid #ddd" }} />
                            <div style={{ width: 45, height: 35, background: "#FFB000", borderRadius: 6, border: "1px solid #ddd" }} />
                        </div>
                        <input 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            style={{ width: 1, height: 1, opacity: 0, position: "absolute" }} 
                            id="color-inp"
                        />
                        <button 
                            onClick={() => document.getElementById('color-inp').click()}
                            style={{ padding: "8px 20px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                        >
                            Apply
                        </button>
                    </div>

                    {/* section: LAYOUT MODE */}
                    <SectionLabel label="LIGHT LAYOUT" />
                    <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                        <ColorCircle color="#6366f1" active={primaryColor === "#6366f1"} onClick={() => setPrimaryColor("#6366f1")} />
                        <ColorCircle color="#3b82f6" active={primaryColor === "#3b82f6"} onClick={() => setPrimaryColor("#3b82f6")} />
                        <ColorCircle color="#10b981" active={primaryColor === "#10b981"} onClick={() => setPrimaryColor("#10b981")} />
                        <ColorCircle color="#8b5cf6" active={primaryColor === "#8b5cf6"} onClick={() => setPrimaryColor("#8b5cf6")} />
                        <ColorCircle color="#06b6d4" active={primaryColor === "#06b6d4"} onClick={() => setPrimaryColor("#06b6d4")} />
                        <ColorCircle color="#D97706" active={primaryColor === "#D97706"} onClick={() => setPrimaryColor("#D97706")} />
                    </div>

                    {/* section: DARK LAYOUT */}
                    <SectionLabel label="DARK LAYOUT" />
                    <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                        <ColorCircle color="#4f46e5" onClick={() => { setPrimaryColor("#4f46e5"); toggleLayoutMode("dark"); }} />
                        <ColorCircle color="#2563eb" onClick={() => { setPrimaryColor("#2563eb"); toggleLayoutMode("dark"); }} />
                        <ColorCircle color="#059669" onClick={() => { setPrimaryColor("#059669"); toggleLayoutMode("dark"); }} />
                        <ColorCircle color="#7c3aed" onClick={() => { setPrimaryColor("#7c3aed"); toggleLayoutMode("dark"); }} />
                        <ColorCircle color="#0891b2" onClick={() => { setPrimaryColor("#0891b2"); toggleLayoutMode("dark"); }} />
                        <ColorCircle color="#b45309" onClick={() => { setPrimaryColor("#b45309"); toggleLayoutMode("dark"); }} />
                    </div>

                    {/* section: MIX LAYOUT */}
                    <SectionLabel label="MIX LAYOUT" />
                    <div style={{ display: "flex", gap: 15, marginBottom: 28 }}>
                        <LayoutCard type="mix" active={layout === "mix"} onClick={() => toggleLayoutMode("mix")} dark={layout === "dark"} />
                        <LayoutCard type="dark" active={layout === "dark"} onClick={() => toggleLayoutMode("dark")} dark={layout === "dark"} />
                    </div>

                    {/* section: LAYOUT TYPE */}
                    <SectionLabel label="LAYOUT TYPE" />
                    <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                        <LayoutTypeCard label="LTR" active={layoutType === "ltr"} onClick={() => setLayoutType("ltr")} dark={layout === "dark"} />
                        <LayoutTypeCard label="RTL" active={layoutType === "rtl"} onClick={() => setLayoutType("rtl")} dark={layout === "dark"} />
                        <LayoutTypeCard label="BOX" active={layoutType === "box"} onClick={() => setLayoutType("box")} dark={layout === "dark"} />
                    </div>

                    {/* section: SIDEBAR TYPE */}
                    <SectionLabel label="SIDEBAR TYPE" />
                    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        <SidebarTypeCard type="vertical" active={sidebarType === "vertical"} onClick={() => setSidebarType("vertical")} dark={layout === "dark"} />
                        <SidebarTypeCard type="horizontal" active={sidebarType === "horizontal"} onClick={() => setSidebarType("horizontal")} dark={layout === "dark"} />
                    </div>

                    {/* section: SIDEBAR THEME */}
                    <SectionLabel label="SIDEBAR THEME" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
                        <SidebarThemeBtn label="Light" active={sidebarTheme === "light"} onClick={() => setSidebarTheme("light")} dark={layout === "dark"} />
                        <SidebarThemeBtn label="Dark" active={sidebarTheme === "dark"} onClick={() => setSidebarTheme("dark")} dark={layout === "dark"} />
                        <SidebarThemeBtn label="Primary" active={sidebarTheme === "primary"} onClick={() => setSidebarTheme("primary")} dark={layout === "dark"} />
                        <SidebarThemeBtn label="Auto" active={sidebarTheme === "auto"} onClick={() => setSidebarTheme("auto")} dark={layout === "dark"} />
                    </div>

                </div>

                {/* Footer */}
                <div style={{ padding: "20px 24px", borderTop: `1px solid ${layout === "dark" ? "rgba(255,255,255,0.08)" : "#f0f0f0"}` }}>
                    <button 
                        onClick={handleSaveGlobally}
                        style={{ width: "100%", padding: "12px", background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", boxShadow: `0 4px 15px ${PRIMARY}44` }}
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </>
    );
}

function SectionLabel({ label }) {
    return <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#444", marginBottom: 15, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>;
}

function ColorCircle({ color, active, onClick }) {
    return (
        <div 
            onClick={onClick}
            style={{ width: 34, height: 34, background: color, borderRadius: "50%", cursor: "pointer", border: active ? "2px solid #fff" : "none", boxShadow: active ? "0 0 0 2px #3b82f6" : "0 2px 5px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        />
    );
}

function LayoutCard({ type, active, onClick, dark }) {
    const isMix = type === "mix";
    return (
        <div 
            onClick={onClick}
            style={{ width: 85, height: 60, borderRadius: 8, border: `2px solid ${active ? "var(--admin-primary)" : "#eee"}`, background: dark ? "#222" : "#fff", cursor: "pointer", overflow: "hidden", position: "relative" }}
        >
            <div style={{ width: "30%", height: "100%", background: isMix ? "#333" : (dark ? "#444" : "#eee"), position: "absolute", left: 0 }} />
            <div style={{ position: "absolute", bottom: 5, right: 5, fontSize: "0.6rem", color: "#999", fontWeight: 800 }}>{type.toUpperCase()}</div>
        </div>
    );
}

function LayoutTypeCard({ label, active, onClick, dark }) {
    return (
        <div 
            onClick={onClick}
            style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: `1px solid ${active ? "var(--admin-primary)" : (dark ? "#333" : "#eee")}`, background: dark ? (active ? "rgba(255,255,255,0.05)" : "#1a1a1a") : (active ? "rgba(0,0,0,0.02)" : "#fff"), cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
        >
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: active ? "var(--admin-primary)" : "#888" }}>{label}</p>
        </div>
    );
}

function SidebarTypeCard({ type, active, onClick, dark }) {
    const isHorizontal = type === "horizontal";
    return (
        <div 
            onClick={onClick}
            style={{ flex: 1, height: 60, borderRadius: 8, border: `2px solid ${active ? "var(--admin-primary)" : "#eee"}`, background: dark ? "#222" : "#fcfcfc", cursor: "pointer", position: "relative", overflow: "hidden" }}
        >
            <div style={{ width: isHorizontal ? "100%" : "25%", height: isHorizontal ? "30%" : "100%", background: "#444" }} />
            <div style={{ position: "absolute", bottom: 5, right: 5, fontSize: "0.55rem", color: "#999", fontWeight: 800 }}>{type.toUpperCase()}</div>
        </div>
    );
}

function SidebarThemeBtn({ label, active, onClick, dark }) {
    return (
        <div 
            onClick={onClick}
            style={{ 
                padding: "10px", 
                borderRadius: "8px", 
                fontSize: "0.75rem", 
                fontWeight: active ? 700 : 500,
                textAlign: "center",
                cursor: "pointer",
                border: `1px solid ${active ? "var(--admin-primary)" : (dark ? "rgba(255,255,255,0.08)" : "#eee")}`,
                background: active ? "rgba(217,119,6,0.1)" : (dark ? "#1a1a1a" : "#fff"),
                color: active ? "var(--admin-primary)" : (dark ? "#999" : "#666")
            }}
        >
            {label}
        </div>
    );
}
