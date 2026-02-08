import { z } from "zod";

export const roomPromoSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    room_rate_id: z.number().optional(),
    rate_type: z.string(),
    date_start: z.string(),
    date_end: z.string(),
    days_of_week: z.string(),
    time_start: z.string(),
    time_end: z.string(),
    price: z.number(),

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
