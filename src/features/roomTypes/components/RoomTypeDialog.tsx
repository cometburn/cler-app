"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";

import { RoomType, roomTypeSchema } from "../types/roomType.types";

interface RoomTypeDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<RoomType> | null;
    onSubmit: (data: RoomType) => void | Promise<void>;
}

export const RoomTypeDialog = ({
    mode = "add",
    trigger,
    initialData,
    onSubmit,
}: RoomTypeDialogProps) => {
    const [open, setOpen] = useState(false);

    // Default form values
    const defaultValues = useMemo<RoomType>(
        () => ({
            name: "",
            description: "",
        }),
        []
    );

    const form = useForm<RoomType>({
        resolver: zodResolver(roomTypeSchema),
        defaultValues,
    });

    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });
    }, [open, initialData, form, defaultValues]);

    const handleSubmit = async (values: RoomType) => {
        await onSubmit(values);
        setOpen(false);
        form.reset(defaultValues);
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

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter description" {...field} />
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
