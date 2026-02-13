import {
    // useMutation,
    useQuery,
    // useQueryClient,
} from "@tanstack/react-query";
// import { toast } from "sonner";

import {
    getDashboardRooms,
} from "../api/dashboard.api";
import { DashboardRoom, DashboardRoomResponse } from "../types/dashboard.types";

// import { ApiError } from "@/shared/types/apiError.types";

/* ================================
   Query Keys
================================ */
export const DASHBOARD_ROOMS_QUERY_KEY = ["dashboard-rooms"];

/* ================================
   Get Rooms
================================ */
export function useDashboard(page?: number, limit?: number) {
    return useQuery<DashboardRoomResponse, Error>({
        queryKey: [...DASHBOARD_ROOMS_QUERY_KEY, page, limit],
        queryFn: () => {
            return getDashboardRooms(page, limit)
        },
        enabled: true,
    });
}