import { productSchema } from "@/features/product/types/product.types";
import { z } from "zod";

export const orderItemSchema = z
    .object({
        id: z.number().optional(),
        order_id: z.number({ message: "Order is required" }),
        product_id: z.number({ message: "Product is required" }),
        quantity: z.number({ message: "Quantity is required" }).positive(),
        price: z.number({ message: "Unit price is required" }).positive(),
        total_price: z.number({ message: "Total price is required" }).positive(),
        notes: z.string().optional().nullable(),
        product: productSchema.partial().optional(),
    });

export type OrderItem = z.infer<typeof orderItemSchema>;

export interface OrderItemResponse {
    data: OrderItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
