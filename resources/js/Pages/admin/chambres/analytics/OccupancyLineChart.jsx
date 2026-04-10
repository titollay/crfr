import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useChartDarkMode, chartPalette } from "./useChartDarkMode";

const ACCENT = "#D97706";

export function OccupancyLineChart({ data }) {
    const dark = useChartDarkMode();
    const p = useMemo(() => chartPalette(dark), [dark]);

    return (
        <div className="h-[300px] w-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={p.grid}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: p.tick, fontSize: 11 }}
                        axisLine={{ stroke: p.grid }}
                        tickLine={{ stroke: p.grid }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fill: p.tick, fontSize: 11 }}
                        axisLine={{ stroke: p.grid }}
                        tickLine={{ stroke: p.grid }}
                        width={44}
                    />
                    <Tooltip
                        animationDuration={200}
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
                        formatter={(value) => [`${value}%`, "Occupation"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        name="Taux"
                        stroke={ACCENT}
                        strokeWidth={2.5}
                        dot={{
                            r: 4,
                            fill: ACCENT,
                            strokeWidth: 2,
                            stroke: dark ? "#18181b" : "#fff",
                        }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
