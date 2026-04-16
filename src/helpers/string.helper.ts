export const removeUnderscore = (str: string) => {
    return str
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Formats a number with commas, a currency symbol, and configurable decimal places.
 *
 * @param currencySymbol - The currency symbol to prepend (e.g., "$", "€", "₱")
 * @param value - The number to format with commas
 * @param decimalPlaces - Number of decimal places to display (default: 2)
 * @returns A formatted string with the currency symbol and commas
 */
export const formatCurrency = (
    value: number,
    options?: { currencySymbol?: string; decimalPlaces?: number }
): string => {
    const { currencySymbol = "₱", decimalPlaces = 2 } = options ?? {};

    const formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });

    return `${currencySymbol}${formatted}`;
};