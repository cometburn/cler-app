import { apiFetch } from "@/lib/api";
import { ProductMovement, ProductMovementResponse } from "../types/productMovement.types";

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