import React, { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/admin/Dashboard";
import Login from "./Pages/Auth/Login";
import Home from "./Home";

const Chambres = lazy(() => import("./Pages/admin/Chambres"));
const Reservations = lazy(() => import("./Pages/admin/Reservations"));
const Intervenants = lazy(() => import("./Pages/admin/Intervenants"));

function PageLoader() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #f3e8d0", borderTop: "3px solid #D97706", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function Main() {
    const { i18n } = useTranslation();
    const [langFade, setLangFade] = useState(false);

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
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Admin panel nested under /index */}
                <Route path="/index" element={<Dashboard />}>
                    <Route
                        path="chambres"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Chambres />
                            </Suspense>
                        }
                    />
                    <Route
                        path="reservations"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Reservations />
                            </Suspense>
                        }
                    />
                    <Route
                        path="intervenants"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Intervenants />
                            </Suspense>
                        }
                    />
                </Route>
            </Routes>
        </div>
    );
}

