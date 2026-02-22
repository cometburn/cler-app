import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchProducts
} from "../api/product.api";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Booking } from "../types/booking.types";
import { ApiError } from "@/shared/types/apiError.types";
import { toast } from "sonner";
import { ProductResponse } from "../types/product.types";

const PRODUCTS_QUERY_KEY = ["products"];

export function useProducts(page: number, limit: number, category?: string, search?: string) {
    return useQuery<ProductResponse, Error>({
        queryKey: [...PRODUCTS_QUERY_KEY, page, limit, category, search],
        queryFn: () => {
            return fetchProducts(page, limit, category, search)
        },
        enabled: true,
    });
}

