import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AnalyticsKpiCards } from "../../chambres/analytics/AnalyticsKpiCards";
import { OccupancyLineChart } from "../../chambres/analytics/OccupancyLineChart";
import { TopRoomsBarChart } from "../../chambres/analytics/TopRoomsBarChart";
import { OccupancyHeatmapCalendar } from "../../chambres/analytics/OccupancyHeatmapCalendar";

const MOCK_MONTHLY_OCCUPANCY = [
    { month: "Jan", rate: 61 },
    { month: "Fév", rate: 58 },
    { month: "Mar", rate: 67 },
    { month: "Avr", rate: 69 },
    { month: "Mai", rate: 73 },
    { month: "Juin", rate: 79 },
    { month: "Juil", rate: 85 },
    { month: "Août", rate: 88 },
    { month: "Sep", rate: 76 },
    { month: "Oct", rate: 70 },
    { month: "Nov", rate: 65 },
    { month: "Déc", rate: 60 },
];

const MOCK_KPI = {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
};

function panelClass() {
    return [
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm",
        "dark:border-zinc-800 dark:bg-zinc-900/80",
    ].join(" ");
}

function kpiFromLiveStats(liveStats) {
    if (!liveStats || liveStats.total == null) return null;
    const total = Number(liveStats.total) || 0;
    const avail = Number(liveStats.disponible) || 0;
    const occ = Number(liveStats.occupee) || 0;
    return {
        totalRooms: total,
        availableRooms: avail,
        occupiedRooms: occ,
        occupancyRate:
            total > 0 ? Math.min(100, Math.round((occ / total) * 100)) : 0,
    };
}

export function ReservationsAnalyticsSection({ liveStats = null }) {
    const now = new Date();
    const [calYear] = useState(() => now.getFullYear());
    const [calMonthIndex] = useState(() => now.getMonth());

    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [payload, setPayload] = useState(null);

    const load = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setFetchError(true);
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(false);
        try {
            const { data } = await axios.get("/api/chambres/analytics", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                params: {
                    calendar_year: calYear,
                    calendar_month: calMonthIndex + 1,
                },
            });
            setPayload(data);
        } catch {
            setFetchError(true);
            setPayload(null);
        } finally {
            setLoading(false);
        }
    }, [calYear, calMonthIndex]);

    useEffect(() => {
        load();
    }, [load]);

    const kpi = payload?.kpi ?? kpiFromLiveStats(liveStats) ?? MOCK_KPI;
    const monthly =
        payload?.monthlyOccupancy?.length > 0
            ? payload.monthlyOccupancy
            : fetchError
              ? MOCK_MONTHLY_OCCUPANCY
              : [];
    const topRooms = payload && !fetchError ? payload.topRooms ?? [] : [];
    const calendarDays = payload?.calendar?.days?.length > 0 ? payload.calendar.days : [];

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
            aria-labelledby="reservations-analytics-heading"
        >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                            Reservations Analytics
                        </span>
                    </div>
                    <h2
                        id="reservations-analytics-heading"
                        className="text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl"
                    >
                        Analyse des réservations
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                        Cette section est liée aux données de <strong>reservations</strong> (date_debut/date_fin)
                        et <strong>chambres</strong>.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => load()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`} />
                    Actualiser
                </button>
            </div>

            {fetchError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
                    Échec du chargement analytique.
                </div>
            )}

            <div className="mb-6">
                <AnalyticsKpiCards kpi={kpi} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className={panelClass()}>
                    <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-50">Taux d’occupation dans le temps</h3>
                    {loading && payload === null ? (
                        <div className="h-[300px] min-h-[260px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
                    ) : monthly.length > 0 ? (
                        <OccupancyLineChart data={monthly} />
                    ) : (
                        <p className="flex h-[260px] items-center justify-center text-sm text-zinc-500">Aucune série mensuelle disponible.</p>
                    )}
                </div>

                <div className={panelClass()}>
                    <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-50">Top 5 chambres réservées</h3>
                    <TopRoomsBarChart data={topRooms} loading={loading && !fetchError && payload === null} />
                </div>
            </div>

            <div className={`mt-6 ${panelClass()}`}>
                <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-50">Calendrier d’occupation</h3>
                <div className="mx-auto max-w-3xl">
                    {loading && payload === null ? (
                        <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
                    ) : calendarDays.length > 0 ? (
                        <OccupancyHeatmapCalendar
                            year={payload?.calendar?.year ?? calYear}
                            monthIndex={(payload?.calendar?.month ?? calMonthIndex + 1) - 1}
                            daysData={calendarDays}
                        />
                    ) : (
                        <p className="py-8 text-center text-sm text-zinc-500">Calendrier indisponible.</p>
                    )}
                </div>
            </div>
        </motion.section>
    );
}
