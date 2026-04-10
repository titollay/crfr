import React from "react";
import { ReservationsAnalyticsSection } from "./reservations/analytics/ReservationsAnalyticsSection";

export default function Reservations() {
    return (
        <div
            className="min-h-full px-6 py-7"
            style={{ fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif" }}
        >
            <ReservationsAnalyticsSection />
        </div>
    );
}
