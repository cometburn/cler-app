import { apiFetch } from "@/lib/api";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking } from "../types/booking.types";

export const fetchRoomRatesByRoomType = async (id: number): Promise<RoomRate[]> => {
    return await apiFetch<RoomRate[]>(`/room-rates/room-type/${id}`, {
        method: "GET",
    });
};

export const createBooking = async (payload: Booking): Promise<Booking> => {
    return await apiFetch<Booking>("/bookings", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}