import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dropdown({ trigger, children }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
        <div ref={ref} className="relative">
            <div onClick={() => setOpen(!open)}>{trigger}</div>
            {open && children}
        </div>
    );
}

/*
 * Optional dropdown data (disabled for now).
 * To re-enable: uncomment these arrays + the JSX blocks in the header.
 */
// const NOTIFICATIONS = [
//     { icon: "fa-solid fa-truck", text: "Delivery processing", time: "6 hr" },
//     { icon: "fa-solid fa-cart-shopping", text: "Order Complete", time: "3 hr" },
//     { icon: "fa-solid fa-file-lines", text: "Tickets Generated", time: "1 hr" },
//     {
//         icon: "fa-solid fa-paper-plane",
//         text: "Delivery Complete",
//         time: "45 min",
//     },
// ];
//
// const MESSAGES = [
//     { name: "Emay Walter", msg: "Do you want to go see movie?" },
//     { name: "Jason Borne", msg: "Thank you for rating us." },
//     { name: "Sarah Loren", msg: "What's the project report update?" },
// ];

const LANGS = [
    { code: "en", flag: "🇺🇸", label: "English", sub: "(US)" },
    { code: "de", flag: "🇩🇪", label: "Deutsch", sub: "" },
    { code: "es", flag: "🇪🇸", label: "Español", sub: "" },
    { code: "fr", flag: "🇫🇷", label: "Français", sub: "" },
    { code: "pt", flag: "🇵🇹", label: "Português", sub: "(BR)" },
    { code: "cn", flag: "🇨🇳", label: "中文", sub: "" },
    { code: "ae", flag: "🇦🇪", label: "العربية", sub: "(ae)" },
];

