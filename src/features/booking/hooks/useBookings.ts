import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createBooking,
    fetchRoomRatesByRoomType
} from "../api/booking.api";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking } from "../types/booking.types";
import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";

const ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY = ["roomRatesByRoomType"];
const BOOKINGS_QUERY_KEY = ["bookings"];

export function useRoomRatesByRoomType(id: number) {
    return useQuery<RoomRate[], Error>({
        queryKey: [...ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY, id],
        queryFn: () => fetchRoomRatesByRoomType(id),
    });
}


/* ================================
   Create Booking
================================ */
export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation<Booking, ApiError, Booking>({
        mutationFn: createBooking,

        onSuccess: () => {
            toast.success("Booking created successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create room promo";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: BOOKINGS_QUERY_KEY,
            });
        },
    });
}