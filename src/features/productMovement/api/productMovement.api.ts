import { apiFetch } from "@/lib/api";
import { ProductMovement, ProductMovementResponse } from "../types/productMovement.types";

/**
 * Fetch products
 * @param page 
 * @param limit 
 * @param category 
 * @returns 
 */
export const fetchProductMovements = async (page = 1, limit = 10, search?: string, category?: string): Promise<ProductMovementResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: "name" });

    if (category) query.append("category", category);
    if (search) query.append("search", search);

    return await apiFetch<ProductMovementResponse>(`/product-movements?${query.toString()}`, {
        method: 'GET',
    });
}

/**
 * Create product movement
 * @param payload 
 * @returns 
 */
export const createProductMovement = async (payload: ProductMovement): Promise<ProductMovementResponse> => {
    return await apiFetch<ProductMovementResponse>("/product-movements", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update product movement
 * @param payload 
 * @returns 
 */
export const updateProductMovement = async (payload: ProductMovement): Promise<ProductMovementResponse> => {
    return await apiFetch<ProductMovementResponse>(`/product-movements/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}