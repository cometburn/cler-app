import { z } from "zod";
import { PRODUCT_MOVEMENT_TYPE } from "@/constants/system";
import { productWithoutInventoryHistory } from "@/features/product/types/product.types";
import { Booking } from "@/features/booking/types/booking.types";
import { OrderItem } from "@/features/orderItem/types/orderItem.types";
import { User } from "@/shared/types/user.types";

export const productMovementSchema = z
    .object({
        id: z.number().optional(),
        product_id: z.number().optional(),
        type: z.enum(PRODUCT_MOVEMENT_TYPE),
        quantity: z.number().positive(),
        unit_cost: z.number().positive(),
        note: z.string().optional(),
        product: z.lazy(() => productWithoutInventoryHistory).optional(),
        created_at: z.string().optional(),
        booking: z.custom<Booking>().optional(),
        orderItem: z.custom<OrderItem>().optional(),
        user: z.custom<User>().optional(),
    });

export type ProductMovement = z.infer<typeof productMovementSchema>;

export interface ProductMovementResponse {
    data: ProductMovement[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

