export const getErrorMessage = (errors: any[], fallback: string = "An error occurred") => {
    const code = errors?.[0]?.code;
    let message = "";

    if (code === 'FOREIGN_KEY_CONSTRAINT') {
        message = "Unable to delete. Record is in use.";
    } else {
        message = errors?.[0]?.message || fallback;
    }

    return message;
};