export default function TopBar({ user, collapsed, setCollapsed }) {
    const [lang, setLang] = useState("en");
    const [fullscreen, setFullscreen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Primary brand colour (amber-600)
    const PRIMARY = "#D97706";
    // ✅ إصلاح: handleColor كاملة داخل الـ component
    const handleColor = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle("dark", next);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const iconBtn = `flex items-center justify-center w-9 h-9 rounded-lg hover:text-amber-600 transition-all duration-200 cursor-pointer ${
        darkMode
            ? "text-gray-400 hover:bg-white/5"
            : "text-gray-500 hover:bg-black/5"
    }`;
    const dropMenu = `absolute right-0 top-full mt-2 shadow-xl z-50 overflow-hidden ${
        darkMode
            ? "bg-[#111] border border-white/8"
            : "bg-white border border-black/10"
    }`;
    const dropHdr = `flex items-center gap-3 px-4 py-3 ${
        darkMode ? "border-b border-white/6" : "border-b border-black/8"
    }`;
    const dropItem = `flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
        darkMode
            ? "hover:bg-white/5 border-b border-white/5"
            : "hover:bg-gray-50 border-b border-black/5"
    } last:border-0`;

    return (
        <header
            className="h-16  flex items-center justify-between px-5 gap-4 flex-shrink-0 z-40 relative w-full transition-colors duration-300"
            style={{
                fontFamily: "'DM Sans',sans-serif",
                background: darkMode ? "#0a0a0a" : "#ffffff",
                borderBottom: darkMode
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "1px solid rgba(0,0,0,0.1)",
            }}
        >
            {/* LEFT */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg hover:text-amber-600 transition-all duration-200 cursor-pointer ${
                        darkMode
                            ? "text-gray-400 hover:bg-white/5"
                            : "text-gray-500 hover:bg-black/5"
                    }`}
                    title="Toggle Sidebar"
                >
                    <i className="fa-solid fa-bars text-sm"></i>
                </button>
                <span
                    className={`text-[0.6rem] uppercase tracking-[0.2em] font-medium hidden xs:block ${
                        darkMode ? "text-white/25" : "text-black/25"
                    }`}
                >
                    Admin Panel
                </span>
            </div>

            {/* CENTER: Search */}
            <div
                className={`flex-1 max-w-xs hidden md:flex items-center gap-2 px-3 py-2 ${
                    darkMode
                        ? "bg-white/5 border border-white/8"
                        : "bg-black/5 border border-black/10"
                }`}
            >
                <i
                    className={`fa-solid fa-magnifying-glass text-xs flex-shrink-0 ${
                        darkMode ? "text-white/25" : "text-black/25"
                    }`}
                ></i>
                <input
                    type="text"
                    placeholder="Search here..."
                    className={`bg-transparent border-none outline-none text-xs w-full ${
                        darkMode
                            ? "text-white/70 placeholder:text-white/20"
                            : "text-black/70 placeholder:text-black/20"
                    }`}
                    style={{ fontFamily: "'DM Sans',sans-serif" }}
                />
            </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Home */}
                <button
                    className={iconBtn}
                    onClick={() => navigate("/")}
                    title="Go to Website"
                >
                    <i className="fa-solid fa-house text-sm"></i>
                </button>

                {/* Mobile search */}
                <button className={`${iconBtn} md:hidden`}>
                    <i className="fa-solid fa-magnifying-glass text-sm"></i>
                </button>

                {/* ✅ Dark mode — يعمل */}
                <button
                    onClick={handleColor}
                    className={iconBtn}
                    title={darkMode ? "Light mode" : "Dark mode"}
                >
                    <i
                        className={`text-sm ${
                            darkMode
                                ? "fa-solid fa-sun text-amber-500"
                                : "fa-regular fa-moon"
                        }`}
                    ></i>
                </button>

                {/*
                 * Notifications + Messages (disabled for now)
                 * To re-enable: uncomment the NOTIFICATIONS/MESSAGES arrays and this JSX block.
                 */}
                {/*
                <Dropdown
                    trigger={
                        <div className={`${iconBtn} relative`}>
                            <i className="fa-regular fa-bell text-sm"></i>
                            <span
                                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-white"
                                style={{ background: PRIMARY }}
                            ></span>
                        </div>
                    }
                >
                    <div className={dropMenu} style={{ minWidth: 300 }}>
                        <div className={dropHdr}>
                            <i
                                className="fa-regular fa-bell text-sm"
                                style={{ color: PRIMARY }}
                            ></i>
                            <h6
                                className={`text-sm font-medium ${
                                    darkMode ? "text-white/80" : "text-black/80"
                                }`}
                            >
                                Notifications
                            </h6>
                        </div>
                        {NOTIFICATIONS.map((n, i) => (
                            <div key={i} className={dropItem}>
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <i
                                        className={`${n.icon} text-xs`}
                                        style={{ color: PRIMARY }}
                                    ></i>
                                </div>
                                <p
                                    className={`flex-1 text-xs ${
                                        darkMode
                                            ? "text-white/55"
                                            : "text-black/60"
                                    }`}
                                >
                                    {n.text}
                                </p>
                                <span
                                    className={`text-[0.6rem] flex-shrink-0 ${
                                        darkMode
                                            ? "text-white/25"
                                            : "text-black/25"
                                    }`}
                                >
                                    {n.time}
                                </span>
                            </div>
                        ))}
                        <div className="px-4 py-3 ">
                            <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-widest transition-colors">
                                Check all notifications
                            </button>
                        </div>
                    </div>
                </Dropdown>

                <Dropdown
                    trigger={
                        <div className={`${iconBtn} relative`}>
                            <i className="fa-regular fa-message text-sm"></i>
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white"></span>
                        </div>
                    }
                >
                    <div className={dropMenu} style={{ minWidth: 300 }}>
                        <div className={dropHdr}>
                            <i className="fa-regular fa-message text-amber-500 text-sm"></i>
                            <h6
                                className={`text-sm font-medium ${
                                    darkMode ? "text-white/80" : "text-black/80"
                                }`}
                            >
                                Messages
                            </h6>
                        </div>
                        {MESSAGES.map((m, i) => (
                            <div key={i} className={dropItem}>
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 text-xs font-bold">
                                    {m.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-xs font-medium mb-0.5 ${
                                            darkMode
                                                ? "text-white/70"
                                                : "text-black/70"
                                        }`}
                                    >
                                        {m.name}
                                    </p>
                                    <p
                                        className={`text-[0.65rem] truncate ${
                                            darkMode
                                                ? "text-white/35"
                                                : "text-black/35"
                                        }`}
                                    >
                                        {m.msg}
                                    </p>
                                </div>
                                <button className="text-black/15 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                                    <i className="fa-solid fa-xmark text-xs"></i>
                                </button>
                            </div>
                        ))}
                        <div className="px-4 py-3 ">
                            <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-widest transition-colors">
                                Check Messages
                            </button>
                        </div>
                    </div>
                </Dropdown>
                */}

                {/* Fullscreen */}
                <button
                    className={iconBtn}
                    onClick={toggleFullscreen}
                    title="Fullscreen"
                >
                    <i
                        className={`fa-solid ${
                            fullscreen ? "fa-compress" : "fa-expand"
                        } text-sm`}
                    ></i>
                </button>

                {/* Language */}
                <Dropdown
                    trigger={
                        <div className={iconBtn} title="Language">
                            <i className="fa-solid fa-globe text-sm"></i>
                        </div>
                    }
                >
                    <div className={dropMenu} style={{ minWidth: 200 }}>
                        {LANGS.map((l) => (
                            <div
                                key={l.code}
                                onClick={() => setLang(l.code)}
                                className={`${dropItem} ${
                                    lang === l.code ? "bg-amber-50" : ""
                                }`}
                            >
                                <span className="text-base">{l.flag}</span>
                                <span
                                    className={`text-xs ${
                                        darkMode
                                            ? "text-white/60"
                                            : "text-black/60"
                                    }`}
                                >
                                    {l.label}
                                </span>
                                {l.sub && (
                                    <span
                                        className={`text-[0.6rem] ${
                                            darkMode
                                                ? "text-white/25"
                                                : "text-black/25"
                                        }`}
                                    >
                                        {l.sub}
                                    </span>
                                )}
                                {lang === l.code && (
                                    <i className="fa-solid fa-check text-amber-500 text-xs ml-auto"></i>
                                )}
                            </div>
                        ))}
                    </div>
                </Dropdown>

                <span
                    className={`w-px h-5 mx-1 ${
                        darkMode ? "bg-white/10" : "bg-black/10"
                    }`}
                />

                {/* Profile */}
                <Dropdown
                    trigger={
                        <div
                            className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors ${
                                darkMode
                                    ? "hover:bg-white/5"
                                    : "hover:bg-black/5"
                            }`}
                        >
                            <div className="w-7 h-7 bg-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user?.first_name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="hidden sm:block leading-tight">
                                <p
                                    className={`text-xs font-medium ${
                                        darkMode
                                            ? "text-white/70"
                                            : "text-black/70"
                                    }`}
                                >
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-[0.55rem] text-amber-600 uppercase tracking-wider">
                                    {user?.role || "admin"}
                                </p>
                            </div>
                            <i
                                className={`fa-solid fa-chevron-down text-[0.55rem] hidden sm:block ${
                                    darkMode ? "text-white/25" : "text-black/25"
                                }`}
                            ></i>
                        </div>
                    }
                >
                    <div className={dropMenu} style={{ minWidth: 200 }}>
                        <div
                            className={`px-4 py-3 ${
                                darkMode
                                    ? "border-b border-white/8"
                                    : "border-b border-black/8"
                            }`}
                        >
                            <p
                                className={`text-sm font-medium ${
                                    darkMode ? "text-white/80" : "text-black/80"
                                }`}
                            >
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p
                                className={`text-xs mt-0.5 ${
                                    darkMode ? "text-white/35" : "text-black/35"
                                }`}
                            >
                                {user?.email}
                            </p>
                        </div>
                        {[
                            {
                                icon: "fa-solid fa-user",
                                label: "Account",
                                href: "#",
                            },
                            {
                                icon: "fa-regular fa-envelope",
                                label: "Inbox",
                                href: "#",
                            },
                            {
                                icon: "fa-solid fa-gear",
                                label: "Settings",
                                href: "#",
                            },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`${dropItem} no-underline`}
                            >
                                <i
                                    className={`${item.icon} text-xs w-4 text-center ${
                                        darkMode
                                            ? "text-white/30"
                                            : "text-black/30"
                                    }`}
                                ></i>
                                <span
                                    className={`text-xs ${
                                        darkMode
                                            ? "text-white/60"
                                            : "text-black/60"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </a>
                        ))}
                        <div
                            className={`border-t ${
                                darkMode ? "border-white/8" : "border-black/8"
                            }`}
                        >
                            <button
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    navigate("/login");
                                }}
                                className={`${dropItem} w-full text-left border-0`}
                            >
                                <i className="fa-solid fa-right-from-bracket text-red-400 text-xs w-4 text-center"></i>
                                <span className="text-xs text-red-400">
                                    Log out
                                </span>
                            </button>
                        </div>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
}
