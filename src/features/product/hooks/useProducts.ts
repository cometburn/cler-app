import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../api/product.api";

import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";
import { Product, ProductResponse } from "../types/product.types";
import { getErrorMessage } from "@/helpers/error.helper";

const PRODUCTS_QUERY_KEY = ["products"];

export function useProducts(page: number, limit: number, category?: string, search?: string) {
    return useQuery<ProductResponse, Error>({
        queryKey: [...PRODUCTS_QUERY_KEY, page, limit, category, search],
        queryFn: () => {
            return fetchProducts(page, limit, category, search)
        },
        enabled: true,
        refetchOnMount: "always",
    });
}

/* ================================
   Create Product 
================================ */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation<Product, ApiError, Product>({
        mutationFn: createProduct,

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

/* ================================
   Update Product 
================================ */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation<Product, ApiError, Product>({
        mutationFn: updateProduct,

        onSuccess: () => {
            toast.success("Product updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update Product:", error);

            const errors = error.response?.data?.errors;

            // Only show toast for errors without specific field paths (general errors)
            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update Product";
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

/* ================================
   Delete Product 
================================ */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, number>({
        mutationFn: deleteProduct,

        onSuccess: () => {
            toast.success("Product deleted successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;
            const message = getErrorMessage(errors ?? [], "Failed to delete Product");

            toast.error(message);
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: PRODUCTS_QUERY_KEY,
            });
        },
    });
}