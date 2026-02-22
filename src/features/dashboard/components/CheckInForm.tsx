import { useEffect, useMemo, useState } from "react";
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

import { Booking, bookingSchema } from "../../booking/types/booking.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { ApiError } from "@/shared/types/apiError.types";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "../../booking/api/booking.api";
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

    const createMutation = useCreateBooking();

    const defaultValues = useMemo<Partial<Booking>>(
        () => ({
            name: "",
            room_id: 0,
            room_rate_id: 0,
            start_datetime: undefined,
            end_datetime: undefined,
            status: "check_in",
            payment_status: undefined,
            payment_type: undefined,
            total_price: 0,
            extra_person: 0,
            note: "",
        }),
        []
    );

    const form = useForm<Booking>({
        resolver: zodResolver(bookingSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    useEffect(() => {
        if (!open) return;
        // Fetch room rates when dialog opens
        const loadRoomRates = async () => {
            if (!roomData?.room_type_id) {
                setRoomRates([]);
                return;
            }

            try {
                setIsLoadingRates(true);
                const data = await fetchRoomRatesByRoomType(roomData.room_type_id);
                setRoomRates(data ?? []);
            } catch (error) {
                console.error('Error fetching room rates:', error);
                setRoomRates([]);
            } finally {
                setIsLoadingRates(false);
            }
        };

        loadRoomRates();

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
    }, [open, roomData?.room_type_id, initialData, form, defaultValues]);


    /**
     * Handle room rate change
     */
    const handleRoomRateChange = async (value: string) => {
        form.setValue("room_rate_id", Number(value));
        await form.trigger("room_rate_id");

        const newDate = new Date();
        form.setValue("start_datetime", newDate);
        await form.trigger("start_datetime");

        const roomRate = roomRates.find((rate) => rate.id === Number(value));

        if (roomRate) {
            setRoomRate(roomRate);

            if (roomRate.duration_minutes) {
                const newEndDate = new Date(newDate.getTime());
                newEndDate.setMinutes(newEndDate.getMinutes() + roomRate.duration_minutes);
                form.setValue("end_datetime", newEndDate);
                await form.trigger("end_datetime");
            }

            const extraPerson = form.getValues("extra_person");

            if (extraPerson && roomRate.extra_person_rate) {
                const extraPersonPrice = roomRate.extra_person_rate * extraPerson;
                const totalPrice = roomRate.base_price + extraPersonPrice;
                form.setValue("total_price", Number(totalPrice.toFixed(2)));
            } else if (roomRate.base_price) {
                form.setValue("total_price", Number(roomRate.base_price.toFixed(2)));
            }

            await form.trigger("total_price");
        }
    };


    /**
     * Handle extra person change
     */
    const handleExtraPersonChange = (value: number) => {
        const extraPersonPrice = roomRate?.extra_person_rate * value;
        const totalPrice = roomRate.base_price + extraPersonPrice;
        form.setValue("total_price", Number(totalPrice.toFixed(2)));

        return value
    };


    /**
     * Handle form submission
     */
    const handleSubmit = async (values: Booking) => {
        try {
            const { start_datetime, end_datetime, ...rest } = values;

            const payload = {
                ...rest,
                ...(start_datetime != null ? { start_datetime } : {}),
                ...(end_datetime != null ? { end_datetime } : {}),
                status: BOOKING_STATUS[0],
                room_id: roomData?.id,
            };

            await createMutation.mutateAsync(bookingSchema.parse(payload), {
                onSuccess: () => {
                    toast.success("Checked in successfully");
                },
            });
            setOpen(false);
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof Booking;

                        form.setError(fieldPath, {
                            type: "manual",
                            message: err.message,
                        });
                    }
                });
            }
        }
    };


    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
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
                                    disabled={isLoadingRates} // Disable while loading
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
                    <div className="flex flex-col md:flex-row gap-4 ">
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
                                        value={field.value ? String(field.value) : ""}
                                        onChange={(e) => {
                                            field.onChange(handleExtraPersonChange(Number(e.target.value)))
                                            return Number(e.target.value)
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
                                        value={field.value ? String(field.value) : ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
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
                                    <Textarea {...field} value={field.value ?? ""} rows={6} className="h-10" />
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
                        <Button type="submit" className="flex-3 bg-green-500 hover:bg-green-600">
                            Check In
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}