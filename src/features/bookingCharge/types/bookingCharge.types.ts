import { roomSchema } from "@/features/room/types/room.types";
import { z } from "zod";

export const bookingChargeSchema = z.object({
    id: z.number().optional(),
    room_id: z.number().optional(),
    name: z.string({ message: "Name is required" }).min(1, "Name is required"),
    price: z.number().positive({ message: "Price is required" }),
    room: roomSchema.partial().optional(),
});

export type BookingCharge = z.infer<typeof bookingChargeSchema>;

export interface BookingChargeRequestParams {
    bookingId: number;
}
