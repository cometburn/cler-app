import { apiFetch } from "@/lib/api";
import { Room, RoomResponse } from "../types/room.types";

/**
 * Fetch rooms
 * @param page 
 * @param limit 
 * @returns Promise<RoomResponse>
 */
export const fetchRooms = async (page = 1, limit = 10): Promise<RoomResponse> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), sort: "name" });
    return await apiFetch<RoomResponse>(`/rooms?${query.toString()}`, {
        method: 'GET',
    });
}

/**
 * Fetch rooms by room type id
 * @param room_type_id 
 * @returns Promise<Room[]>
 */
export const fetchRoomsByRoomTypeId = async (room_type_id: number): Promise<Room[]> => {
    const query = new URLSearchParams({ room_type_id: String(room_type_id) });
    return await apiFetch<Room[]>(`/rooms?${query.toString()}`, {
        method: 'GET',
    });
}

/**
 * Create room
 * @param payload 
 * @returns Promise<Room>
 */
export const createRoom = async (payload: Room): Promise<Room> => {
    return await apiFetch<Room>("/rooms", {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Update room
 * @param payload 
 * @returns Promise<Room>
 */
export const updateRoom = async (payload: Room): Promise<Room> => {
    return await apiFetch<Room>(`/rooms/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

/**
 * Delete room
 * @param id 
 * @returns Promise<void>
 */
export const deleteRoom = async (id: number): Promise<void> => {
    return await apiFetch<void>(`/rooms/${id}`, {
        method: 'DELETE'
    })
}