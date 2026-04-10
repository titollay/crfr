import React from "react";
import { motion } from "framer-motion";

const ACCENT = "#D97706";

const items = [
    {
        key: "totalRooms",
        label: "Total chambres",
        icon: "fa-solid fa-hotel",
        iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
        key: "availableRooms",
        label: "Disponibles",
        icon: "fa-solid fa-circle-check",
        iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        key: "occupiedRooms",
        label: "Occupées",
        icon: "fa-solid fa-door-open",
        iconBg: "bg-red-500/15 dark:bg-red-500/20",
        iconColor: "text-red-600 dark:text-red-400",
    },
    {
        key: "occupancyRate",
        label: "Taux d’occupation",
        icon: "fa-solid fa-percent",
        iconBg: "bg-violet-500/15 dark:bg-violet-500/20",
        iconColor: "text-violet-600 dark:text-violet-400",
        suffix: "%",
    },
];

export function AnalyticsKpiCards({ kpi }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item, i) => {
                const raw = kpi[item.key];
                const display =
                    item.suffix !== undefined
                        ? `${raw}${item.suffix}`
                        : String(raw);
                return (
                    <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.35,
                            delay: i * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80"
                    >
                        <div
                            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07]"
                            style={{ background: ACCENT }}
                        />
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {display}
                                </p>
                            </div>
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                            >
                                <i
                                    className={`${item.icon} text-lg ${item.iconColor}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
