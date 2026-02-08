import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
    fetchRoomPromos,
    createRoomPromo,
    updateRoomPromo,
    deleteRoomPromo,
} from "../api/roomPromo.api";

import type { RoomPromo, RoomPromoResponse } from "../types/roomPromo.types";

/* ================================
   Query Keys
================================ */
export const ROOM_PROMOS_QUERY_KEY = ["room-promos"];

/* ================================
   Get Room Promos
================================ */
export function useRoomPromos(page: number, limit: number) {
    return useQuery<RoomPromoResponse, Error>({
        queryKey: [...ROOM_PROMOS_QUERY_KEY, page, limit],
        queryFn: () => {
            console.log("Fetching room promos...")
            return fetchRoomPromos(page, limit)
        },
        enabled: true,
    });
}

/* ================================
   Create Room Promo
================================ */
export function useCreateRoomPromo() {
    const queryClient = useQueryClient();

    return useMutation<RoomPromo, Error, RoomPromo>({
        mutationFn: createRoomPromo,

        onSuccess: () => {
            toast.success("Room promo created successfully");
        },

        onError: (error) => {
            console.error("Failed to create room promo:", error);
            toast.error(error.message || "Failed to create room promo");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_PROMOS_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Update Room Promo
================================ */
export function useUpdateRoomPromo() {
    const queryClient = useQueryClient();

    return useMutation<RoomPromo, Error, RoomPromo>({
        mutationFn: updateRoomPromo,

        onSuccess: () => {
            toast.success("Room promo updated successfully");
        },

        onError: (error) => {
            console.error("Failed to update room promo:", error);
            toast.error(error.message || "Failed to update room promo");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_PROMOS_QUERY_KEY,
            });
        },
    });
}

/* ================================
   Delete Room Promo
================================ */
export function useDeleteRoomPromo() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteRoomPromo,

        onSuccess: () => {
            toast.success("Room promo deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete room promo:", error);
            toast.error(error.message || "Failed to delete room promo");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_PROMOS_QUERY_KEY,
            });
        },
    });
}
