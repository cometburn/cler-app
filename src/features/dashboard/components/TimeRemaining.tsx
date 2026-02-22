import { useEffect, useState } from "react";

interface TimeRemainingProps {
    endDatetime: string | Date;
    className?: string;
}

export const TimeRemaining = ({ endDatetime, className }: TimeRemainingProps) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(endDatetime).getTime() - Date.now();
            setIsOverdue(diff < 0);

            const abs = Math.abs(diff);
            const hours = Math.floor(abs / 3600000);
            const minutes = Math.floor((abs % 3600000) / 60000);
            const seconds = Math.floor((abs % 60000) / 1000);

            setTimeLeft(
                hours > 0
                    ? `${hours}h ${minutes}m ${seconds}s`
                    : `${minutes}m ${seconds}s`
            );
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [endDatetime]);

    return (
        <span className={` ${isOverdue ? "bg-red-500" : "bg-orange-500"} ${className ?? ""}`}>
            {isOverdue ? `Overstay: ${timeLeft}` : `Remaining: ${timeLeft}`}
        </span>
    );
};