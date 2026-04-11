import React, { useEffect, useState } from "react";

import axios from "axios";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SideBar from "./components/sideBar";
import TopBar from "./components/topBar";
import AdminFooter from "./components/AdminFooter";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            // Auto-collapse on medium screens, but keep state as is for manual toggle
            if (window.innerWidth < 1024 && window.innerWidth >= 761) {
                setCollapsed(true);
            } else if (window.innerWidth >= 1024) {
                setCollapsed(false);
            }
            // On mobile (< 761), we keep it collapsed by default unless toggled
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        axios
            .get("/api/user")
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.error(err);
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    return (
        <div className="flex h-screen overflow-hidden ">
            <SideBar key={location.pathname} collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex flex-col flex-1 bg-[#F4F6FA] dark:bg-[#0a0a0a] min-w-0 transition-colors duration-300">
                <TopBar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    user={user}
                />

                {/* هنا نضيف scroll */}
                <div className="flex-1 overflow-y-auto ">
                    <Outlet />
                    <AdminFooter />
                </div>
            </div>
        </div>
    );
}
