import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchOrders,
    createOrder,
    updateOrder
} from "../api/order.api";

import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";
import { DirectOrder, OrderResponse } from "../types/order.types";

const ORDER_QUERY_KEY = ["orders"];

export function useOrders(page: number, limit: number, has_booking?: boolean) {
    return useQuery<OrderResponse, Error>({
        queryKey: [...ORDER_QUERY_KEY, page, limit, has_booking],
        queryFn: () => {
            return fetchOrders(page, limit, has_booking)
        },
        enabled: true,
        refetchOnMount: "always",
    });
}

/* ================================
   Create Order 
================================ */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation<OrderResponse, ApiError, DirectOrder>({
        mutationFn: createOrder,

        onSuccess: () => {
            toast.success("Order created successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create Order";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ORDER_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Update Order 
================================ */
export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation<OrderResponse, ApiError, DirectOrder>({
        mutationFn: updateOrder,

        onSuccess: () => {
            toast.success("Order updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update Order:", error);

            const errors = error.response?.data?.errors;

            // Only show toast for errors without specific field paths (general errors)
            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update Order";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ORDER_QUERY_KEY,
            });
        },
    });
}