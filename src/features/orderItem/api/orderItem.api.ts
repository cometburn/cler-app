import { apiFetch } from "@/lib/api";
import { OrderItem, OrderItemResponse } from "../types/orderItem.types";

/**
 * Fetch Order items category
 * @param page 
 * @param limit 
 * @param category 
 * @returns 
 */
export const fetchOrderItems = async (bookingId: number): Promise<OrderItemResponse> => {
    return await apiFetch<OrderItemResponse>(`/order-items/${bookingId}`, {
        method: 'GET',
    });
}

/**
 * Create bo
 * @param payload 
 * @returns 
 */
export const createOrderItem = async (payload: OrderItem): Promise<OrderItem> => {
    return await apiFetch<OrderItem>("/order-items", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Delete bo
 * @param id 
 * @returns 
 */
export const deleteOrderItem = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/order-items/${id}`, {
        method: 'DELETE'
    })
}