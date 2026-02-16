import { z } from "zod";
import { RATE_TYPE_OPTIONS } from "@/constants/system";
import { requiredNumberSelect } from "@/helpers/zod.helper";

export const roomRateSchema = z.object({
    name: z.string().min(1, "This field is required"),
    room_type_id: requiredNumberSelect,
    rate_type: z.enum(RATE_TYPE_OPTIONS),
    duration_minutes: z.number().min(1, "Must be greater than 0").optional(),
    base_price: z.number().min(1, "Must be greater than 0"),
    extra_person_rate: z.number().default(0),
    is_dynamic: z.boolean().default(false),
    id: z.number().optional(),
});

export type RoomRate = z.infer<typeof roomRateSchema>;
export type RoomRateForm = z.input<typeof roomRateSchema>;

export interface RoomRateResponse {
    data: RoomRate[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
