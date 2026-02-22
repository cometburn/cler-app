import { apiFetch } from "@/lib/api";
import { Product, ProductResponse } from "../types/product.types";

/**
 * Fetch products
 * @param page 
 * @param limit 
 * @param category 
 * @returns 
 */
export const fetchProducts = async (page = 1, limit = 10, search?: string, category?: string): Promise<ProductResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: "name" });

    if (category) query.append("category", category);
    if (search) query.append("search", search);

    return await apiFetch<ProductResponse>(`/products?${query.toString()}`, {
        method: 'GET',
    });
}

/**
 * Create product
 * @param payload 
 * @returns 
 */
export const createProduct = async (payload: Product): Promise<Product> => {
    return await apiFetch<Product>("/products", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update product
 * @param payload 
 * @returns 
 */
export const updateProduct = async (payload: Product): Promise<Product> => {
    return await apiFetch<Product>(`/products/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/**
 * Delete product
 * @param id 
 * @returns 
 */
export const deleteProduct = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/products/${id}`, {
        method: 'DELETE'
    })
}