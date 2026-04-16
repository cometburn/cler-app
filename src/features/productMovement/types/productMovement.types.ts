import { z } from "zod";
import { PRODUCT_MOVEMENT_TYPE } from "@/constants/system";

export const productMovementSchema = z
    .object({
        id: z.number().optional(),
        product_id: z.number().optional(),
        type: z.enum(PRODUCT_MOVEMENT_TYPE),
        quantity: z.number().positive(),
        note: z.string(),
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

