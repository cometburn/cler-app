import { apiFetch } from "@/lib/api";
import { RoomPromo, RoomPromoResponse } from "../types/roomPromo.types";

/* ================================
   Fetch Room Promos
================================ */
export const fetchRoomPromos = async (page = 1, limit = 10): Promise<RoomPromoResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: "name" });
    return await apiFetch<RoomPromoResponse>(`/room-promos?${query.toString()}`, {
        method: 'GET',
    });
}

/* ================================
   Create Room Promo
================================ */
export const createRoomPromo = async (payload: RoomPromo): Promise<RoomPromo> => {
    return await apiFetch<RoomPromo>("/room-promos", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/* ================================
   Update Room Promo
================================ */
export const updateRoomPromo = async (payload: RoomPromo): Promise<RoomPromo> => {
    return await apiFetch<RoomPromo>(`/room-promos/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/* ================================
   Delete Room Promo
================================ */
export const deleteRoomPromo = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/room-promos/${id}`, {
        method: 'DELETE'
    })
}