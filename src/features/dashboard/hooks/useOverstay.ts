import { useEffect, useState } from "react";

export const useOverstay = (endDatetime?: string | Date | null) => {
    const [overstayMinutes, setOverstayMinutes] = useState(0);

    useEffect(() => {
        if (!endDatetime) return;

        const calculate = () => {
            const diff = Date.now() - new Date(endDatetime).getTime();
            setOverstayMinutes(Math.max(0, Math.floor(diff / 60000)));
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [endDatetime]);

    const isOverdue = overstayMinutes > 0;
    const billedHours = Math.floor(overstayMinutes / 60) + (overstayMinutes % 60 >= 15 ? 1 : 0);

    return { overstayMinutes, billedHours, isOverdue };
};