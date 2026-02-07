
import { apiFetch } from '@/lib/api'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
};

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiFetch<LoginResponse>(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
    })
}

export async function googleLogin(googleToken: string): Promise<LoginResponse> {
    const res = await apiFetch<LoginResponse>(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
        method: "POST",
        body: JSON.stringify({ googleToken }),
    });
    return res;
}