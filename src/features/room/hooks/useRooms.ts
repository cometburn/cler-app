import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
} from "../api/room.api";

import type { Room, RoomResponse } from "../types/room.types";
import { ApiError } from "@/shared/types/apiError.types";
/* ================================
   Query Keys
================================ */
export const ROOM_S_QUERY_KEY = ["rooms"];

/* ================================
   Get Rooms
================================ */
export function useRooms(page?: number, limit?: number) {
    return useQuery<RoomResponse, Error>({
        queryKey: [...ROOM_S_QUERY_KEY, page, limit],
        queryFn: () => {
            return fetchRooms(page, limit)
        },
        enabled: true,
    });
}

/* ================================
   Create Room 
================================ */
export function useCreateRoom() {
    const queryClient = useQueryClient();

    return useMutation<Room, ApiError, Room>({
        mutationFn: createRoom,

        onSuccess: () => {
            toast.success("Room created successfully");
        },

        onError: (error) => {
            const errors = error.response?.data?.errors;

            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to create room";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_S_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Update Room 
================================ */
export function useUpdateRoom() {
    const queryClient = useQueryClient();

    return useMutation<Room, ApiError, Room>({
        mutationFn: updateRoom,

        onSuccess: () => {
            toast.success("Room updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update room:", error);

            const errors = error.response?.data?.errors;

            // Only show toast for errors without specific field paths (general errors)
            if (!errors || !Array.isArray(errors) || !errors.some(err => err.path && err.path.length > 0)) {
                const message = errors?.[0]?.message || error.message || "Failed to update room";
                toast.error(message);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_S_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Delete Room 
================================ */
export function useDeleteRoom() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, number>({
        mutationFn: deleteRoom,

        onSuccess: () => {
            toast.success("Room deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete room:", error);

            const errors = error.response?.data?.errors;
            const message = errors?.[0]?.message || error.message || "Failed to delete room";

            toast.error(message);
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_S_QUERY_KEY,
            });
        },
    });
}