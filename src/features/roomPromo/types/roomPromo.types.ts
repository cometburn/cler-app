import { z } from "zod";

export const roomPromoSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Promo name is required"),
    room_rate_id: z.number().min(1, "Room rate is required"),
    date_start: z.date({ message: "Start date is required" }),
    date_end: z.date({ message: "End date is required" }),
    days_of_week: z.array(z.number()).min(1, "At least one day must be selected"),
    start_time: z.string().min(1, "Time start is required"),
    end_time: z.string().min(1, "Time end is required"),
    price: z.number().min(1, "Price is required"),

    note: z.string(),
    extra_person_rate: z.number(),
}).refine(
    (data) => {
        return data.date_start <= data.date_end;
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
