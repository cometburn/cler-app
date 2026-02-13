interface ApiErrorResponse {
    errors: Array<{
        code: string;
        path: string[];
        message: string;
    }>;
}

export interface ApiError extends Error {
    status: number;
    response?: {
        status: number;
        data: ApiErrorResponse;
    };
}
