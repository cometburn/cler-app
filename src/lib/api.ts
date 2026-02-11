import { toast } from "sonner";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:9001/api";

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    endpoint: string;
    options: RequestInit;
}> = [];

const processQueue = (error: any = null, newToken: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            // Retry the request with the new token
            prom.resolve(apiFetch(prom.endpoint, prom.options));
        }
    });
    failedQueue = [];
};

class ApiError extends Error {
    status: number;
    data?: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem("token");

    const getHeaders = () => {
        const headers: Record<string, string> = {
            ...options.headers as Record<string, string>,
        };

        // Only add Content-Type if body is not FormData
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(),
        credentials: "include",
    });

    // Handle 401 → token refresh
    if (response.status === 401 && token) {
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                // Call your refresh token endpoint
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!refreshResponse.ok) {
                    throw new Error("Refresh token failed");
                }

                const { accessToken } = await refreshResponse.json();
                localStorage.setItem("token", accessToken);

                // Process queued requests with new token
                processQueue(null, accessToken);

                // Retry the original request with new token
                const retryHeaders = getHeaders();
                retryHeaders["Authorization"] = `Bearer ${accessToken}`;

                response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: retryHeaders,
                    credentials: "include",
                });
            } catch (err) {
                processQueue(err);
                localStorage.removeItem("token");
                toast.error("Your session has expired. Please log in again.");

                // Prevent redirect loop
                if (!window.location.pathname.includes('/')) {
                    window.location.href = "/";
                }

                throw new ApiError("Session expired", 401);
            } finally {
                isRefreshing = false;
            }
        } else {
            // Queue the request until refresh completes
            return new Promise<T>((resolve, reject) => {
                failedQueue.push({ resolve, reject, endpoint, options });
            });
        }
    }

    // Handle other errors
    if (!response.ok) {
        let message = "Something went wrong";
        let errorData;

        try {
            errorData = await response.json();
            message = errorData.message || errorData.error || message;
        } catch {
            // If json parse fails, use status text
            message = response.statusText || message;
        }

        throw new ApiError(message, response.status, errorData);
    }

    // Return json or empty response
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json() as Promise<T>;
    }

    return {} as T;
}

// Optional: shorthand helpers

export const get = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
    });

export const put = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
    });

export const patch = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body),
    });

export const del = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" });