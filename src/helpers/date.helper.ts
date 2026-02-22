/**
 * Format a date using a custom format string
 * 
 * Supported tokens:
 * - YYYY: 4-digit year (e.g., 2026)
 * - YY: 2-digit year (e.g., 26)
 * - MM: 2-digit month (01-12)
 * - M: Month without leading zero (1-12)
 * - DD: 2-digit day (01-31)
 * - D: Day without leading zero (1-31)
 * - HH: 2-digit hours 24-hour format (00-23)
 * - H: Hours 24-hour format without leading zero (0-23)
 * - hh: 2-digit hours 12-hour format (01-12)
 * - h: Hours 12-hour format without leading zero (1-12)
 * - mm: 2-digit minutes (00-59)
 * - m: Minutes without leading zero (0-59)
 * - ss: 2-digit seconds (00-59)
 * - s: Seconds without leading zero (0-59)
 * - A: AM/PM uppercase
 * - a: am/pm lowercase
 * 
 * @example
 * formatDate(new Date(), 'MM/DD/YYYY') // "02/14/2026"
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // "2026-02-14 15:30:45"
 * formatDate(new Date(), 'DD/MM/YYYY hh:mm A') // "14/02/2026 03:30 PM"
 */
export const formatDate = (
    date: string | Date | undefined | null,
    format: string = 'MM/DD/YYYY'
): string => {
    if (!date) return "";

    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours24 = d.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    const tokens: Record<string, string> = {
        YYYY: String(year),
        YY: String(year).slice(-2),
        MM: String(month).padStart(2, '0'),
        M: String(month),
        DD: String(day).padStart(2, '0'),
        D: String(day),
        HH: String(hours24).padStart(2, '0'),
        H: String(hours24),
        hh: String(hours12).padStart(2, '0'),
        h: String(hours12),
        mm: String(minutes).padStart(2, '0'),
        m: String(minutes),
        ss: String(seconds).padStart(2, '0'),
        s: String(seconds),
        A: ampm,
        a: ampm.toLowerCase(),
    };

    // Replace tokens in format string
    const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

    let result = format;
    sortedTokens.forEach(token => {
        result = result.replace(new RegExp(token, 'g'), tokens[token]);
    });

    return result;
};

// Legacy functions for backward compatibility
export const formatDateMMDDYYYY = (date: string | Date | undefined | null) => {
    return formatDate(date, 'MM/DD/YYYY');
};

export const formatDateTimeMMDDYYYY = (date: string | Date | undefined | null) => {
    return formatDate(date, 'MM/DD/YYYY HH:mm');
};

export const manilaDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return formatter.format(date)
}

export const isOverTime = (timestamp: string | Date, minutes: number) => {
    const baseTime = new Date(timestamp).getTime();
    const expiryTime = baseTime + minutes * 60 * 1000;
    const now = Date.now();

    return now > expiryTime;
}

export const isEndingSoon = (endDatetime: string | Date, minutes = 10): boolean => {
    const end = new Date(endDatetime).getTime();
    const now = Date.now();
    const diff = end - now;
    return diff <= minutes * 60000 && diff > 0;
};