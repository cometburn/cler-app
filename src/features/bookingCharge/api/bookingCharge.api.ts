import { apiFetch } from "@/lib/api";
import { BookingCharge } from "../types/bookingCharge.types";

/**
 * Create booking charge
 * @param payload 
 * @returns 
 */
export const createBookingCharge = async (payload: BookingCharge): Promise<BookingCharge> => {
    return await apiFetch<BookingCharge>("/booking-charges", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}