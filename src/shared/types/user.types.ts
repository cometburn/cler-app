import { z } from "zod";
import { hotelSchema } from "./hotel.types";

export const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    last_name: z.string().optional(),
    first_name: z.string().optional(),
    user_type_id: z.number().optional(),
    token_remember: z.string().optional().nullable(),
    agent_id: z.number().optional().nullable(),
    default_hotel_id: z.number().optional(),
    hotels: hotelSchema.array(),
});

export type User = z.infer<typeof userSchema>;
