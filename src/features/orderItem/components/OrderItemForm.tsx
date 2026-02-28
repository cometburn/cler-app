import { useState, useEffect, useMemo } from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { Product } from "../../product/types/product.types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LoaderCircle, Plus } from "lucide-react";
import { useDebouncedValue } from "@/helpers/debounce.helper";
import { fetchProducts } from "@/features/product/api/product.api";
import { OrderItem, orderItemSchema } from "../types/orderItem.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Booking } from "@/features/booking/types/booking.types";
import { useCreateOrderItem, useDeleteOrderItem } from "../hooks/useOrderItems";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { toast } from "sonner";

interface OrderItemFormProps {
    bookingData?: Partial<Booking> | null;
}

export const OrderItemForm = ({ bookingData }: OrderItemFormProps) => {
    const [page, _setPage] = useState(1);
    const [limit, _setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderItems, setOrderItems] = useState<Product[]>([]);
    const [orderItemLoading, setOrderItemLoading] = useState(false);
    const [selectedOrderItemName, setSelectedOrderItemName] = useState<string>("");

    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const createMutation = useCreateOrderItem();
    const deleteMutation = useDeleteOrderItem();

    const parentForm = useFormContext<Booking>();

    // Watch the nested order_items path
    const orderItemsList = useWatch({
        control: parentForm.control,
        name: "orders.order_items",
        defaultValue: [],
    }) || [];

    const defaultValues = useMemo<Partial<OrderItem>>(
        () => ({
            order_id: bookingData?.orders?.id,
            product_id: undefined,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            product: undefined,
        }),
        [bookingData]
    );

    const form = useForm<OrderItem>({
        resolver: zodResolver(orderItemSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    // Watch for changes in product_id and quantity to auto-calculate prices
    const selectedProductId = form.watch("product_id");
    const quantity = form.watch("quantity");

    useEffect(() => {
        if (selectedProductId && quantity) {
            const selectedProduct = orderItems.find(p => p.id === selectedProductId);
            if (selectedProduct?.price) {
                const price = Number(selectedProduct.price);
                const totalPrice = price * quantity;

                console.log('selectedProduct', selectedProduct);
                console.log('price', price);
                console.log('totalPrice', totalPrice);

                form.setValue("price", price, { shouldValidate: false });
                form.setValue("total_price", totalPrice, { shouldValidate: false });
            }
        }
    }, [selectedProductId, quantity, orderItems, form]);

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
                console.error("Error fetching products:", error);
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

    const handleQuantityChange = (value: number) => value;

    /**
     * Handle order item submission - POST to order items API
     */
    const handleSubmit = async (values: OrderItem) => {
        // Find the selected product to ensure we have the latest price
        const selectedProduct = orderItems.find(p => p.id === values.product_id);

        if (!selectedProduct) {
            toast.error('Please select a valid product');
            return;
        }

        // Calculate final prices
        const finalPrice = Number(selectedProduct.price) || 0;
        const finalTotalPrice = finalPrice * (values.quantity || 1);

        if (!bookingData?.orders?.id) {
            throw new Error("Order not found");
        }


        const payload: OrderItem = {
            ...values,
            order_id: bookingData?.orders?.id,
            price: finalPrice,
            total_price: finalTotalPrice,
        };

        try {
            const result = await createMutation.mutateAsync(orderItemSchema.parse(payload));

            // Get current order_items from parent form
            const currentOrderItems = parentForm.getValues("orders.order_items") || [];

            console.log("result", result);

            // Add the new order item with the result data (includes id from backend)
            const updatedOrderItems = [...currentOrderItems, result];

            // Update parent form
            parentForm.setValue("orders.order_items", updatedOrderItems, {
                shouldValidate: true,
                shouldDirty: true
            });

            // Reset the form
            form.reset(defaultValues);
            setSelectedOrderItemName("");
            setSearchQuery("");

        } catch (error) {
            console.error('Error creating order item:', error);
            toast.error('Failed to add order item');
        }
    };

    return (
        <div className="flex flex-col gap-4 my-4">
            <Form {...form}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_80px] gap-2 items-start">
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
                                                                            <span className="text-gray-500">
                                                                                {Number(item.price).toFixed(2)}
                                                                            </span>
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

                        <div className="flex items-start gap-2 w-full">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="w-20">
                                        <FormLabel className="text-xs">Qty</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="no-arrows bg-white"
                                                value={field.value ? String(field.value) : ""}
                                                onChange={(e) => field.onChange(handleQuantityChange(Number(e.target.value)))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-1 items-center mt-5">
                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(handleSubmit)}
                                    className="md:hidden h-[34px] w-full bg-green-600 hover:bg-green-700 text-white"
                                    title="Add Item"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Item</span>
                                </Button>

                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(handleSubmit)}
                                    size="icon"
                                    className="hidden md:block h-[34px] w-[34px] bg-green-600 hover:bg-green-700 text-white rounded-full float-right"
                                    title="Add Item"
                                >
                                    <Plus className="w-4 h-4 mx-auto" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Show calculated total (optional) */}
                    {form.watch("total_price") > 0 && form.watch("quantity") > 0 && (
                        <div className="flex justify-end text-sm text-gray-600 gap-2">
                            <span>Total:</span>
                            <span>{form.watch("total_price").toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </Form>

            {orderItemsList?.length > 0 && (
                <Table className="bg-transparent">
                    <TableHeader>
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="text-xs py-0 h-6 text-gray-400">Product</TableHead>
                            <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Quantity</TableHead>
                            <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Price</TableHead>
                            <TableHead className="text-xs py-0 h-6 text-gray-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orderItemsList.map((item, index) => (
                            <TableRow key={item.product?.id || index}>
                                <TableCell className="text-xs py-1 h-6">{item.product?.name || ""}</TableCell>
                                <TableCell className="text-right text-xs py-1 h-6 w-5">{item.quantity}</TableCell>
                                <TableCell className="text-right text-xs py-1 h-6 w-14">{Number(item.total_price).toFixed(2)}</TableCell>
                                <TableCell className="text-right text-xs p-0 h-6 w-5">
                                    <ConfirmDeleteDialog
                                        entityName={`Order Item - ${item.product?.name}`}
                                        loading={deleteMutation.isPending}
                                        onConfirm={async () => {
                                            await deleteMutation.mutateAsync(item.id!);

                                            // Update parent form after delete
                                            const currentOrderItems = parentForm.getValues("orders.order_items") || [];
                                            const updatedOrderItems = currentOrderItems.filter(oi => oi.id !== item.id);
                                            parentForm.setValue("orders.order_items", updatedOrderItems, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            });
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};