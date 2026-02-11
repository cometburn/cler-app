import { z } from "zod";

export const roomPromoSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Promo name is required"),
    room_rate_id: z.number({
        message: "Room rate is required",
    }),
    date_start: z.string().min(1, "Start date is required"),
    date_end: z.string().min(1, "End date is required"),
    days_of_week: z.string().min(1, "At least one day must be selected"),
    time_start: z.string().min(1, "Time start is required"),
    time_end: z.string().min(1, "Time end is required"),
    price: z.number().min(1, "Price is required"),

    note: z.string(),
    extra_person_rate: z.number(),
}).refine(
    (data) => {
        const start = new Date(data.date_start);
        const end = new Date(data.date_end);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;

        return start <= end;
    },
    {
        message: "Start date must not be greater than end date",
        path: ["date_start"],
    }
);;

export type RoomPromo = z.infer<typeof roomPromoSchema>;

export interface RoomPromoResponse {
    data: RoomPromo[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
