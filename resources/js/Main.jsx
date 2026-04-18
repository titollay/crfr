import React, { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Pages/admin/Dashboard";
import Login from "./Pages/Auth/Login";
import Home from "./Home";

const Chambres = lazy(
    () => import("./Pages/admin/components/componentDash/Chambres"),
);
const Reservations = lazy(
    () => import("./Pages/admin/components/componentDash/Reservations"),
);
const Intervenants = lazy(
    () => import("./Pages/admin/components/componentDash/Intervenants"),
);

function LegacyIndexRedirect() {
    const { pathname, search, hash } = useLocation();
    const next = pathname.replace(/^\/index(\/|$)/, "/dashboard$1");
    const to = `${next}${search}${hash}`;
    return <Navigate to={to || "/dashboard"} replace />;
}


const FormationsPage = lazy(() => import("./Pages/admin/components/componentDash/FormationsPage"));
const OrganisationsPage = lazy(() => import("./Pages/admin/components/componentDash/OrganisationsPage"));
const FormateursPage = lazy(() => import("./Pages/admin/components/componentDash/FormateursPage"));
const UsersPage = lazy(() => import("./Pages/admin/components/componentDash/Users"));
const RolesPage = lazy(() => import("./Pages/admin/components/componentDash/Roles"));
const Statistics = lazy(() => import("./Pages/admin/components/componentDash/Statistics"));


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

                <Route path="/index" element={<LegacyIndexRedirect />} />
                <Route path="/index/*" element={<LegacyIndexRedirect />} />

                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<Navigate to="chambres" replace />} />
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
                    <Route
                        path="formations"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <FormationsPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="organisations"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <OrganisationsPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="formateurs"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <FormateursPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <UsersPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="roles"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <RolesPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="statistics"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Statistics />
                            </Suspense>
                        }
                    />
                </Route>
            </Routes>
        </div>
    );
}
