import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHotel } from "@/features/hotel/api/hotel.api";
import { toast } from "sonner";
import type { Hotel } from "@/shared/types/hotel.types";

export function useCreateHotel() {
    const queryClient = useQueryClient();

    return useMutation<Hotel, Error, Hotel>({
        mutationFn: createHotel,

        onSuccess: (newHotel) => {
            // Optimistically add the new hotel to the user's hotels list
            queryClient.setQueryData(["currentUser"], (oldUser: any) => {
                if (!oldUser) return oldUser;

                return {
                    ...oldUser,
                    hotels: [...(oldUser.hotels || []), newHotel],
                };
            });

            toast.success("Hotel created successfully");
        },

        onError: (error) => {
            console.error("Failed to create hotel:", error);
            toast.error(error.message || "Failed to create hotel");
        },

        // Optional: refetch to sync with backend if optimistic update might be incomplete
        // onSettled: () => {
        //   queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        // },
    });
}