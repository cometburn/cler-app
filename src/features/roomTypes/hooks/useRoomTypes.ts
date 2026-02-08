import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
    fetchRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
} from "../api/roomType.api";

import type { RoomType, RoomTypeResponse } from "../types/roomType.types";

/* ================================
   Query Keys
================================ */
export const ROOM_TypeS_QUERY_KEY = ["room-types"];

/* ================================
   Get Room Types
================================ */
export function useRoomTypes(page: number, limit: number) {
    return useQuery<RoomTypeResponse, Error>({
        queryKey: [...ROOM_TypeS_QUERY_KEY, page, limit],
        queryFn: () => {
            return fetchRoomTypes(page, limit)
        },
        enabled: true,
    });
}

/* ================================
   Create Room Type
================================ */
export function useCreateRoomType() {
    const queryClient = useQueryClient();

    return useMutation<RoomType, Error, RoomType>({
        mutationFn: createRoomType,

        onSuccess: () => {
            toast.success("Room Type created successfully");
        },

        onError: (error) => {
            console.error("Failed to create room Type:", error);
            toast.error(error.message || "Failed to create room Type");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_TypeS_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Update Room Type
================================ */
export function useUpdateRoomType() {
    const queryClient = useQueryClient();

    return useMutation<RoomType, Error, RoomType>({
        mutationFn: updateRoomType,

        onSuccess: () => {
            toast.success("Room Type updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update room Type:", error);
            toast.error(error.message || "Failed to update room Type");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_TypeS_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Delete Room Type
================================ */
export function useDeleteRoomType() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteRoomType,

        onSuccess: () => {
            toast.success("Room Type deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete room Type:", error);
            toast.error(error.message || "Failed to delete room Type");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_TypeS_QUERY_KEY,
            });
        },
    });
}
