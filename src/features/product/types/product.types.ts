import { PRODUCT_CATEGORY, PRODUCT_UNIT } from "@/constants/system";
import { z } from "zod";

export const productSchema = z
    .object({
        id: z.number().optional(),
        name: z.string().min(1, "Name is required"),
        sku: z.string().optional().nullable(),
        category: z.enum(PRODUCT_CATEGORY),
        price: z.number().positive(),
        track_stock: z.boolean().optional().default(true),
        unit: z.enum(PRODUCT_UNIT),
        is_active: z.boolean().optional().default(true),
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

