import { apiFetch } from "@/lib/api";
import { DashboardRoomResponse } from "../types/dashboard.types";

export const getDashboardRooms = async (): Promise<DashboardRoomResponse> => {
    return await apiFetch<DashboardRoomResponse>(`/dashboard`, {
        method: 'GET',
    });
}