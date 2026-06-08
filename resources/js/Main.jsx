import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Pages/admin/Dashboard";
import Login from "./Pages/Auth/Login";
import Home from "./Home";

import Chambres from "./Pages/admin/components/componentDash/Chambres";
import Reservations from "./Pages/admin/components/componentDash/Reservations";
import Intervenants from "./Pages/admin/components/componentDash/Intervenants";
import FormationsPage from "./Pages/admin/components/componentDash/FormationsPage";
import OrganisationsPage from "./Pages/admin/components/componentDash/OrganisationsPage";
import FormateursPage from "./Pages/admin/components/componentDash/FormateursPage";
import UsersPage from "./Pages/admin/components/componentDash/Users";
import ReportsPage from "./Pages/admin/components/componentDash/Reports";
import SettingsPage from "./Pages/admin/components/componentDash/Settings";
import ProfilePage from "./Pages/admin/components/componentDash/Profile";
import HomeDashboard from "./Pages/admin/components/componentDash/HomeDashboard";

function LegacyIndexRedirect() {
    const { pathname, search, hash } = useLocation();
    const next = pathname.replace(/^\/index(\/|$)/, "/dashboard$1");
    const to = `${next}${search}${hash}`;
    return <Navigate to={to || "/dashboard"} replace />;
}


function PageLoader() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh",
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    border: "3px solid #f3e8d0",
                    borderTop: "3px solid #D97706",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

import axios from "axios";

export default function Main() {
    const { i18n } = useTranslation();
    const [langFade, setLangFade] = useState(false);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const res = await axios.get("/api/settings");
                const primaryColor = res.data.find(s => s.key === 'primary_color')?.value;
                const siteName = res.data.find(s => s.key === 'site_name')?.value;
                
                if (primaryColor) {
                    document.documentElement.style.setProperty('--admin-primary', primaryColor);
                }
                if (siteName) {
                    document.title = siteName;
                }
            } catch (err) {
                console.error("Failed to load global settings", err);
            }
        };
        fetchGlobalSettings();
    }, []);

    useEffect(() => {
        const handler = () => {
            setLangFade(true);
            window.setTimeout(() => setLangFade(false), 200);
        };
        i18n.on("languageChanged", handler);
        return () => i18n.off("languageChanged", handler);
    }, [i18n]);

    return (
        <div
            className={`min-h-screen transition-opacity duration-200 ease-out ${
                langFade ? "opacity-95" : "opacity-100"
            }`}
        >
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route path="/index" element={<LegacyIndexRedirect />} />
                <Route path="/index/*" element={<LegacyIndexRedirect />} />

                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<HomeDashboard />} />
                    <Route path="chambres" element={<Chambres />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="intervenants" element={<Intervenants />} />
                    <Route path="formations" element={<FormationsPage />} />
                    <Route path="organisations" element={<OrganisationsPage />} />
                    <Route path="formateurs" element={<FormateursPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>
            </Routes>
        </div>
    );
}
