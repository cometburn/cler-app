import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchRoomRates,
    createRoomRate,
    updateRoomRate,
    deleteRoomRate,
} from "../api/roomRate.api";
import { RoomRate, RoomRateResponse } from "../types/roomRate.types";
import { toast } from "sonner";

const ROOM_RATES_QUERY_KEY = ["roomRates"];

export function useRoomRates(page: number, limit: number) {
    return useQuery<RoomRateResponse, Error>({
        queryKey: [...ROOM_RATES_QUERY_KEY, page, limit],
        queryFn: () => fetchRoomRates(page, limit),
    });
}


export function useCreateRoomRate() {
    const queryClient = useQueryClient();

    return useMutation<RoomRate, Error, RoomRate>({
        mutationFn: createRoomRate,

        onSuccess: () => {
            toast.success("Room rate created successfully");
        },

        onError: (error) => {
            console.error("Failed to create room rate:", error);
            toast.error(error.message || "Failed to create room rate");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_RATES_QUERY_KEY,
            });
        },
    });
}


export function useUpdateRoomRate() {
    const queryClient = useQueryClient();

    return useMutation<RoomRate, Error, RoomRate>({
        mutationFn: updateRoomRate,

        onSuccess: () => {
            toast.success("Room rate updated successfully");
        },

        onError: (error) => {
            console.error("Failed to create room rate:", error);
            toast.error(error.message || "Failed to create room rate");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_RATES_QUERY_KEY,
            });
        },
    });
}


export function useDeleteRoomRate() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteRoomRate,

        onSuccess: () => {
            toast.success("Room rate deleted successfully");
        },

        onError: (error) => {
            console.error("Failed to delete room rate:", error);
            toast.error(error.message || "Failed to delete room rate");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ROOM_RATES_QUERY_KEY,
            });
        },
    });
}