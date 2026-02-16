import { z } from "zod";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";

export const bookingSchema = z.object({
    id: z.number().optional(),
    room_id: z.number(),
    room_rate_id: z.number().min(1, "Room rate is required"),
    start_datetime: z.date({ message: "Start date is required" }),
    end_datetime: z.date({ message: "End date is required" }),
    extra_person: z.number().optional(),
    total_price: z.number().min(1, "Total price is required").positive(),
    status: z.enum(BOOKING_STATUS),
    payment_status: z.enum(PAYMENT_STATUS).optional(),
    payment_type: z.enum(PAYMENT_TYPE).optional(),
    note: z.string().optional(),
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
