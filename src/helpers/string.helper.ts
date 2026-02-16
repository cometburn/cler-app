export const removeUnderscore = (str: string) => {
    return str
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}