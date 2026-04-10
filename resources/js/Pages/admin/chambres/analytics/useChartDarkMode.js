import { useState, useEffect } from "react";

export function useChartDarkMode() {
    const [dark, setDark] = useState(() =>
        typeof document !== "undefined"
            ? document.documentElement.classList.contains("dark")
            : false,
    );

    useEffect(() => {
        const obs = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains("dark"));
        });
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => obs.disconnect();
    }, []);

    return dark;
}

export function chartPalette(dark) {
    return {
        grid: dark ? "rgba(255,255,255,0.08)" : "#e4e4e7",
        tick: dark ? "#a1a1aa" : "#71717a",
        tooltipBg: dark ? "#18181b" : "#ffffff",
        tooltipBorder: dark ? "#3f3f46" : "#e4e4e7",
        tooltipLabel: dark ? "#fafafa" : "#18181b",
        subtext: dark ? "#a1a1aa" : "#71717a",
    };
}
