import { z } from "zod";

export const bookingSchema = z.object({
    id: z.number().optional(),
    room_id: z.number(),
    room_rate_id: z.number(),
    start_time: z.string().datetime().or(z.date()),
    end_time: z.string().datetime().or(z.date()),
    total_price: z.number().positive(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    payment_status: z.enum(["unpaid", "paid", "refunded"]),
    payment_type: z.enum(["cash", "card", "online"]),
});

export type Booking = z.infer<typeof bookingSchema>;
