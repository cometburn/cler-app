import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchOrderItems,
    createOrderItem,
    deleteOrderItem
} from "../api/orderItem.api";
import { OrderItem, OrderItemResponse } from "../types/orderItem.types";
import { toast } from "sonner";

const BOOKING_ADDON_QUERY_KEY = ["booking_addons"];

/**
 * Fetch order items by booking id
 * @param bookingId 
 * @returns 
 */
export function useOrderItems(bookingId: number) {
    return useQuery<OrderItemResponse, Error>({
        queryKey: [...BOOKING_ADDON_QUERY_KEY, bookingId],
        queryFn: () => {
            return fetchOrderItems(bookingId)
        },
        enabled: true,
    });
}

/**
 * Create order item
 * @returns 
 */
export function useCreateOrderItem() {
    const queryClient = useQueryClient();

    return useMutation<OrderItem, Error, OrderItem>({
        mutationFn: createOrderItem,

        onSuccess: (data) => {
            toast.success("Addon created successfully");

            queryClient.invalidateQueries({
                queryKey: [...BOOKING_ADDON_QUERY_KEY, data.order_id],
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
 * Delete order item
 * @returns 
 */
export function useDeleteOrderItem() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteOrderItem,

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

