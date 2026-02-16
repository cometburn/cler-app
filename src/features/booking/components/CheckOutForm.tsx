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

import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { removeUnderscore } from "@/helpers/string.helper";
import { Booking, bookingSchema } from "../types/booking.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { ApiError } from "@/shared/types/apiError.types";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "../api/booking.api";

interface CheckOutFormProps {
    setOpen: (open: boolean) => void;
    initialData?: Partial<Booking> | null;
    roomData?: Partial<Room> | null;
    onSubmit: (data: Booking) => void | Promise<void>;
}


export const CheckOutForm = ({ setOpen, initialData, roomData, onSubmit }: CheckOutFormProps) => {
    const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
    const [roomRate, setRoomRate] = useState<RoomRate>({} as RoomRate);
    const [isLoadingRates, setIsLoadingRates] = useState(false);

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

    const handleRoomRateChange = (value: string) => {
        form.setValue("room_rate_id", Number(value));

        const newDate = new Date();
        form.setValue("start_datetime", newDate);

        const roomRate = roomRates.find((rate) => rate.id === Number(value));

        if (roomRate) {
            setRoomRate(roomRate);

            if (roomRate.duration_minutes) {
                const newEndDate = new Date(newDate.setMinutes(newDate.getMinutes() + roomRate.duration_minutes))
                form.setValue("end_datetime", newEndDate);
            }

            const extraPerson = form.getValues("extra_person");

            if (extraPerson && roomRate.extra_person_rate) {
                const extraPersonPrice = roomRate.extra_person_rate * extraPerson;
                form.setValue("total_price", roomRate.base_price + extraPersonPrice);
            } else if (roomRate.base_price) {
                form.setValue("total_price", roomRate.base_price);
            }
        }
    };

    const handleExtraPersonChange = (value: number) => {
        const extraPersonPrice = roomRate?.extra_person_rate * value;
        form.setValue("total_price", roomRate?.base_price + extraPersonPrice);

        return value
    };


    const handleSubmit = async (values: Booking) => {
        try {
            const { start_datetime, end_datetime, ...rest } = values;

            const payload = {
                ...rest,
                ...(start_datetime != null ? { start_datetime } : {}),
                ...(end_datetime != null ? { end_datetime } : {}),
            };

            await onSubmit(payload as Booking);
            setOpen(false);
            form.reset(defaultValues);

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
                    <div className="flex flex-row gap-4 ">
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
                                        onChange={(e) => field.onChange(handleExtraPersonChange(Number(e.target.value)))}
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
                                <FormLabel>Total Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={field.value ? String(field.value) : ""}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            field.onChange(isNaN(val) ? 0 : val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Booking status */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={field.value ? String(field.value) : ""}
                                    onValueChange={(val) =>
                                        field.onChange(val ? String(val) : undefined)
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select rate" />
                                        </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                        {BOOKING_STATUS.map((status: string, index: number) => (
                                            <SelectItem key={index} value={String(status)}>
                                                {removeUnderscore(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment status */}
                    <FormField
                        control={form.control}
                        name="payment_status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Status</FormLabel>
                                <Select
                                    value={field.value ? String(field.value) : ""}
                                    onValueChange={(val) =>
                                        field.onChange(val ? String(val) : undefined)
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select rate" />
                                        </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                        {PAYMENT_STATUS.map((status: string, index: number) => (
                                            <SelectItem key={index} value={String(status)}>
                                                {removeUnderscore(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment status */}
                    <FormField
                        control={form.control}
                        name="payment_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Type</FormLabel>
                                <Select
                                    value={field.value ? String(field.value) : ""}
                                    onValueChange={(val) =>
                                        field.onChange(val ? String(val) : undefined)
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select rate" />
                                        </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                        {PAYMENT_TYPE.map((status: string, index: number) => (
                                            <SelectItem key={index} value={String(status)}>
                                                {removeUnderscore(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    <Textarea {...field} value={field.value ?? ""} rows={6} className="h-30" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex-1 text-gray-500"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                            Check In
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}