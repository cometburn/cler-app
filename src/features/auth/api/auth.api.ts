
import { apiFetch } from '@/lib/api'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return await apiFetch<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
    })
}

export const googleLogin = async (googleToken: string): Promise<LoginResponse> => {
    return await apiFetch<LoginResponse>(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
        method: "POST",
        body: JSON.stringify({ googleToken }),
    });
}