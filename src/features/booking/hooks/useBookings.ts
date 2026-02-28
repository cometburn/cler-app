import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import {
    createBooking,
    updateBooking,
    fetchBookingById,
    cancelBooking,
    transferBooking
} from "../api/booking.api";
import { fetchRoomRatesByRoomType } from "@/features/roomRate/api/roomRate.api";

import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking, CancelBooking, CreateBooking, TransferBooking, UpdateBooking } from "../types/booking.types";
import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";

const ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY = ["roomRatesByRoomType"];
const BOOKINGS_QUERY_KEY = ["bookings"];

/**
 * Fetch room rates by room type
 * @param id 
 * @returns 
 */
export function useRoomRatesByRoomType(id: number) {
    return useQuery<RoomRate[], Error>({
        queryKey: [...ROOM_RATES_BY_ROOM_TYPE_QUERY_KEY, id],
        queryFn: () => fetchRoomRatesByRoomType(id),
        refetchOnMount: "always",
    });
}

/**
 * Fetch booking by id
 * @param bookingId 
 * @returns 
 */
export function useBookingById(
    bookingId: number,
    options?: Omit<UseQueryOptions<Booking, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<Booking, Error>({
        queryKey: [...BOOKINGS_QUERY_KEY, bookingId],
        queryFn: () => fetchBookingById(bookingId),
        refetchOnMount: 'always', // Always refetch when component mounts
        staleTime: 0, // Data is immediately stale
        ...options,
    });
}


/**
 * Create booking
 * @returns 
 */
export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation<CreateBooking, ApiError, CreateBooking>({
        mutationFn: createBooking,

        // onSuccess: () => {
        //     toast.success("Booking created successfully");
        // },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create booking";
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
 * @returns 
 */
export function useUpdateBooking() {
    const queryClient = useQueryClient();

    return useMutation<UpdateBooking, ApiError, UpdateBooking>({
        mutationFn: updateBooking,

        // onSuccess: () => {
        //     toast.success("Booking updated successfully");
        // },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update booking";
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
 * Cancel booking
 * @returns 
 */
export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation<CancelBooking, ApiError, CancelBooking>({
        mutationFn: cancelBooking,

        // onSuccess: () => {
        //     toast.success("Booking updated successfully");
        // },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update booking";
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

export function useTransferBooking() {
    const queryClient = useQueryClient();

    return useMutation<TransferBooking, ApiError, TransferBooking>({
        mutationFn: transferBooking,

        onSuccess: () => {
            toast.success("Booking transferred successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to transfer booking";
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