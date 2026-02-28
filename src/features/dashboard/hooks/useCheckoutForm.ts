import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BOOKING_STATUS, GRACE_PERIOD, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { Booking, updateBookingSchema, cancelBookingSchema } from "../../booking/types/booking.types";
import type { UpdateBooking, CancelBooking, UpdateBookingInput } from "../../booking/types/booking.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "../../roomRate/api/roomRate.api";
import { useUpdateBooking, useCancelBooking } from "../../booking/hooks/useBookings";
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

    const hasLoadedRates = useRef(false);

    const updateMutation = useUpdateBooking();
    const cancelMutation = useCancelBooking();
    const { overstayMinutes, billedHours, isOverdue } = useOverstay(initialData?.end_datetime);

    const defaultValues = useMemo<Partial<UpdateBooking>>(
        () => ({
            room_id: 0,
            room_rate_id: 0,
            start_datetime: undefined,
            end_datetime: undefined,
            status: "check_in",
            payment_status: "",
            payment_type: "",
            total_price: 0,
            extra_person: 0,
            note: null,
            booking_addons: [],
            orders: null,
        }),
        []
    );

    const form = useForm<UpdateBookingInput>({
        resolver: zodResolver(updateBookingSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    //  Use useWatch instead of form.watch in dependencies
    const extraPerson = useWatch({
        control: form.control,
        name: "extra_person",
        defaultValue: 0
    });

    const bookingAddons = useWatch({
        control: form.control,
        name: "booking_addons",
        defaultValue: []
    });

    const orderItems = useWatch({
        control: form.control,
        name: "orders.order_items",
        defaultValue: []
    });

    const bookingCharges = useWatch({
        control: form.control,
        name: "booking_charges",
        defaultValue: []
    });

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

    const extraPersonCharge = extraPerson && extraPerson > 0 ? extraPerson * (roomRate?.extra_person_rate ?? 0) : 0;
    const overstayCharge = billedHours && billedHours > 0 ? billedHours * (roomRate?.overstay_rate ?? 0) : 0;

    //  Calculate total directly
    const total = useMemo(() =>
        (roomRate?.base_price ?? 0) + extraPersonCharge + overstayCharge + addonsTotal + ordersTotal + bookingChargesTotal,
        [roomRate?.base_price, extraPersonCharge, overstayCharge, addonsTotal, ordersTotal, bookingChargesTotal]
    );

    const roomTypeId = useMemo(() => roomData?.room_type_id, [roomData?.room_type_id]);

    //  Load room rates effect (keep as is, it's fine)
    useEffect(() => {
        if (!open) {
            hasLoadedRates.current = false;
            return;
        }

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
                        id: initialData.id,
                        start_datetime: initialData.start_datetime ? new Date(initialData.start_datetime) : undefined,
                        end_datetime: initialData.end_datetime ? new Date(initialData.end_datetime) : undefined,
                        room_rate_id: initialData.room_rate_id ? Number(initialData.room_rate_id) : undefined,
                        booking_addons: initialData.booking_addons || [],
                        orders: initialData.orders || null,
                        payment_status: "",
                        payment_type: "",
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
    }, [open, roomTypeId, initialData, form, defaultValues]);

    //  Single effect to update total_price when calculations change
    useEffect(() => {
        if (isLoadingRates || !roomRate?.id) {
            return;
        }

        form.setValue("total_price", total, {
            shouldDirty: false,
            shouldValidate: false,
            shouldTouch: false,
        });
    }, [total, roomRate?.id, isLoadingRates, form]); // Only depend on total, not individual pieces

    //  Grace period effect
    useEffect(() => {
        if (!initialData?.start_datetime) return;

        const check = () => setIsWithinGracePeriod(!isOverTime(initialData.start_datetime!, GRACE_PERIOD));
        check();
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [initialData?.start_datetime]);

    //  Memoize handlers to prevent unnecessary re-renders
    const handleRoomRateChange = useCallback((value: string) => {
        if (!value) return;
        form.setValue("room_rate_id", Number(value));

        const newDate = new Date();
        form.setValue("start_datetime", newDate);

        const selected = roomRates.find((rate) => rate.id === Number(value));
        if (selected) {
            setRoomRate(selected);

            if (selected.duration_minutes) {
                const newEndDate = new Date(newDate.getTime() + selected.duration_minutes * 60000);
                form.setValue("end_datetime", newEndDate);
            }
        }
    }, [roomRates, form]);

    const handleExtraPersonChange = useCallback((value: number) => value, []);

    const handleCancelBooking = useCallback(async () => {
        if (!initialData?.id) return;

        const values = form.getValues();
        const payload: CancelBooking = {
            id: initialData.id,
            room_id: roomData?.id || initialData.room_id || 0,
            room_rate_id: initialData.room_rate_id || 0,
            start_datetime: values.start_datetime ? new Date(values.start_datetime) : new Date(),
            end_datetime: values.end_datetime ? new Date(values.end_datetime) : new Date(),
            status: BOOKING_STATUS[4],
            payment_status: PAYMENT_STATUS[3],
            payment_type: PAYMENT_TYPE[5],
            total_price: 0,
            extra_person: values.extra_person || 0,
            note: "Booking cancelled",
        };

        try {
            await cancelMutation.mutateAsync(cancelBookingSchema.parse(payload), {
                onSuccess: () => {
                    toast.success("Booking cancelled successfully");
                    setOpen(false);
                },
            });
        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast.error("Failed to cancel booking");
        }
    }, [initialData, roomData, cancelMutation, setOpen]);

    const handleSubmit = useCallback(async (values: UpdateBookingInput) => {
        try {
            const { start_datetime, end_datetime, orders, booking_addons, ...rest } = values;

            const payload = {
                ...rest,
                ...(start_datetime != null ? { start_datetime } : {}),
                ...(end_datetime != null ? { end_datetime } : {}),
                status: BOOKING_STATUS[1],
                room_id: roomData?.id,
            };

            await updateMutation.mutateAsync(updateBookingSchema.parse(payload), {
                onSuccess: () => {
                    toast.success("Checked out successfully");
                    setOpen(false);
                },
            });
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;
            console.log('errors', errors);
            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path?.length > 0) {
                        form.setError(err.path[0] as keyof UpdateBooking, {
                            type: "manual",
                            message: err.message,
                        });
                    }
                });
            } else {
                console.error("Error checking out:", error);
                toast.error("Failed to check out");
            }
        }
    }, [roomData?.id, updateMutation, form, setOpen]);

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
        bookingCharges,
        bookingChargesTotal,
        hasBookingCharges,
        handleRoomRateChange,
        handleExtraPersonChange,
        handleCancelBooking,
        handleSubmit,
    };
};