import { Booking } from "../types/booking.types";

interface UseCheckOutFormProps {
    initialData?: Partial<Booking> | null;
}

export const useBookingBreakdown = ({ initialData }: UseCheckOutFormProps) => {
    const endDate = initialData?.end_datetime ? new Date(initialData?.end_datetime) : undefined;
    const updatedDate = initialData?.updated_at ? new Date(initialData?.updated_at) : undefined;
    let overstayMinutes = 0;
    let billedHours = 0;
    let isOverdue = false;
    let minutes = 0
    let overstayBill = 0

    // Check for overstay
    if (updatedDate && endDate) {
        let diffMs = 0
        if (updatedDate.getTime() > endDate.getTime()) {
            diffMs = updatedDate.getTime() - endDate.getTime();
        }
        minutes = Math.max(0, Math.floor(diffMs / 60000));
    }


    if (minutes > 0) {
        overstayMinutes = minutes;
        billedHours = Math.floor(overstayMinutes / 60) + (overstayMinutes % 60 >= 15 ? 1 : 0);
        overstayBill = (billedHours + overstayMinutes) * (initialData?.room_rate?.overstay_rate ?? 0);
    }

    isOverdue = minutes > 0;

    const extraPerson = initialData?.extra_person ?? 0;

    const bookingAddons = initialData?.booking_addons ?? [];

    const orderItems = initialData?.orders?.order_items ?? [];

    const bookingCharges = initialData?.booking_charges ?? [];

    const addonsTotal = bookingAddons && bookingAddons.length > 0 ? bookingAddons.reduce((sum, addon) => sum + (addon.total_price || 0), 0) : 0

    const ordersTotal = orderItems && orderItems.length > 0 ? orderItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) : 0

    const bookingChargesTotal = bookingCharges && bookingCharges.length > 0 ? bookingCharges.reduce((sum, charge) => sum + (Number(charge.price) || 0), 0) : 0

    const hasBookingCharges = bookingCharges && bookingCharges.length > 0
    const hasBookingAddons = bookingAddons && bookingAddons.length > 0
    const hasBookingOrders = orderItems && orderItems.length > 0

    const extraPersonCharge = extraPerson && extraPerson > 0 ? extraPerson * (initialData?.room_rate?.extra_person_rate ?? 0) : 0;
    const overstayCharge = billedHours && billedHours > 0 ? billedHours * (initialData?.room_rate?.overstay_rate ?? 0) : 0;

    const total = (initialData?.room_rate?.base_price ?? 0) + extraPersonCharge + overstayCharge + addonsTotal + ordersTotal + bookingChargesTotal

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