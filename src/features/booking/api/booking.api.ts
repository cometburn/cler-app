import { apiFetch } from "@/lib/api";
import { Booking, BookingResponse, CancelBooking, CreateBooking, TransferBooking, UpdateBooking } from "../types/booking.types";

/**
 * Fetch bookings
 * @param page 
 * @param limit 
 * @returns Promise<BookingResponse>
 */
export const fetchBookings = async (page = 1, limit = 10, sort: string = "status:desc"): Promise<BookingResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort });
    return await apiFetch<BookingResponse>(`/bookings?${query.toString()}`, {
        method: 'GET',
    });
}



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
export const createBooking = async (payload: CreateBooking): Promise<CreateBooking> => {
    return await apiFetch<CreateBooking>("/bookings", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update booking
 * @param payload 
 * @returns 
 */
export const updateBooking = async (payload: UpdateBooking): Promise<UpdateBooking> => {
    return await apiFetch<UpdateBooking>(`/bookings/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/**
 * cancel booking
 * @param payload 
 * @returns 
 */
export const cancelBooking = async (payload: CancelBooking): Promise<CancelBooking> => {
    return await apiFetch<CancelBooking>(`/bookings/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/**
 * Transfer booking
 * @param payload 
 * @returns 
 */
export const transferBooking = async (payload: TransferBooking): Promise<TransferBooking> => {
    return await apiFetch<TransferBooking>(`/booking-transfers`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}