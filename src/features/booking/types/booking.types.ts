import { z } from "zod";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { bookingAddonSchema } from "@/features/bookingAddon/types/bookingAddon.types";
import { orderSchema } from "@/features/order/types/order.types";

export const bookingSchema = z.object({
    id: z.number().optional(),
    room_id: z.number(),
    room_rate_id: z.number().min(1, "Room rate is required"),
    start_datetime: z.date({ message: "Start date is required" }),
    end_datetime: z.date({ message: "End date is required" }),
    extra_person: z.number().optional(),
    total_price: z.number().min(1, "Total price is required").positive(),
    status: z.enum(BOOKING_STATUS),
    payment_status: z.enum(PAYMENT_STATUS, {
        message: "Invalid payment status",
    }).optional(),
    payment_type: z.enum(PAYMENT_TYPE, {
        message: "Invalid payment type",
    }).optional(),
    note: z.string().optional(),
    booking_addons: z.array(bookingAddonSchema).optional(),
    orders: orderSchema.optional(),
}).refine(
    (data) => {
        return data.start_datetime <= data.end_datetime;
    },
    {
        message: "Start date must not be greater than end date",
        path: ["start_datetime"],
    }
);

export type Booking = z.infer<typeof bookingSchema>;