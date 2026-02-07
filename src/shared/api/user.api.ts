import { apiFetch } from "@/lib/api"; // assuming you have this auth-aware fetch wrapper
import type { User } from "@/shared/types/user.types"; // adjust path if needed

const USER_ENDPOINTS = {
    CURRENT: '/auth/me',
    SET_DEFAULT_HOTEL: '/users/hotel/default',
};

/**
 * Fetch the current authenticated user
 */
export const fetchCurrentUser = (): Promise<User | null> => {
    return apiFetch<User>(USER_ENDPOINTS.CURRENT);
}

/**
 * Set the default hotel for the current user
 */
export const setDefaultHotelApi = (hotelId: number): Promise<void> => {
    return apiFetch<void>(USER_ENDPOINTS.SET_DEFAULT_HOTEL, {
        method: "POST",
        body: JSON.stringify({ hotel_id: hotelId }),
    });
}