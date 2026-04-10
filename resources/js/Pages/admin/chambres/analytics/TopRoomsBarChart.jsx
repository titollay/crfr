import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useChartDarkMode, chartPalette } from "./useChartDarkMode";

const BAR_COLORS = [
    "#D97706",
    "#ea580c",
    "#f59e0b",
    "#ca8a04",
    "#a16207",
];

export function TopRoomsBarChart({ data = [], loading = false }) {
    const dark = useChartDarkMode();
    const p = useMemo(() => chartPalette(dark), [dark]);

    if (loading) {
        return (
            <div className="h-[300px] min-h-[260px] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
        );
    }

    if (!data.length) {
        return (
            <div className="flex h-[300px] min-h-[260px] w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                Aucune réservation enregistrée (ou toutes annulées).
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    barCategoryGap="18%"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={p.grid}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="num_chambre"
                        tick={{ fill: p.tick, fontSize: 11 }}
                        axisLine={{ stroke: p.grid }}
                        tickLine={{ stroke: p.grid }}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: p.tick, fontSize: 11 }}
                        axisLine={{ stroke: p.grid }}
                        tickLine={{ stroke: p.grid }}
                        width={36}
                    />
                    <Tooltip
                        animationDuration={200}
                        cursor={{
                            fill: dark
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(0,0,0,0.04)",
                        }}
                        contentStyle={{
                            backgroundColor: p.tooltipBg,
                            border: `1px solid ${p.tooltipBorder}`,
                            borderRadius: 10,
                            boxShadow: dark
                                ? "0 8px 24px rgba(0,0,0,0.5)"
                                : "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{
                            color: p.tooltipLabel,
                            fontWeight: 600,
                            fontSize: 12,
                        }}
                        formatter={(value) => [value, "Réservations"]}
                        labelFormatter={(label) => `Chambre ${label}`}
                    />
                    <Bar
                        dataKey="reservations"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {data.map((_, i) => (
                            <Cell
                                key={`cell-${i}`}
                                fill={BAR_COLORS[i % BAR_COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
