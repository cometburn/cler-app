import { OPERATIONAL_STATUS } from "@/constants/system";
import { z } from "zod";

export const roomSchema = z.object({
    id: z.number().optional(),
    room_type_id: z.number().min(1, "Room type is required"),
    name: z.string().min(1, "Room name is required"),
    floor: z.string().nullable(),
    operational_status: z.string()
        .min(1, "Please select a status")
        .refine((val) => OPERATIONAL_STATUS.includes(val), {
            message: "Status is required.",
        }),
    notes: z.string().nullable(),
});


export type Room = z.infer<typeof roomSchema>;

export interface RoomResponse {
    data: Room[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
