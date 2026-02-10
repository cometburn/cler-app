import { z } from "zod";

export const roomPromoSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Promo name is required"),
    room_rate_id: z.number({
        message: "Room rate is required",
    }),
    date_start: z.coerce.date({
        message: "Start date is required",
    }).refine((data) => data > new Date(), { message: "Start date must be greater than End date" }),
    date_end: z.coerce.date({
        message: "End date is required",
    }),
    days_of_week: z.string().min(1, "At least one day must be selected"),
    time_start: z.string().min(1, "Time start is required"),
    time_end: z.string().min(1, "Time end is required"),
    price: z.number().min(1, "Price is required"),

    note: z.string(),
    extra_person_rate: z.number(),
});

export type RoomPromo = z.infer<typeof roomPromoSchema>;

export interface RoomPromoResponse {
    data: RoomPromo[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
