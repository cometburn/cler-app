import { z } from "zod";

export const roomTypeSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    description: z.string().optional(),
});


export type RoomType = z.infer<typeof roomTypeSchema>;

export interface RoomTypeResponse {
    data: RoomType[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
