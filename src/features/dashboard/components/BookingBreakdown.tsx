import { formatCurrency } from "@/helpers/string.helper";
import { BookingBreakdownProps } from "../types/dashboard.types";


export const BookingBreakdown = ({
    roomCharge,
    extraPerson,
    extraPersonRate,
    overstayMinutes,
    billedHours,
    overstayRate,
    overstayCharge,
    addonsTotal = 0,
    ordersTotal = 0,
    bookingChargesTotal = 0,
}: BookingBreakdownProps) => {
    const extraPersonCharge = extraPerson ? extraPerson * extraPersonRate : 0;

    const formatOverstay = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="border-b border-gray-200 text-xs space-y-1 pb-2">
            <h5 className="border-b border-gray-200 pb-1 font-bold text-gray-400">Breakdown</h5>
            <div className="flex justify-between text-gray-600">
                <span>Room Charge</span>
                <span>{formatCurrency(roomCharge, { currencySymbol: "" })}</span>
            </div>

            {!!extraPerson && extraPerson > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span>Extra Person ({extraPerson} pax x {formatCurrency(extraPersonRate, { currencySymbol: "" })})</span>
                    <span>{formatCurrency(extraPersonCharge, { currencySymbol: "" })}</span>
                </div>
            )}

            {overstayMinutes > 0 && (
                <div className="flex justify-between text-red-500">
                    <span>Overstay ({formatOverstay(overstayMinutes)} → {billedHours}hr billed x {formatCurrency(overstayRate, { currencySymbol: "" })})</span>
                    <span>{formatCurrency(overstayCharge, { currencySymbol: "" })}</span>
                </div>
            )}

            {addonsTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Room Add-ons</span>
                    <span>{formatCurrency(addonsTotal, { currencySymbol: "" })}</span>
                </div>
            )}

            {bookingChargesTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Booking Charges</span>
                    <span>{formatCurrency(bookingChargesTotal, { currencySymbol: "" })}</span>
                </div>
            )}

            {ordersTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Orders</span>
                    <span>{formatCurrency(ordersTotal, { currencySymbol: "" })}</span>
                </div>
            )}

            {/* <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
            </div> */}
        </div>
    );
};