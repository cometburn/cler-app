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

import { Product, productSchema } from "../types/product.types";
import { ApiError } from "@/shared/types/apiError.types";
import { PRODUCT_CATEGORY, PRODUCT_UNIT } from "@/constants/system";
import { Switch } from "@/components/ui/switch";
import { removeUnderscore } from "@/helpers/string.helper";
import { cn } from "@/lib/utils";
import { formatDate } from "@/helpers/date.helper";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<Product> | null;
    onSubmit: (data: Product) => void | Promise<void>;
}

export const ProductDialog = ({
    mode = "add",
    trigger,
    initialData,
    onSubmit,
}: ProductDialogProps) => {
    const [open, setOpen] = useState(false);

    const defaultValues = useMemo<Product>(
        () => ({
            name: "",
            sku: "",
            price: 0,
            category: "",
            unit: "",
            track_stock: false,
            is_active: true,
        }),
        []
    );

    const form = useForm<Product>({
        resolver: zodResolver(productSchema),
        defaultValues,
    });

    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });
    }, [open, initialData, form, defaultValues]);

    const handleSubmit = async (values: Product) => {
        try {
            await onSubmit(values);
            setOpen(false);
            form.reset(defaultValues);
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof Product;

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

            <DialogContent className={cn("bg-white overflow-y-auto max-h-[90%] min-h-[90%] md:min-h-auto", mode === "edit" && initialData?.product_history && initialData.product_history.length > 0 ? "sm:max-w-5xl" : "sm:max-w-md")}>
                <div className={cn("grid gap-4 grid-cols-1", mode === "edit" && initialData?.product_history && initialData.product_history.length > 0 ? "md:grid-cols-2" : "")}>
                    <div>
                        <DialogHeader className="mb-4">
                            <DialogTitle>
                                {mode === "add" ? "Add Product" : "Edit Product"}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {mode === "add"
                                    ? "Fill out the form to create a new product."
                                    : "Update the product details below."}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="space-y-4"
                            >
                                {/* Category */}
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Type</FormLabel>
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
                                                    {PRODUCT_CATEGORY.map((type: string) => (
                                                        <SelectItem key={type} value={String(type)}>
                                                            {type.charAt(0).toUpperCase() + removeUnderscore(type).slice(1)}
                                                        </SelectItem>
                                                    ))}
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

                                {/* Sku */}
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter SKU"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                                    {/* Price */}
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
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

                                    {/* Unit */}
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit</FormLabel>
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
                                                        {PRODUCT_UNIT.map((type: string) => (
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



                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {/* Track Stock */}
                                    {form.watch("category") === "product" && <FormField
                                        control={form.control}
                                        name="track_stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Track Stock</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-green-500 cursor-pointer"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    }

                                    {/* is Active */}
                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Active</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-green-500 cursor-pointer"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>


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
                    </div>
                    {initialData && initialData.product_history && initialData.product_history.length > 0 && <div>
                        <h4 className="text-sm font-semibold mb-2">History</h4>
                        <ScrollArea className="h-[405px] overflow-x-hidden">
                            <div className="flex flex-col gap-1">

                                {initialData.product_history?.map((history) => (
                                    <p className="text-xs">Changed <span className="font-semibold text-blue-500">{removeUnderscore(history.field)}</span> {history.old_value ? <span className="font-semibold">{history.old_value}</span> : ""} <span>to</span> <span className="font-semibold">{history.new_value}</span> on {formatDate(history.created_at, "MM/DD/YYYY hh:mm A")} by <span className="font-semibold capitalize text-blue-500">{`${history.user.first_name} ${history.user.last_name}`}</span></p>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    }
                </div>
            </DialogContent>
        </Dialog >
    );
};
