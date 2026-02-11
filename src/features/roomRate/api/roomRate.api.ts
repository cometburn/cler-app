import { apiFetch } from "@/lib/api";
import { RoomRate, RoomRateResponse } from "../types/roomRate.types";

export const fetchRoomRates = async (
    page = 1,
    limit = 10
): Promise<RoomRateResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch<RoomRateResponse>(`/room-rates?${params.toString()}`, {
        method: "GET",
    });
};

export const createRoomRate = async (payload: RoomRate): Promise<RoomRate> => {
    return apiFetch<RoomRate>("/room-rates", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const updateRoomRate = async (payload: RoomRate): Promise<RoomRate> => {
    return apiFetch<RoomRate>(`/room-rates/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
};

export const deleteRoomRate = async (id: number): Promise<void> => {
    return apiFetch<void>(`/room-rates/${id}`, { method: "DELETE" });
};
