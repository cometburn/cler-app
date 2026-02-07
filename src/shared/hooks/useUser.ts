import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchCurrentUser, setDefaultHotelApi } from "@/shared/api/user.api";

import type { User } from "@/shared/types/user.types";
import type { Hotel } from "@/shared/types/hotel.types";

export const USER_QUERY_KEY = ["currentUser"] as const;

export function useUser() {
    const queryClient = useQueryClient();

    // Fetch current user
    const {
        data: user,
        isLoading: isUserLoading,
        error: userError,
        refetch: refetchUser,
    } = useQuery<User | null, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
        retry: false,
        // Only run query when user is likely authenticated
        enabled: !!localStorage.getItem("token"),
    });

    // Derived values
    const defaultHotel = user?.hotels?.find((h: Hotel) => h.is_default);
    const defaultHotelId = defaultHotel?.id;

    // Switch default hotel mutation
    const switchHotelMutation = useMutation({
        mutationFn: async (hotelId: number) => {
            if (!hotelId) throw new Error("No hotel ID provided");
            await setDefaultHotelApi(hotelId);
            return hotelId;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
        },

        onError: (err) => {
            console.error("Failed to switch hotel:", err);
        },
    });

    const switchHotel = useCallback(
        async (hotelId?: number | null) => {
            if (!hotelId) return;
            await switchHotelMutation.mutateAsync(hotelId);
        },
        [switchHotelMutation],
    );

    return {
        // User data & status
        user,
        isLoading: isUserLoading || switchHotelMutation.isPending,
        error: userError?.message || switchHotelMutation.error?.message || null,

        // Actions
        refetchUser,
        switchHotel,

        // Derived values (replacing old store selectors)
        defaultHotel,
        defaultHotelId,
    };
}