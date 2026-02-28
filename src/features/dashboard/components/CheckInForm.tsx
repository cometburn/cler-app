import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePickerField } from "@/components/fields/datePicker/DatePickerField";

import { Booking, CreateBooking, CreateBookingForm, createBookingSchema } from "../../booking/types/booking.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { ApiError } from "@/shared/types/apiError.types";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "../../roomRate/api/roomRate.api";
import { useCreateBooking } from "../../booking/hooks/useBookings";
import { BOOKING_STATUS } from "@/constants/system";
import { toast } from "sonner";

interface CheckInFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialData?: Partial<Booking> | null;
    roomData?: Partial<Room> | null;
}

export const CheckInForm = ({ open, setOpen, initialData, roomData }: CheckInFormProps) => {
    const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
    const [roomRate, setRoomRate] = useState<RoomRate>({} as RoomRate);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const hasInitialized = useRef(false); // ✅ Track if we've initialized

    const createMutation = useCreateBooking();

    // ✅ Move defaultValues inside useMemo
    const defaultValues = useMemo<Partial<CreateBookingForm>>(() => ({
        room_id: 0,
        room_rate_id: 0,
        start_datetime: undefined,
        end_datetime: undefined,
        status: "check_in",
        payment_status: null,
        payment_type: null,
        total_price: 0,
        extra_person: undefined,
        note: "",
    }), []); // Empty deps - never changes

    const form = useForm<CreateBookingForm>({
        resolver: zodResolver(createBookingSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    // ✅ Separate effect for loading room rates
    useEffect(() => {
        if (!open || !roomData?.room_type_id) {
            setRoomRates([]);
            return;
        }

        let isMounted = true;

        const loadRoomRates = async () => {
            try {
                setIsLoadingRates(true);
                const data = await fetchRoomRatesByRoomType(roomData.room_type_id!);
                if (isMounted) {
                    setRoomRates(data ?? []);
                }
            } catch (error) {
                console.error('Error fetching room rates:', error);
                if (isMounted) {
                    setRoomRates([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingRates(false);
                }
            }
        };

        loadRoomRates();

        return () => {
            isMounted = false;
        };
    }, [open, roomData?.room_type_id]); // ✅ Only depend on open and room_type_id

    // ✅ Separate effect for initializing form data
    useEffect(() => {
        // Only run when dialog opens and we haven't initialized
        if (!open) {
            hasInitialized.current = false;
            return;
        }

        // Prevent re-initialization if already done for this open session
        if (hasInitialized.current) {
            return;
        }

        if (initialData) {
            form.reset({
                ...defaultValues,
                ...initialData,
                start_datetime: initialData.start_datetime
                    ? new Date(initialData.start_datetime)
                    : undefined,
                end_datetime: initialData.end_datetime
                    ? new Date(initialData.end_datetime)
                    : undefined,
            });
        } else {
            form.reset(defaultValues);
        }

        hasInitialized.current = true;
    }, [open, initialData, form, defaultValues]); // ✅ Still has form but with guard

    /**
     * Handle room rate change
     */
    const handleRoomRateChange = useCallback(async (value: string) => {
        if (!value) return;

        const rateId = Number(value);
        form.setValue("room_rate_id", rateId);
        await form.trigger("room_rate_id");

        const selectedRate = roomRates.find((rate) => rate.id === rateId);

        if (selectedRate) {
            setRoomRate(selectedRate);

            const newDate = new Date();
            form.setValue("start_datetime", newDate);

            if (selectedRate.duration_minutes) {
                const newEndDate = new Date(newDate);
                newEndDate.setMinutes(newEndDate.getMinutes() + selectedRate.duration_minutes);
                form.setValue("end_datetime", newEndDate);
            }

            // Calculate total price
            const extraPerson = form.getValues("extra_person") || 0;
            const extraPersonPrice = (selectedRate.extra_person_rate || 0) * extraPerson;
            const totalPrice = (selectedRate.base_price || 0) + extraPersonPrice;
            form.setValue("total_price", Number(totalPrice.toFixed(2)));

            // Trigger validations
            await Promise.all([
                form.trigger("start_datetime"),
                form.trigger("end_datetime"),
                form.trigger("total_price")
            ]);
        }
    }, [roomRates, form]);

    /**
     * Handle extra person change
     */
    const handleExtraPersonChange = useCallback((value: number) => {
        if (!roomRate?.base_price) return value;

        const extraPersonPrice = (roomRate.extra_person_rate || 0) * value;
        const totalPrice = roomRate.base_price + extraPersonPrice;
        form.setValue("total_price", Number(totalPrice.toFixed(2)));

        return value;
    }, [roomRate, form]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(async (values: CreateBooking) => {
        try {
            const { start_datetime, end_datetime, ...rest } = values;

            const payload = {
                ...rest,
                ...(start_datetime != null ? { start_datetime } : {}),
                ...(end_datetime != null ? { end_datetime } : {}),
                status: BOOKING_STATUS[0],
                room_id: roomData?.id,
            };

            await createMutation.mutateAsync(createBookingSchema.parse(payload), {
                onSuccess: () => {
                    toast.success("Checked in successfully");
                    setOpen(false);
                }
            });
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof CreateBookingForm;
                        form.setError(fieldPath, {
                            type: "manual",
                            message: err.message,
                        });
                    }
                });
            } else {
                toast.error("Failed to check in");
            }
        }
    }, [roomData?.id, createMutation, form, setOpen]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                    console.log('Validation errors:', errors);
                    toast.error("Please check the form for errors");
                })}
                className="space-y-4"
            >
                {/* Room Rate */}
                <FormField
                    control={form.control}
                    name="room_rate_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Rate</FormLabel>
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={handleRoomRateChange}
                                disabled={isLoadingRates}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                isLoadingRates
                                                    ? "Loading rates..."
                                                    : "Select rate"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                    {isLoadingRates ? (
                                        <SelectItem disabled value="loading">
                                            Loading...
                                        </SelectItem>
                                    ) : roomRates?.length ? (
                                        roomRates.map((rate: RoomRate) => (
                                            <SelectItem key={rate.id} value={String(rate.id)}>
                                                {rate.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem disabled value="no-rates">
                                            No rates available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dates */}
                <div className="flex flex-col md:flex-row gap-4">
                    <DateTimePickerField
                        control={form.control}
                        name="start_datetime"
                        label="Start Date & Time"
                        wrapperClassName="flex-1"
                    />

                    <DateTimePickerField
                        control={form.control}
                        name="end_datetime"
                        label="End Date & Time"
                        wrapperClassName="flex-1"
                    />
                </div>

                {/* Extra Person Count */}
                <FormField
                    control={form.control}
                    name="extra_person"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Extra Person</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? undefined : Number(e.target.value);
                                        field.onChange(handleExtraPersonChange(value ?? 0));
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Price */}
                <FormField
                    control={form.control}
                    name="total_price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                                        field.onChange(isNaN(val) ? 0 : val);
                                    }}
                                    className="px-0 text-right !text-4xl border-none focus:border-none focus:outline-none focus:ring-0 active:border-none active:outline-none active:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Note */}
                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    rows={6}
                                    className="h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actions */}
                <div className="flex flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex-1 text-gray-500"
                    >
                        Close
                    </Button>
                    <Button
                        type="submit"
                        className="flex-3 bg-green-500 hover:bg-green-600"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "Checking in..." : "Check In"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};