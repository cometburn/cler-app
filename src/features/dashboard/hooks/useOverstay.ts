import { useEffect, useMemo, useState } from "react";

export const useOverstay = (endDatetime?: string | Date | null) => {
    const [overstayMinutes, setOverstayMinutes] = useState(0);

    useEffect(() => {
        if (!endDatetime) {
            setOverstayMinutes(0);
            return;
        }

        const end = new Date(endDatetime);

        const calculate = () => {
            const now = new Date();
            const diffMs = now.getTime() - end.getTime();
            const minutes = Math.max(0, Math.floor(diffMs / 60000));
            setOverstayMinutes(minutes);
        };

        calculate();

        const interval = setInterval(calculate, 60000);

        return () => clearInterval(interval);
    }, [endDatetime]);

    const billedHours = useMemo(() => {
        return Math.floor(overstayMinutes / 60) + (overstayMinutes % 60 >= 15 ? 1 : 0);
    }, [overstayMinutes]);

    const isOverdue = overstayMinutes > 0;

    return { overstayMinutes, billedHours, isOverdue };
};