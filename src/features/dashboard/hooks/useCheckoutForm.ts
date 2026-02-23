import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BOOKING_STATUS, GRACE_PERIOD, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { Booking, bookingSchema } from "../../booking/types/booking.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "../../booking/api/booking.api";
import { useUpdateBooking } from "../../booking/hooks/useBookings";
import { isOverTime } from "@/helpers/date.helper";
import { useOverstay } from "./useOverstay";
import { toast } from "sonner";
import { ApiError } from "@/shared/types/apiError.types";

interface UseCheckOutFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialData?: Partial<Booking> | null;
    roomData?: Partial<Room> | null;
}

export const useCheckOutForm = ({ open, setOpen, initialData, roomData }: UseCheckOutFormProps) => {
    const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
    const [roomRate, setRoomRate] = useState<RoomRate>({} as RoomRate);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [isWithinGracePeriod, setIsWithinGracePeriod] = useState(
        () => !!initialData?.start_datetime && !isOverTime(initialData.start_datetime, GRACE_PERIOD)
    );
    const [addonsTotal, setAddonsTotal] = useState(0);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const hasLoadedRates = useRef(false);

    const updateMutation = useUpdateBooking();
    const { overstayMinutes, billedHours, isOverdue } = useOverstay(initialData?.end_datetime);

    const defaultValues = useMemo<Partial<Booking>>(
        () => ({
            name: "",
            room_id: 0,
            room_rate_id: 0,
            start_datetime: undefined,
            end_datetime: undefined,
            status: "check_in",
            payment_status: "",
            payment_type: "",
            total_price: 0,
            extra_person: 0,
            note: "",
            booking_addons: [], // Add this
        }),
        []
    );

    const form = useForm<Booking>({
        resolver: zodResolver(bookingSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    const extraPerson = form.watch("extra_person") ?? 0;
    const extraPersonCharge = extraPerson * (roomRate?.extra_person_rate ?? 0);
    const overstayCharge = billedHours * (roomRate?.overstay_rate ?? 0);

    // Calculate addons total from booking_addons if exists
    useEffect(() => {
        const bookingAddons = form.watch("booking_addons") || [];
        const total = bookingAddons.reduce((sum, addon) => sum + (addon.total_price || 0), 0);
        setAddonsTotal(total);
    }, [form.watch("booking_addons")]);

    useEffect(() => {
        const orderItems = form.watch("orders.order_items") || [];
        const total = orderItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
        setOrdersTotal(total);
    }, [form.watch("orders.order_items")]);

    const total = (roomRate?.base_price ?? 0) + extraPersonCharge + overstayCharge + addonsTotal + ordersTotal;

    const roomTypeId = useMemo(() => roomData?.room_type_id, [roomData?.room_type_id]);

    useEffect(() => {
        if (!open) {
            hasLoadedRates.current = false;
            return;
        }

        // Skip if we've already loaded rates for this dialog session
        if (hasLoadedRates.current) {
            return;
        }

        let isCancelled = false;


        const loadRoomRates = async () => {
            if (!roomTypeId) {
                setRoomRates([]);
                return;
            }

            try {
                setIsLoadingRates(true);
                const data = await fetchRoomRatesByRoomType(roomTypeId);

                if (isCancelled) return;

                setRoomRates(data ?? []);

                let matchedRate: RoomRate | undefined;
                if (initialData?.room_rate_id) {
                    matchedRate = data?.find((rate) => rate.id === Number(initialData.room_rate_id));
                    if (matchedRate) {
                        setRoomRate(matchedRate);
                    }
                }

                if (initialData) {
                    form.reset({
                        ...defaultValues,
                        ...initialData,
                        start_datetime: initialData.start_datetime ? new Date(initialData.start_datetime) : undefined,
                        end_datetime: initialData.end_datetime ? new Date(initialData.end_datetime) : undefined,
                        room_rate_id: initialData.room_rate_id ? Number(initialData.room_rate_id) : undefined,
                        booking_addons: initialData.booking_addons || [],
                    });
                } else {
                    form.reset(defaultValues);
                }

                hasLoadedRates.current = true;

            } catch (error) {
                if (isCancelled) return;
                console.error("Error fetching room rates:", error);
                setRoomRates([]);
            } finally {
                if (!isCancelled) {
                    setIsLoadingRates(false);
                }
            }
        };

        loadRoomRates();

        return () => {
            isCancelled = true;
        };
    }, [open]);

    useEffect(() => {
        if (isLoadingRates || !roomRate?.id) {
            return;
        }

        const calculatedTotal = (roomRate.base_price ?? 0) +
            (extraPerson * (roomRate.extra_person_rate ?? 0)) +
            (billedHours * (roomRate.overstay_rate ?? 0)) +
            addonsTotal +
            ordersTotal;

        form.setValue("total_price", calculatedTotal, { shouldDirty: true });
    }, [isLoadingRates, roomRate?.id, roomRate?.base_price, roomRate?.extra_person_rate, roomRate?.overstay_rate, extraPerson, billedHours, addonsTotal, ordersTotal, form])

    useEffect(() => {
        if (!initialData?.start_datetime) return;

        const check = () => setIsWithinGracePeriod(!isOverTime(initialData.start_datetime!, GRACE_PERIOD));
        check();
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [initialData?.start_datetime]);

    const handleRoomRateChange = (value: string) => {
        if (!value) return;
        form.setValue("room_rate_id", Number(value));

        const newDate = new Date();
        form.setValue("start_datetime", newDate);

        const selected = roomRates.find((rate) => rate.id === Number(value));
        if (selected) {
            setRoomRate(selected);

            if (selected.duration_minutes) {
                const newEndDate = new Date(newDate.setMinutes(newDate.getMinutes() + selected.duration_minutes));
                form.setValue("end_datetime", newEndDate);
            }
        }
    };

    const handleExtraPersonChange = (value: number) => value;

    const handleCancelBooking = async () => {
        if (!initialData) return;
        const payload = {
            ...initialData,
            start_datetime: initialData.start_datetime ? new Date(initialData.start_datetime) : undefined,
            end_datetime: initialData.end_datetime ? new Date(initialData.end_datetime) : undefined,
            status: BOOKING_STATUS[4],
            payment_status: PAYMENT_STATUS[3],
            payment_type: PAYMENT_TYPE[5],
            room_id: roomData?.id,
        };

        await updateMutation.mutateAsync(bookingSchema.parse(payload), {
            onSuccess: () => {
                toast.success("Booking cancelled successfully");
                setOpen(false);
            },
        });
    };

    const handleSubmit = async (values: Booking) => {
        try {
            const { start_datetime, end_datetime, ...rest } = values;
            const payload = {
                ...rest,
                ...(start_datetime != null ? { start_datetime } : {}),
                ...(end_datetime != null ? { end_datetime } : {}),
                status: BOOKING_STATUS[1],
                room_id: roomData?.id,
            };

            await updateMutation.mutateAsync(bookingSchema.parse(payload), {
                onSuccess: () => {
                    toast.success("Checked out successfully");
                    setOpen(false);
                },
            });
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path?.length > 0) {
                        form.setError(err.path[0] as keyof Booking, {
                            type: "manual",
                            message: err.message,
                        });
                    }
                });
            }
        }
    };

    return {
        form,
        roomRates,
        roomRate,
        isLoadingRates,
        isWithinGracePeriod,
        isOverdue,
        overstayMinutes,
        billedHours,
        overstayCharge,
        extraPerson,
        total,
        updateMutation,
        addonsTotal,
        ordersTotal,
        setAddonsTotal,
        setOrdersTotal,
        handleRoomRateChange,
        handleExtraPersonChange,
        handleCancelBooking,
        handleSubmit,
    };
};