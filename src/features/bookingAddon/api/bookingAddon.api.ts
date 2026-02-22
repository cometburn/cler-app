import { apiFetch } from "@/lib/api";
import { BookingAddon, BookingAddonResponse } from "../types/bookingAddon.types";

/**
 * Fetch Products with addon category
 * @param page 
 * @param limit 
 * @param category 
 * @returns 
 */
export const fetchBookingAddons = async (bookingId: number): Promise<BookingAddonResponse> => {
    return await apiFetch<BookingAddonResponse>(`/booking-addons/${bookingId}`, {
        method: 'GET',
    });
}

/**
 * Create booking addon
 * @param payload 
 * @returns 
 */
export const createBookingAddon = async (payload: BookingAddon): Promise<BookingAddon> => {
    return await apiFetch<BookingAddon>("/booking-addons", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Delete booking addon
 * @param id 
 * @returns 
 */
export const deleteBookingAddon = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/booking-addons/${id}`, {
        method: 'DELETE'
    })
}