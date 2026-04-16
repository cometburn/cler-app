import { apiFetch } from "@/lib/api";
import { Inventory } from "../types/inventory.types";

export interface InventoryResponse {
    data: Inventory[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

/**
 * Fetch inventories
 * @param page
 * @param limit
 * @returns Promise<InventoryResponse>
 */
export const fetchInventories = async (page = 1, limit = 10, search?: string): Promise<InventoryResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });

    if (search) query.append("search", search);

    return await apiFetch<InventoryResponse>(`/inventories?${query.toString()}`, {
        method: "GET",
    });
};

/**
 * Create inventory
 * @param payload
 * @returns Promise<Inventory>
 */
export const createInventory = async (payload: Inventory): Promise<Inventory> => {
    return await apiFetch<Inventory>("/inventories", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

/**
 * Update inventory
 * @param payload
 * @returns Promise<Inventory>
 */
export const updateInventory = async (payload: Inventory): Promise<Inventory> => {
    return await apiFetch<Inventory>(`/inventories/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
};

/**
 * Delete inventory
 * @param id
 * @returns Promise<void>
 */
export const deleteInventory = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/inventories/${id}`, {
        method: "DELETE",
    });
};
