import { z } from "zod";
import { PRODUCT_CATEGORY, PRODUCT_UNIT } from "@/constants/system";
import { inventorySchema } from "@/features/inventory/types/inventory.types";

export const productHistorySchema = z.array(z.object({
    id: z.number(),
    field: z.string(),
    old_value: z.string(),
    new_value: z.string(),
    created_at: z.string(),
    user: z.object({
        first_name: z.string(),
        last_name: z.string(),
    }),
})).optional();

export const productWithoutInventoryHistory = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional().nullable(),
    category: z.enum(PRODUCT_CATEGORY),
    price: z.number().positive(),
    unit: z.enum(PRODUCT_UNIT),
    track_stock: z.boolean(),
    is_active: z.boolean(),
});

export const productSchema = z
    .object({
        ...productWithoutInventoryHistory.shape,
        inventory: z.lazy(() => inventorySchema).optional(),
        product_history: z.lazy(() => productHistorySchema).optional(),
    });

export type Product = z.infer<typeof productSchema>;

export interface ProductResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

