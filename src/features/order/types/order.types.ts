import { z } from "zod";
import { ORDER_STATUS } from "@/constants/system";
import { directOrderItemSchema, orderItemSchema } from "@/features/orderItem/types/orderItem.types";
import { bookingSchema } from "@/features/booking/types/booking.types";

export const orderCreateSchema = z
    .object({
        id: z.number().optional(),
        hotel_id: z.number().optional(),
        booking_id: z.number().optional().nullable(),
        total_price: z.number({ message: "Total price is required" }).positive().optional(),
        status: z.enum(ORDER_STATUS).optional(),
        notes: z.string().optional().nullable(),
    });

export const orderSchema = z
    .object({
        ...orderCreateSchema.shape,
        order_items: z.array(orderItemSchema).optional(),
        booking: bookingSchema.optional(),
    });

export const directOrderSchema = z
    .object({
        ...orderCreateSchema.shape,
        order_items: z.array(directOrderItemSchema).optional(),
    });

export type Order = z.infer<typeof orderSchema>;
export type DirectOrder = z.infer<typeof directOrderSchema>;

export interface OrderResponse {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

