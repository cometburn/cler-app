import { z } from "zod";

export const hotelSchema = z.object({
    id: z.number().optional().nullable(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    address: z
        .string()
        .min(5, { message: "Address must be at least 5 characters." }),
    is_default: z.boolean().optional().nullable(),
});

export type Hotel = z.infer<typeof hotelSchema>;
