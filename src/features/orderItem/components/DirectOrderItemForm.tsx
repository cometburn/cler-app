import { useState, useEffect, useMemo } from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { LoaderCircle, MinusIcon, Plus, PlusIcon } from "lucide-react";

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

import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";

import { fetchProducts } from "@/features/product/api/product.api";

import { DirectOrderItem, OrderItem, directOrderItemSchema } from "../types/orderItem.types";
import { Product } from "../../product/types/product.types";
import { DirectOrder } from "@/features/order/types/order.types";
import { formatCurrency } from "@/helpers/string.helper";
import { useDebouncedValue } from "@/helpers/debounce.helper";

interface DirectOrderItemFormProps {
    orderData?: Partial<DirectOrder> | null;
}

export const DirectOrderItemForm = ({ orderData }: DirectOrderItemFormProps) => {
    const [page, _setPage] = useState(1);
    const [limit, _setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderItems, setOrderItems] = useState<Product[]>([]);
    const [orderItemLoading, setOrderItemLoading] = useState(false);
    const [selectedOrderItemName, setSelectedOrderItemName] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [grandTotal, setGrandTotal] = useState<number>(0);
    const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const parentForm = useFormContext<DirectOrder>();

    const orderItemsList = useWatch({
        control: parentForm.control,
        name: "order_items",
        defaultValue: [],
    }) || [];

    const defaultValues = useMemo<Partial<OrderItem>>(
        () => ({
            order_id: orderData?.id,
            product_id: undefined,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            product: undefined,
        }),
        [orderData]
    );

    const form = useForm<DirectOrderItem>({
        resolver: zodResolver(directOrderItemSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    // Watch for changes in product_id and quantity to auto-calculate prices
    const selectedProductId = form.watch("product_id");
    const quantity = form.watch("quantity");

    useEffect(() => {
        if (selectedProductId && quantity) {
            const filteredProduct = orderItems.find(p => p.id === selectedProductId);
            if (filteredProduct?.price) {
                const price = Number(filteredProduct.price);
                const totalPrice = price * quantity;

                setSelectedProduct(filteredProduct)

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

    useEffect(() => {
        const total = orderItemsList.reduce((acc, item) => acc + item.total_price, 0);
        setGrandTotal(total);
        parentForm.setValue("total_price", total, { shouldValidate: true, shouldDirty: true });
    }, [orderItemsList])

    const handleQuantityChange = (value: number) => {
        if (!selectedProduct) return 1;

        if (!value) return 1

        if (selectedProduct?.inventory?.quantity && value > (selectedProduct.inventory.quantity - selectedProduct.inventory.reserved_qty)) {
            return selectedProduct.inventory.quantity - selectedProduct.inventory.reserved_qty
        } else {
            return value
        }
    };

    const handleOrderItemQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const currentItems = parentForm.getValues("order_items") || [];
        const item = currentItems[index];

        console.log('item.product?', item.product)
        // Guard against exceeding stock
        const maxQty = item.product?.inventory
            ? item.product.inventory.quantity - item.product.inventory.reserved_qty
            : Infinity;

        const clampedQty = Math.min(newQuantity, maxQty);

        const updatedItems = currentItems.map((i, idx) =>
            idx === index
                ? {
                    ...i,
                    quantity: clampedQty,
                    total_price: Number(i.price) * clampedQty,
                }
                : i
        );

        parentForm.setValue("order_items", updatedItems, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleAddOrderItem = async (values: DirectOrderItem) => {
        if (!selectedProduct) {
            toast.error('Please select a valid product');
            return;
        }

        const newItem: DirectOrderItem = {
            ...values,
            product: selectedProduct,
        };

        // Get current order_items from parent form and append
        const currentItems = parentForm.getValues("order_items") || [];

        // Check if item exists
        const existingItemIndex = currentItems.findIndex(item => item.product_id === newItem.product_id);
        if (existingItemIndex !== -1) {
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            updatedItems[existingItemIndex].total_price += newItem.total_price;

            parentForm.setValue("order_items", updatedItems, {
                shouldValidate: true,
                shouldDirty: true,
            });
        } else {
            parentForm.setValue("order_items", [...currentItems, newItem], {
                shouldValidate: true,
                shouldDirty: true,
            });
        }

        // Reset local form
        form.reset(defaultValues);
        setSelectedOrderItemName("");
        setSearchQuery("");
        setSelectedProduct(null);
    };

    const handleDeleteOrderItem = async (productId: number) => {
        const currentOrderItems = parentForm.getValues("order_items") || [];
        const updatedOrderItems = currentOrderItems.filter(oi => oi.product_id !== productId);

        parentForm.setValue("order_items", updatedOrderItems, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    return (
        <div className="flex flex-col">
            <Form {...form}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_90px] gap-2 items-start">
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
                                                                        disabled={item.track_stock && (!item.inventory || item.inventory.quantity === 0)}
                                                                    >
                                                                        <div className="flex justify-between w-full">
                                                                            <span>{item.name}</span>
                                                                            {item.track_stock && (
                                                                                item.inventory && item.inventory.quantity > 0 ? (
                                                                                    <span className="text-gray-500">
                                                                                        {Number(item.price).toFixed(2)}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-red-500">Out of Stock</span>
                                                                                )
                                                                            )}
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
                                    onClick={form.handleSubmit(handleAddOrderItem)}
                                    className="md:hidden h-[34px] w-full bg-green-600 hover:bg-green-700 text-white"
                                    title="Add Item"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Item</span>
                                </Button>

                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(handleAddOrderItem, (errors) => console.log(errors))}
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
                <div className="border border-gray-200 rounded-md bg-gray-100 mt-4">
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
                                    <TableCell className="text-xs py-1 ">{item.product?.name || ""}</TableCell>
                                    <TableCell className="text-right text-xs py-1  w-5">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                onClick={() => handleOrderItemQuantityChange(index, item.quantity - 1)}
                                                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-xs text-black"
                                            >
                                                <MinusIcon className="w-4 h-10" />
                                            </Button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <Button
                                                type="button"
                                                onClick={() => handleOrderItemQuantityChange(index, item.quantity + 1)}
                                                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-xs text-black"
                                            >
                                                <PlusIcon className="w-4 h-10" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-xs py-1  w-14">{Number(item.total_price).toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-xs p-0  w-5">
                                        <ConfirmDeleteDialog
                                            entityName={`Order Item - ${item.product?.name}`}
                                            onConfirm={() => handleDeleteOrderItem(item.product_id!)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </div>
            )}
            {orderItemsList?.length > 0 && (<div className="flex flex-row items-center mt-4">
                <p className="flex-1 font-bold text-lg text-gray-400">Total Amount:</p>
                <p className="flex-1 text-right text-4xl">{formatCurrency(grandTotal)}</p>
            </div>
            )}
        </div>
    );
};