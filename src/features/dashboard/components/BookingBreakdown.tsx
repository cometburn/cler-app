interface BookingBreakdownProps {
    roomCharge: number;
    extraPerson: number;
    extraPersonRate: number;
    overstayMinutes: number;
    billedHours: number;
    overstayRate: number;
    overstayCharge: number;
    addonsTotal?: number;
    ordersTotal?: number;
    total: number;
}

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
    total,
}: BookingBreakdownProps) => {
    const extraPersonCharge = extraPerson * extraPersonRate;

    const formatOverstay = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="border-t border-b border-gray-200 py-2 text-xs space-y-2 mt-4">
            <div className="flex justify-between text-gray-600">
                <span>Room Charge</span>
                <span>{roomCharge.toFixed(2)}</span>
            </div>

            {extraPerson > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span>Extra Person ({extraPerson} pax)</span>
                    <span>{extraPersonCharge.toFixed(2)}</span>
                </div>
            )}

            {overstayMinutes > 0 && (
                <div className="flex justify-between text-red-500">
                    <span>Overstay ({formatOverstay(overstayMinutes)} → {billedHours}hr billed x {overstayRate.toFixed(2)})</span>
                    <span>{overstayCharge.toFixed(2)}</span>
                </div>
            )}

            {addonsTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Room Add-ons</span>
                    <span>{addonsTotal.toFixed(2)}</span>
                </div>
            )}

            {ordersTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="font-bold">Orders</span>
                    <span>{ordersTotal.toFixed(2)}</span>
                </div>
            )}

            {/* <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
            </div> */}
        </div>
    );
};