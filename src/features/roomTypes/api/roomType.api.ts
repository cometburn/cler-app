import { apiFetch } from "@/lib/api";
import { RoomType, RoomTypeResponse } from "../types/roomType.types";

export const fetchRoomTypes = async (page = 1, limit = 10): Promise<RoomTypeResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch<RoomTypeResponse>(`/room-types?${query.toString()}`, { method: "GET" });
};

export const createRoomType = async (payload: RoomType): Promise<RoomType> => {
    return apiFetch<RoomType>("/room-types", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const updateRoomType = async (payload: RoomType): Promise<RoomType> => {
    return apiFetch<RoomType>(`/room-types/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
};

export const deleteRoomType = async (id: number): Promise<void> => {
    return apiFetch<void>(`/room-types/${id}`, { method: "DELETE" });
};
