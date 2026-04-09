import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/admin/Dashboard";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Home from "./Home";

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
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
    );
}
