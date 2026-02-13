import { apiFetch } from "@/lib/api";
import { Room, RoomResponse } from "../types/room.types";

export const fetchRooms = async (page = 1, limit = 10): Promise<RoomResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: "name" });
    return await apiFetch<RoomResponse>(`/rooms?${query.toString()}`, {
        method: 'GET',
    });
}
export const createRoom = async (payload: Room): Promise<Room> => {
    return await apiFetch<Room>("/rooms", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export const updateRoom = async (payload: Room): Promise<Room> => {
    return await apiFetch<Room>(`/rooms/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

export const deleteRoom = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/rooms/${id}`, {
        method: 'DELETE'
    })
}