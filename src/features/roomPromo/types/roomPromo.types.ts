import { z } from "zod";

export const roomPromoSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Promo name is required"),
    room_rate_id: z.number().min(1, "Room rate is required"),
    start_datetime: z.date({ message: "Start date is required" }),
    end_datetime: z.date({ message: "End date is required" }),
    days_of_week: z.array(z.number()).min(1, "At least one day must be selected"),
    price: z.number().min(1, "Price is required"),

    note: z.string(),
    extra_person_rate: z.number(),
}).refine(
    (data) => {
        return data.start_datetime <= data.end_datetime;
    },
    {
        message: "Start date must not be greater than end date",
        path: ["start_datetime"],
    }
);

export type RoomPromo = z.infer<typeof roomPromoSchema>;

export interface RoomPromoResponse {
    data: RoomPromo[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
