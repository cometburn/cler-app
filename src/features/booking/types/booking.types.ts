import { z } from "zod";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { BookingAddon } from "@/features/bookingAddon/types/bookingAddon.types";
import { Order } from "@/features/order/types/order.types";
import { BookingCharge, bookingChargeSchema } from "@/features/bookingCharge/types/bookingCharge.types";


// Booking addon schema for input (used in forms)
const bookingAddonInputSchema = z.object({
    id: z.number().optional(),
    booking_id: z.number().optional(),
    room_id: z.number().optional(),
    user_id: z.number().optional(),
    product_id: z.number(),
    quantity: z.number().optional().default(1),
    price: z.number().optional().default(0),
    total_price: z.number().optional().default(0),
    product: z.any().optional(),
});

// Order schema for input
const orderInputSchema = z.object({
    id: z.number().optional(),
    hotel_id: z.number().optional(),
    booking_id: z.number().optional(),
    status: z.string().optional(),
    total_price: z.number().optional(),
    notes: z.string().optional().nullable(),
    order_items: z.array(z.any()).optional(),
}).optional().nullable();

// ==========================================
// BASE BOOKING SCHEMA
// ==========================================

const baseBookingSchema = z.object({
    room_rate_id: z.number().min(1, "Room rate is required"),
    start_datetime: z.date({ message: "Start date is required" }),
    end_datetime: z.date({ message: "End date is required" }),
    extra_person: z.number().optional().nullable(),
    status: z.enum(BOOKING_STATUS),
    note: z.string().optional().nullable(),
}).refine(
    (data) => data.start_datetime <= data.end_datetime,
    {
        message: "Start date must not be greater than end date",
        path: ["start_datetime"],
    }
);

// ==========================================
// CREATE BOOKING SCHEMA
// ==========================================

export const createBookingSchema = baseBookingSchema.extend({
    room_id: z.number(),
    payment_status: z.enum(PAYMENT_STATUS).optional().nullable(),
    payment_type: z.enum(PAYMENT_TYPE).optional().nullable(),
    total_price: z.number().min(1).positive(),
});

// ==========================================
// UPDATE BOOKING SCHEMA
// ==========================================

export const updateBookingSchema = baseBookingSchema.extend({
    id: z.number(),
    room_id: z.number(),
    total_price: z.number().min(0),
    payment_status: z.enum(PAYMENT_STATUS, {
        message: "Invalid payment status",
    }).optional(),
    payment_type: z.enum(PAYMENT_TYPE, {
        message: "Invalid payment type",
    }).optional(),
    booking_addons: z.array(bookingAddonInputSchema).optional(),
    orders: orderInputSchema,
    booking_charges: z.array(bookingChargeSchema).optional(),
});

// ==========================================
// CANCEL BOOKING SCHEMA
// ==========================================

export const cancelBookingSchema = z.object({
    id: z.number(),
    room_id: z.number(),
    room_rate_id: z.number(),
    start_datetime: z.coerce.date(),
    end_datetime: z.coerce.date(),
    status: z.literal(BOOKING_STATUS[4]), // Must be "cancelled"
    payment_status: z.enum(PAYMENT_STATUS).optional(),
    payment_type: z.enum(PAYMENT_TYPE).optional(),
    total_price: z.number().optional(),
    extra_person: z.number().optional(),
    note: z.string().optional(),
});

// ==========================================
// Transfer BOOKING SCHEMA
// ==========================================

export const transferBookingSchema = baseBookingSchema.extend({
    id: z.number(),
    original_booking_id: z.number(),
    room_type_id: z.number({ message: "Room type is required" }),
    room_id: z.number().min(1, "Room is required"),
    booking_charges: z.array(bookingChargeSchema).optional(),
    booking_addons: z.array(bookingAddonInputSchema).optional(),
    orders: z.array(orderInputSchema).optional(),
})

// ==========================================
// INFERRED TYPES FROM SCHEMAS
// ==========================================

// Input types (what forms send)
export type CreateBookingInput = z.input<typeof createBookingSchema>;
export type UpdateBookingInput = z.input<typeof updateBookingSchema>;
export type CancelBookingInput = z.input<typeof cancelBookingSchema>;
export type TransferBookingInput = z.input<typeof transferBookingSchema>;

// Output types (what validation produces)
export type CreateBooking = z.output<typeof createBookingSchema>;
export type UpdateBooking = z.output<typeof updateBookingSchema>;
export type CancelBooking = z.output<typeof cancelBookingSchema>;
export type TransferBooking = z.output<typeof transferBookingSchema>;

// Aliases for convenience
export type CreateBookingForm = CreateBookingInput;
export type UpdateBookingForm = UpdateBookingInput;
export type TransferBookingForm = TransferBookingInput;

// ==========================================
// API RESPONSE TYPE
// ==========================================

// Keep original Booking type for API responses
export type Booking = {
    id?: number;
    hotel_id?: number;
    user_id?: number;
    room_id: number;
    room_rate_id: number;
    start_datetime: Date;
    end_datetime: Date;
    extra_person?: number;
    total_price: number;
    status: string;
    payment_status?: string | null;
    payment_type?: string | null;
    note?: string | null;
    booking_addons?: BookingAddon[];
    orders?: Order;
    booking_charges?: BookingCharge[];
    created_at?: Date;
    updated_at?: Date;
    // Relations
    room?: any;
    room_rate?: any;
    user?: any;
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export const bookingSchema = updateBookingSchema;