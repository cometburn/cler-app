import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
    fetchInventories,
    createInventory,
    updateInventory,
    deleteInventory,
} from "../api/inventory.api";

import type { Inventory } from "../types/inventory.types";
import type { InventoryResponse } from "../api/inventory.api";
import { ApiError } from "@/shared/types/apiError.types";

/* ================================
   Query Keys
================================ */
export const INVENTORY_QUERY_KEY = ["inventories"];

/* ================================
   Get Inventories
================================ */
export function useInventories(page?: number, limit?: number, search?: string) {
    return useQuery<InventoryResponse, Error>({
        queryKey: [...INVENTORY_QUERY_KEY, page, limit, search],
        queryFn: () => {
            return fetchInventories(page, limit, search);
        },
        enabled: true,
    });
}

/* ================================
   Create Inventory
================================ */
export function useCreateInventory() {
    const queryClient = useQueryClient();

    return useMutation<Inventory, ApiError, Inventory>({
        mutationFn: createInventory,

        onSuccess: () => {
            toast.success("Inventory created successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create inventory";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: INVENTORY_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Update Inventory
================================ */
export function useUpdateInventory() {
    const queryClient = useQueryClient();

    return useMutation<Inventory, ApiError, Inventory>({
        mutationFn: updateInventory,

        onSuccess: () => {
            toast.success("Inventory updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update inventory:", error);

            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update inventory";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: INVENTORY_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Delete Inventory
================================ */
export function useDeleteInventory() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, number>({
        mutationFn: deleteInventory,

        onSuccess: () => {
            toast.success("Inventory deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete inventory:", error);

            const errors = error.response?.data?.errors;
            const message = errors?.[0]?.message || error.message || "Failed to delete inventory";

            toast.error(message);
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: INVENTORY_QUERY_KEY,
            });
        },
    });
}
