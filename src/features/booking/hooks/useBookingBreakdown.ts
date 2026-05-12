import { Booking } from "../types/booking.types";
import { useMemo } from "react";
import { useOverstay } from "@/features/dashboard/hooks/useOverstay";

interface UseCheckOutFormProps {
    initialData?: Partial<Booking> | null;
}

export const useBookingBreakdown = ({ initialData }: UseCheckOutFormProps) => {
    const endDate = initialData?.end_datetime
    const updatedDate = initialData?.updated_at

    const { overstayMinutes, billedHours, isOverdue } = useOverstay(endDate, updatedDate);

    const extraPerson = initialData?.extra_person ?? 0;

    const bookingAddons = initialData?.booking_addons ?? [];

    const orderItems = initialData?.orders?.order_items ?? [];

    const bookingCharges = initialData?.booking_charges ?? [];

    //  Calculate these values directly (no state, no effects)
    const addonsTotal = useMemo(() =>
        bookingAddons && bookingAddons.length > 0 ? bookingAddons.reduce((sum, addon) => sum + (addon.total_price || 0), 0) : 0,
        [bookingAddons]
    );

    const ordersTotal = useMemo(() =>
        orderItems && orderItems.length > 0 ? orderItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) : 0,
        [orderItems]
    );

    const bookingChargesTotal = useMemo(() =>
        bookingCharges && bookingCharges.length > 0 ? bookingCharges.reduce((sum, charge) => sum + (Number(charge.price) || 0), 0) : 0,
        [bookingCharges]
    );

    const hasBookingCharges = useMemo(() => bookingCharges && bookingCharges.length > 0, [bookingCharges]);
    const hasBookingAddons = useMemo(() => bookingAddons && bookingAddons.length > 0, [bookingAddons]);
    const hasBookingOrders = useMemo(() => orderItems && orderItems.length > 0, [orderItems]);


    const extraPersonCharge = extraPerson && extraPerson > 0 ? extraPerson * (initialData?.room_rate?.extra_person_rate ?? 0) : 0;
    const overstayCharge = billedHours && billedHours > 0 ? billedHours * (initialData?.room_rate?.overstay_rate ?? 0) : 0;

    //  Calculate total directly
    const total = useMemo(() =>
        (initialData?.room_rate?.base_price ?? 0) + extraPersonCharge + overstayCharge + addonsTotal + ordersTotal + bookingChargesTotal,
        [initialData?.room_rate?.base_price, extraPersonCharge, overstayCharge, addonsTotal, ordersTotal, bookingChargesTotal]
    );

    return {
        isOverdue,
        overstayMinutes,
        billedHours,
        overstayCharge,
        extraPerson,
        total,
        addonsTotal,
        ordersTotal,
        bookingCharges,
        bookingChargesTotal,
        hasBookingCharges,
        hasBookingAddons,
        hasBookingOrders,
    };

}