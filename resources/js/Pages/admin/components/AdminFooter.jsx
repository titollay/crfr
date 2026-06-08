import { motion } from "framer-motion";

export default function AdminFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="px-6 py-6 mt-auto border-t border-gray-200 dark:border-white/5  dark:bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <p className="text-[0.7rem] text-gray-400 dark:text-white/20 tracking-wider uppercase">
                        &copy; {year}{" "}
                        <span
                            style={{ color: "var(--admin-primary, #D97706)" }}
                            className="font-semibold"
                        >
                            CRFR
                        </span>{" "}
                        Admin v2.1.0
                    </p>

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[0.65rem] text-gray-400 dark:text-white/20 tracking-widest uppercase">
                            System Online
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <a
                        href="#"
                        className="text-[0.65rem] text-gray-400 dark:text-white/20 tracking-widest uppercase transition-colors"
                        style={{ "--hover-color": "var(--admin-primary)" }}
                        onMouseEnter={(e) =>
                            (e.target.style.color = "var(--admin-primary)")
                        }
                        onMouseLeave={(e) => (e.target.style.color = "")}
                    >
                        Documentation
                    </a>
                    <a
                        href="#"
                        className="text-[0.65rem] text-gray-400 dark:text-white/20 tracking-widest uppercase transition-colors"
                        style={{ "--hover-color": "var(--admin-primary)" }}
                        onMouseEnter={(e) =>
                            (e.target.style.color = "var(--admin-primary)")
                        }
                        onMouseLeave={(e) => (e.target.style.color = "")}
                    >
                        Support
                    </a>
                    <div className="px-2 py-0.5 rounded bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <p className="text-[0.6rem] text-gray-400 dark:text-white/30 font-mono">
                            Taha Allay | Abdelali ouamassi
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
