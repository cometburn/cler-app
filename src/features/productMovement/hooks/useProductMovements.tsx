import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchProductMovements,
    createProductMovement
} from "../api/productMovement.api";

import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";
import { ProductMovement, ProductMovementResponse } from "../types/productMovement.types";

const PRODUCTS_QUERY_KEY = ["product_movements"];

export function useProductMovements(page: number, limit: number, category?: string, search?: string) {
    return useQuery<ProductMovementResponse, Error>({
        queryKey: [...PRODUCTS_QUERY_KEY, page, limit, category, search],
        queryFn: () => {
            return fetchProductMovements(page, limit, category, search)
        },
        enabled: true,
        refetchOnMount: "always",
    });
}

/* ================================
   Create Product 
================================ */
export function useCreateProductMovement() {
    const queryClient = useQueryClient();

    return useMutation<ProductMovementResponse, ApiError, ProductMovement>({
        mutationFn: createProductMovement,

        onSuccess: () => {
            toast.success("Product created successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create Product";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: PRODUCTS_QUERY_KEY,
            });
        },
    });
}