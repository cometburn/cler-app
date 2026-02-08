"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";

import { RoomRate, RoomRateForm, roomRateSchema } from "@/features/roomRates/types/roomRate.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { rateTypeOptions } from "@/constants/system";
import { useRoomTypes } from "@/features/roomTypes/hooks/useRoomTypes";


interface RoomRateDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<RoomRate> | null;
    onSubmit: (data: RoomRate) => void | Promise<void>;
}

export const RoomRateDialog = ({
    mode = "add",
    trigger,
    initialData,
    onSubmit,
}: RoomRateDialogProps) => {
    const [open, setOpen] = useState(false);

    const { data } = useRoomTypes(1, 100);
    const roomTypes = data?.data ?? [];

    const defaultValues: RoomRate = useMemo(
        () => ({
            name: "",
            rate_type: "hourly",
            duration_minutes: 60,
            base_price: 500,
            extra_person_rate: 0,
            is_dynamic: false,
            room_type_id: 0
        }),
        []
    );

    const form = useForm<RoomRateForm>({
        resolver: zodResolver(roomRateSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });
    }, [initialData, open, form, defaultValues]);

    const watchRateType = form.watch("rate_type");
    const watchDuration = form.watch("duration_minutes") ?? 60;

    const handleSubmit = async (values: RoomRateForm) => {
        const parsed = roomRateSchema.parse(values);
        await onSubmit(parsed);
        setOpen(false);
        form.reset(defaultValues);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <button className="flex items-center p-0.5 text-white rounded-full bg-green-600 hover:bg-green-700 float-right">
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="bg-white max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add Room Rate" : "Edit Room Rate"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === "add"
                            ? "Fill out the form to create a new room rate."
                            : "Update the room rate details below."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter rate name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Room type */}
                        <FormField
                            control={form.control}
                            name="room_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Type</FormLabel>
                                    <Select
                                        value={field.value !== undefined ? String(field.value) : ""}
                                        onValueChange={(val) =>
                                            field.onChange(val ? Number(val) : undefined)
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select room type" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {roomTypes.length > 0 ? (
                                                roomTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem disabled value="no-types">
                                                    No room types available
                                                </SelectItem>
                                            )}
                                        </SelectContent>

                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Rate Type */}
                        <FormField
                            control={form.control}
                            name="rate_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rate Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select rate type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rateTypeOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duration */}
                        {watchRateType === "hourly" && (
                            <FormField
                                control={form.control}
                                name="duration_minutes"
                                render={({ field }) => {
                                    const hours = Math.floor(watchDuration / 60);
                                    const mins = watchDuration % 60;

                                    return (
                                        <FormItem>
                                            <FormLabel>Duration</FormLabel>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={hours}
                                                    onChange={(e) => {
                                                        const newHours = Number(e.target.value) || 0;
                                                        field.onChange(newHours * 60 + mins);
                                                    }}
                                                    className="w-24"
                                                    placeholder="Hours"
                                                />
                                                <span>h</span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={59}
                                                    value={mins}
                                                    onChange={(e) => {
                                                        const newMins = Number(e.target.value) || 0;
                                                        field.onChange(hours * 60 + newMins);
                                                    }}
                                                    className="w-24"
                                                    placeholder="Mins"
                                                />
                                                <span>min</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        )}

                        {/* Base Price */}
                        <FormField
                            control={form.control}
                            name="base_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(Number(e.target.value) || 0)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Extra Person Rate */}
                        <FormField
                            control={form.control}
                            name="extra_person_rate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Extra Person Rate</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(Number(e.target.value) || 0)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dynamic Pricing */}
                        <FormField
                            control={form.control}
                            name="is_dynamic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>With Promos</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 text-gray-500"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-green-500">
                                {mode === "add" ? "Save" : "Update"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
