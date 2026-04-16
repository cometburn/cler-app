import { z } from "zod";
import { productWithoutInventory } from "@/features/product/types/product.types";

export const inventorySchema = z
    .object({
        id: z.number().optional(),
        product_id: z.number({ message: "Product is required" }),
        quantity: z.number().min(0, "Quantity cannot be negative"),
        reserved_qty: z.number().min(0, "Reserved quantity cannot be negative"),
        product: z.lazy(() => productWithoutInventory).optional(),
    });

export type Inventory = z.infer<typeof inventorySchema>;