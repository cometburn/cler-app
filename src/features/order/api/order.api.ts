import { apiFetch } from "@/lib/api";
import { DirectOrder, OrderResponse } from "../types/order.types";

/**
 * Fetch products
 * @param page 
 * @param limit 
 * @param category 
 * @returns 
 */
export const fetchOrders = async (page = 1, limit = 10, has_booking?: boolean): Promise<OrderResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });

    if (has_booking) query.append("has_booking", has_booking.toString());

    return await apiFetch<OrderResponse>(`/orders?${query.toString()}`, {
        method: 'GET',
    });
}

/**
 * Create product movement
 * @param payload 
 * @returns 
 */
export const createOrder = async (payload: DirectOrder): Promise<OrderResponse> => {
    return await apiFetch<OrderResponse>("/orders", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update product movement
 * @param payload 
 * @returns 
 */
export const updateOrder = async (payload: DirectOrder): Promise<OrderResponse> => {
    return await apiFetch<OrderResponse>(`/orders/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}