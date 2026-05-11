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
} from "@/components/ui/form";

import { useCreateOrder, useUpdateOrder } from "../hooks/useOrder";

import { ApiError } from "@/shared/types/apiError.types";
import { DirectOrder, directOrderSchema, OrderResponse } from "@/features/order/types/order.types";
import { QueryObserverResult } from "@tanstack/react-query";
import { DirectOrderItemForm } from "@/features/orderItem/components/DirectOrderItemForm";

interface OrderDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<DirectOrder> | null;
    refreshData?: () => void | Promise<QueryObserverResult<OrderResponse, Error>>;
}

export const OrderDialog = ({
    mode = "add",
    trigger,
    initialData,
}: OrderDialogProps) => {
    const [open, setOpen] = useState(false);
    const createMutation = useCreateOrder();
    const updateMutation = useUpdateOrder();

    const defaultValues = useMemo<DirectOrder>(
        () => ({
            booking_id: initialData?.booking_id,
            total_price: 0,
            status: "completed",
            order_items: initialData?.order_items ?? [],
        }),
        [mode, initialData]
    );

    const form = useForm<DirectOrder>({
        resolver: zodResolver(directOrderSchema),
        defaultValues,
    });


    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });

        console.log('initialData', initialData)
        console.log('form.getValues()', form.getValues())

    }, [open, initialData, form, defaultValues]);


    const handleSubmit = async (values: DirectOrder) => {
        try {
            if (mode === 'add') {
                await createMutation.mutateAsync(directOrderSchema.parse(values));
            } else {
                const { booking_id, ...payload } = values;

                const data = booking_id ? values : payload;

                await updateMutation.mutateAsync(directOrderSchema.parse(data));
            }

            // if (refreshData) {
            //     await refreshData();
            // }

            setOpen(false);
            form.reset(defaultValues);
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof DirectOrder;

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

            <DialogContent className="bg-white overflow-y-auto max-h-[90%] min-h-[90%] md:min-h-auto">
                <div className="grid gap-4 grid-cols-1">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "add" ? "Add Order" : "Edit Order"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {mode === "add"
                                ? "Fill out the form to add Order."
                                : "Update the Order details below."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                                console.log(form.getValues())
                                console.log(errors)
                            })}
                            className="space-y-4"
                        >
                            {form.formState.errors.total_price && form.formState.isSubmitted && (
                                <p className="p-2 bg-red-100 text-red-500 text-xs mb-1 rounded">
                                    Add at least one item.
                                </p>
                            )}


                            <DirectOrderItemForm
                                orderData={{ ...initialData }}
                            />

                            {/* Buttons */}
                            <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                    variant="outline"
                                    type="submit"
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
                </div>
            </DialogContent>
        </Dialog >
    );
};
