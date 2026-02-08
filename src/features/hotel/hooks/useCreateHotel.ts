import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHotel } from "@/features/hotel/api/hotel.api";
import { toast } from "sonner";
import type { Hotel } from "@/shared/types/hotel.types";

export function useCreateHotel() {
    const queryClient = useQueryClient();

    return useMutation<Hotel, Error, Hotel>({
        mutationFn: createHotel,

        onSuccess: async (newHotel) => {
            queryClient.setQueryData(["me"], (oldUser: any) => {
                if (!oldUser) return oldUser;

                return {
                    ...oldUser,
                    hotels: [...(oldUser.hotels || []), newHotel],
                    default_hotel_id: newHotel.id,
                };
            });

            toast.success("Hotel created successfully");
        },

        onError: (error) => {
            console.error("Failed to create hotel:", error);
            toast.error(error.message || "Failed to create hotel");
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}