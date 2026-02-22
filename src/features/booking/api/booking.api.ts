import { apiFetch } from "@/lib/api";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking } from "../types/booking.types";

/**
 * Fetch room rates by room type
 * @param id 
 * @returns 
 */
export const fetchRoomRatesByRoomType = async (id: number): Promise<RoomRate[]> => {
    return await apiFetch<RoomRate[]>(`/room-rates/room-type/${id}`, {
        method: "GET",
    });
};

/**
 * Fetch booking by id
 * @param payload 
 * @returns 
 */
export const fetchBookingById = async (id: number): Promise<Booking> => {
    return await apiFetch<Booking>(`/bookings/${id}`, {
        method: 'GET',
    })
}


/**
 * Create booking
 * @param payload 
 * @returns 
 */
export const createBooking = async (payload: Booking): Promise<Booking> => {
    return await apiFetch<Booking>("/bookings", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update booking
 * @param payload 
 * @returns 
 */
export const updateBooking = async (payload: Booking): Promise<Booking> => {
    return await apiFetch<Booking>(`/bookings/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}