import { useMutation } from "@tanstack/react-query";
import {
    createBookingCharge,
} from "../api/bookingCharge.api";
import { BookingCharge } from "../types/bookingCharge.types";
import { toast } from "sonner";

/**
 * Create booking addon
 * @returns 
 */
export function useCreateBookingCharge() {

    return useMutation<BookingCharge, Error, BookingCharge>({
        mutationFn: createBookingCharge,

        onSuccess: (_data) => {
            toast.success("Charge created successfully");
        },

        onError: (error) => {
            console.error("Failed to create addon:", error);
            toast.error(error.message || "Failed to create addon");
        },

    });
}