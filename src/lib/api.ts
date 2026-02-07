import { toast } from "sonner";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:9001/api";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(null);
    });
    failedQueue = [];
};

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(),
        credentials: "include", // important if using httpOnly refresh cookies
    });

    // Handle 401 → token refresh
    if (response.status === 401) {
        const originalRequest = { ...options, endpoint };

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

                // Retry queued requests
                processQueue();

                // Retry the original request with new token
                response = await fetch(`${API_BASE_URL}${originalRequest.endpoint}`,
                    originalRequest
                );
            } catch (err) {
                processQueue(err);
                localStorage.removeItem("token");
                toast.error("Your session has expired. Please log in again.");
                window.location.href = "/login";
                throw new Error("Session expired");
            } finally {
                isRefreshing = false;
            }
        } else {
            // Queue the request until refresh completes
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => apiFetch(endpoint, options));
        }
    }

    // Handle other errors
    if (!response.ok) {
        let message = "Something went wrong";

        try {
            const errorData = await response.json();
            message = errorData.message || errorData.error || message;
        } catch {
            // ignore json parse error
        }

        toast.error(message, {
            className: "!bg-red-50 !text-red-600 !border-none dark:!bg-red-950 dark:!text-red-400",
        });

        throw new Error(message);
    }

    // Return json or empty response
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json() as Promise<T>;
    }

    return {} as T; // or handle other response types if needed
}

// Optional: shorthand helpers

export const get = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    });

export const put = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
    });

export const del = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" });