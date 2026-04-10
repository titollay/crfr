import React, { useMemo } from "react";
import { motion } from "framer-motion";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function monthMatrix(year, monthIndex, daysData) {
    const first = new Date(year, monthIndex, 1);
    const pad = (first.getDay() + 6) % 7;
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < pad; i += 1) cells.push(null);
    for (let d = 1; d <= lastDate; d += 1) {
        const info = daysData.find((x) => x.day === d);
        cells.push(info ?? { day: d, occupied: false });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

export function OccupancyHeatmapCalendar({ year, monthIndex, daysData }) {
    const matrix = useMemo(
        () => monthMatrix(year, monthIndex, daysData),
        [year, monthIndex, daysData],
    );

    const title = new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, monthIndex, 1));

    return (
        <div className="w-full">
            <p className="mb-3 text-center text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                {title}
            </p>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {WEEKDAYS.map((w) => (
                    <div
                        key={w}
                        className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                    >
                        {w}
                    </div>
                ))}
                {matrix.map((cell, i) => {
                    if (!cell) {
                        return (
                            <div
                                key={`empty-${i}`}
                                className="aspect-square rounded-lg bg-transparent"
                            />
                        );
                    }
                    const { day, occupied, rate, occupiedRooms } = cell;
                    const pct =
                        rate != null && Number.isFinite(Number(rate))
                            ? `${Number(rate)}%`
                            : null;
                    const rooms =
                        occupiedRooms != null
                            ? `${occupiedRooms} ch.`
                            : null;
                    const label = [
                        `Jour ${day}`,
                        pct && `occupation ${pct}`,
                        rooms,
                        occupied ? "(réservation active)" : "(libre)",
                    ]
                        .filter(Boolean)
                        .join(" — ");
                    return (
                        <motion.div
                            key={day}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.2,
                                delay: Math.min(i * 0.012, 0.4),
                            }}
                            title={label}
                            className={`flex aspect-square cursor-default items-center justify-center rounded-lg text-xs font-semibold shadow-sm transition-transform hover:z-10 hover:scale-105 hover:ring-2 hover:ring-amber-500/40 ${
                                occupied
                                    ? "bg-red-500 text-white dark:bg-red-600"
                                    : "bg-emerald-500 text-white dark:bg-emerald-600"
                            } `}
                        >
                            {day}
                        </motion.div>
                    );
                })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-500 dark:bg-emerald-600" />
                    Disponible
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-red-500 dark:bg-red-600" />
                    Occupée
                </span>
            </div>
        </div>
    );
}
