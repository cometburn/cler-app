import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchBookingAddons,
    createBookingAddon,
    deleteBookingAddon
} from "../api/bookingAddon.api";
import { BookingAddon, BookingAddonResponse } from "../types/bookingAddon.types";
import { toast } from "sonner";

const BOOKING_ADDON_QUERY_KEY = ["booking_addons"];

/**
 * Fetch booking addons by booking id
 * @param bookingId 
 * @returns 
 */
export function useBookingAddOns(bookingId: number) {
    return useQuery<BookingAddonResponse, Error>({
        queryKey: [...BOOKING_ADDON_QUERY_KEY, bookingId],
        queryFn: () => {
            return fetchBookingAddons(bookingId)
        },
        enabled: true,
    });
}

/**
 * Create booking addon
 * @returns 
 */
export function useCreateBookingAddon() {
    const queryClient = useQueryClient();

    return useMutation<BookingAddon, Error, BookingAddon>({
        mutationFn: createBookingAddon,

        onSuccess: (data) => {
            toast.success("Addon created successfully");

            queryClient.invalidateQueries({
                queryKey: [...BOOKING_ADDON_QUERY_KEY, data.booking_id],
            });
        },

        onError: (error) => {
            console.error("Failed to create addon:", error);
            toast.error(error.message || "Failed to create addon");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [...BOOKING_ADDON_QUERY_KEY, "booking"],
            });
        },
    });
}

/**
 * Delete booking addon
 * @returns 
 */
export function useDeleteBookingAddon() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteBookingAddon,

        onSuccess: () => {
            toast.success("Addon deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete addon:", error);
            toast.error(error.message || "Failed to delete addon");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: BOOKING_ADDON_QUERY_KEY,
            });
        },
    });
}

