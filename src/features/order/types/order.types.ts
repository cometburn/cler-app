import { z } from "zod";
import { ORDER_STATUS } from "@/constants/system";
import { orderItemSchema } from "@/features/orderItem/types/orderItem.types";

export const orderSchema = z
    .object({
        id: z.number().optional(),
        hotel_id: z.number({ message: "Hotel is required" }),
        booking_id: z.number({ message: "Booking is required" }),
        total_price: z.number({ message: "Total price is required" }).positive(),
        status: z.enum(ORDER_STATUS),
        notes: z.string().optional().nullable(),
        order_items: z.array(orderItemSchema).optional(),
    });

export type Order = z.infer<typeof orderSchema>;