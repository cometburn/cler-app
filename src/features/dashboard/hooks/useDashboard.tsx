import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardRooms } from "../api/dashboard.api";
import { DashboardRoomResponse } from "../types/dashboard.types";

import {
    createBooking,
    updateBooking,
    fetchRoomRatesByRoomType
} from "@/features/booking/api/booking.api";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking } from "@/features/booking/types/booking.types";
import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";

/* ================================
   Query Keys
================================ */
export const DASHBOARD_ROOMS_QUERY_KEY = ["dashboard-rooms"];
const ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY = ["roomRatesByRoomType"];
const BOOKINGS_QUERY_KEY = ["bookings"];

/**
 * Get rooms
 * @param {number} page
 * @param {number} limit
 * @returns {UseQueryResult<DashboardRoomResponse, Error>}
 */
export function useDashboard(page?: number, limit?: number) {
    return useQuery<DashboardRoomResponse, Error>({
        queryKey: [...DASHBOARD_ROOMS_QUERY_KEY, page, limit],
        queryFn: () => {
            return getDashboardRooms()
        },
        enabled: true,
        refetchOnMount: "always",
    });
}


/**
 * Get room rates by room type
 * @param {number} id
 * @returns {UseQueryResult<RoomRate[], Error>}
 */
export function useRoomRatesByRoomType(id: number) {
    return useQuery<RoomRate[], Error>({
        queryKey: [...ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY, id],
        queryFn: () => fetchRoomRatesByRoomType(id),

    });
}


/**
 * Create booking
 * @returns {UseMutationResult<Booking, ApiError, Booking>}
 */
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

/**
 * Update booking
 * @returns {UseMutationResult<Booking, ApiError, Booking>}
 */
export function useUpdateBooking() {
    const queryClient = useQueryClient();

    return useMutation<Booking, ApiError, Booking>({
        mutationFn: updateBooking,

        onSuccess: () => {
            toast.success("Booking updated successfully");
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