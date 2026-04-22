"use client";

import { useState, useEffect, useMemo } from "react";
import { LoaderCircle, Plus } from "lucide-react";
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

import { ApiError } from "@/shared/types/apiError.types";
import { ProductMovement, productMovementSchema } from "@/features/productMovement/types/productMovement.types";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Product } from "@/features/product/types/product.types";
import { useDebouncedValue } from "@/helpers/debounce.helper";
import { fetchProducts } from "@/features/product/api/product.api";
import { Textarea } from "@/components/ui/textarea";
import { Inventory } from "@/features/inventory/types/inventory.types";

interface ProductMovementDialogProps {
    mode?: "in" | "adjustment";
    trigger?: React.ReactNode;
    initialData?: Partial<Inventory> | null;
    onSubmit: (data: ProductMovement) => void | Promise<void>;
}

export const ProductMovementDialog = ({
    mode = "in",
    trigger,
    initialData,
    onSubmit,
}: ProductMovementDialogProps) => {
    const [open, setOpen] = useState(false);
    const [page, _setPage] = useState(1);
    const [limit, _setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderItems, setOrderItems] = useState<Product[]>([]);
    const [orderItemLoading, setOrderItemLoading] = useState(false);
    const [selectedOrderItemName, setSelectedOrderItemName] = useState<string>("");
    const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const defaultValues = useMemo<ProductMovement>(
        () => ({
            product_id: 0,
            type: mode,
            quantity: 0,
            unit_cost: 0,
            note: "",
        }),
        [mode]
    );

    const form = useForm<ProductMovement>({
        resolver: zodResolver(productMovementSchema),
        defaultValues,
    });

    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
        form.reset({ ...defaultValues, ...initialData });

        // Pre-populate product name and items if initialData has a product
        if (initialData?.product) {
            setSelectedOrderItemName(initialData.product.name);
            setSearchQuery(initialData.product.name);
            setOrderItems([initialData.product as Product]);
        } else {
            setSelectedOrderItemName("");
            setSearchQuery("");
            setOrderItems([]);
        }
    }, [open, initialData, form, defaultValues]);

    // Fetch products based on debounced search
    useEffect(() => {
        if (!debouncedSearch) {
            setOrderItems([]);
            return;
        }

        let isCancelled = false;

        const loadProducts = async () => {
            setOrderItemLoading(true);
            try {
                const data = await fetchProducts(page, limit, debouncedSearch, "product");
                if (!isCancelled) {
                    setOrderItems(data.data);
                }
            } catch (error) {
                if (!isCancelled) {
                    setOrderItems([]);
                }
            } finally {
                if (!isCancelled) {
                    setOrderItemLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isCancelled = true;
        };
    }, [debouncedSearch, page, limit]);

    const handleSubmit = async (values: ProductMovement) => {
        try {
            await onSubmit(values);
            setOpen(false);
            form.reset(defaultValues);
        } catch (error: unknown) {
            const errors = (error as ApiError).response?.data?.errors;

            if (errors && Array.isArray(errors)) {
                errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldPath = err.path[0] as keyof ProductMovement;

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
                    <div>
                        <DialogHeader className="mb-4">
                            <DialogTitle>
                                {mode === "in" ? "Add Product Movement" : "Edit Product Movement"}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {mode === "in"
                                    ? "Fill out the form to add Product Movement."
                                    : "Update the Product Movement details below."}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="space-y-4"
                            >
                                {/* Product */}
                                <FormField
                                    control={form.control}
                                    name="product_id"
                                    render={({ field, fieldState }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-xs">Product</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        items={orderItems}
                                                        value={selectedOrderItemName}
                                                        onValueChange={(name) => {
                                                            const product = orderItems.find(p => p.name === name);
                                                            if (product && name) {
                                                                field.onChange(product.id);
                                                                setSelectedOrderItemName(name);
                                                                setSearchQuery(name);
                                                            }
                                                        }}
                                                    >
                                                        <ComboboxInput
                                                            placeholder="Type to search products..."
                                                            value={selectedOrderItemName || searchQuery}
                                                            onInput={(e) => {
                                                                const target = e.target as HTMLInputElement;
                                                                setSearchQuery(target.value);
                                                                if (target.value !== selectedOrderItemName) {
                                                                    setSelectedOrderItemName("");
                                                                }
                                                            }}
                                                            className={`bg-white ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                        />
                                                        <ComboboxContent>
                                                            {orderItemLoading ? (
                                                                <div className="flex items-center justify-center p-4">
                                                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                                                </div>
                                                            ) : !searchQuery ? (
                                                                <ComboboxEmpty>Start typing to search...</ComboboxEmpty>
                                                            ) : (
                                                                <>
                                                                    <ComboboxEmpty>No product found.</ComboboxEmpty>
                                                                    <ComboboxList>
                                                                        {(item: Product) => (
                                                                            <ComboboxItem
                                                                                key={item.id}
                                                                                value={item.name}
                                                                                style={{ pointerEvents: 'auto' }}
                                                                            >
                                                                                <div className="flex justify-between w-full">
                                                                                    <span>{item.name}</span>
                                                                                </div>
                                                                            </ComboboxItem>
                                                                        )}
                                                                    </ComboboxList>
                                                                </>
                                                            )}
                                                        </ComboboxContent>
                                                    </Combobox>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {/* Qty */}
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                                                            field.onChange(Number(value) || 0)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Qty */}
                                    <FormField
                                        control={form.control}
                                        name="unit_cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit Cost</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                                                            field.onChange(Number(value) || 0)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                                    className="h-30"
                                                />
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
                                        {mode === "in" ? "Save" : "Update"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};
