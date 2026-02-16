import { OPERATIONAL_STATUS } from "@/constants/system";
import { bookingSchema } from "@/features/booking/types/booking.types";
import { roomTypeSchema } from "@/features/roomType/types/roomType.types";
import { z } from "zod";

export const dashboardRoomSchema = z.object({
    id: z.number().optional(),
    room_type_id: z.number().min(1, "Room type is required"),
    name: z.string().min(1, "Room name is required"),
    floor: z.string().optional().nullable(),
    operational_status: z.string()
        .min(1, "Please select a status")
        .refine((val) => OPERATIONAL_STATUS.includes(val), {
            message: "Status is required.",
        }),
    notes: z.string().optional().nullable(),
    room_type: roomTypeSchema.optional(),
    bookings: z.array(bookingSchema).optional()
});

export type DashboardRoom = z.infer<typeof dashboardRoomSchema>;

export interface DashboardRoomResponse {
    data: DashboardRoom[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
