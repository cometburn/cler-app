"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";

import { Room, roomSchema } from "../types/room.types";
import { useRoomTypes } from "@/features/roomType/hooks/useRoomTypes";
import { RoomType } from "@/features/roomType/types/roomType.types";
import { ApiError } from "@/shared/types/apiError.types";
import { OPERATIONAL_STATUS } from "@/constants/system";

interface RoomDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<Room> | null;
    onSubmit: (data: Room) => void | Promise<void>;
}

export const RoomDialog = ({
    mode = "add",
    trigger,
    initialData,
    onSubmit,
}: RoomDialogProps) => {
    const [open, setOpen] = useState(false);
    const { data } = useRoomTypes(1, 100);
    const roomTypes = data?.data ?? [];

    const defaultValues = useMemo<Room>(
        () => ({
            room_type_id: 0,
            name: "",
            floor: "",
            operational_status: "",
            notes: "",
        }),
        []
    );

    const form = useForm<Room>({
        resolver: zodResolver(roomSchema),
        defaultValues,
    });

    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });
    }, [open, initialData, form, defaultValues]);

    const handleSubmit = async (values: Room) => {
        try {
            await onSubmit(values);
            setOpen(false);
            form.reset(defaultValues);
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof Room;

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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <button className="flex items-center p-0.5 text-white rounded-full bg-green-600 hover:bg-green-700 cursor-pointer float-right">
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add Room Type" : "Edit Room Type"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === "add"
                            ? "Fill out the form to create a new room type."
                            : "Update the room type details below."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        {/* Room Rate */}
                        <FormField
                            control={form.control}
                            name="room_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Type</FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(val) =>
                                            field.onChange(val ? Number(val) : undefined)
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select rate" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {roomTypes?.length ? (
                                                roomTypes.map((type: RoomType) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem disabled value="no-rates">
                                                    No room types available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter room type name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Floor */}
                        <FormField
                            control={form.control}
                            name="floor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Floor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter floor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="operational_status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(val) =>
                                            field.onChange(val ? val : undefined)
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {OPERATIONAL_STATUS.map((type: string) => (
                                                <SelectItem key={type} value={String(type)}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter note" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Buttons */}
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 text-gray-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-600"
                            >
                                {mode === "add" ? "Save" : "Update"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
