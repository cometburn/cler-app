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
import { BookingAddon, bookingAddonSchema } from "@/features/bookingAddon/types/bookingAddon.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Booking } from "@/features/booking/types/booking.types";
import { useCreateBookingAddon, useDeleteBookingAddon } from "../hooks/useBookingAddons";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { toast } from "sonner";

interface AddonsFormProps {
    bookingData?: Partial<Booking> | null;
}

export const BookingAddonsForm = ({ bookingData }: AddonsFormProps) => {
    const [page, _setPage] = useState(1);
    const [limit, _setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [addOns, setAddOns] = useState<Product[]>([]);
    const [addOnLoading, setAddOnLoading] = useState(false);
    const [selectedAddonName, setSelectedAddonName] = useState<string>("");

    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const createMutation = useCreateBookingAddon();
    const deleteMutation = useDeleteBookingAddon();

    const parentForm = useFormContext<Booking>();

    // Use useWatch instead of watch - only re-renders when booking_addons actually changes
    const bookingAddons = useWatch({
        control: parentForm.control,
        name: "booking_addons",
        defaultValue: [],
    }) || [];

    const defaultValues = useMemo<Partial<BookingAddon>>(
        () => ({
            booking_id: bookingData?.id,
            room_id: bookingData?.room_id,
            product_id: undefined,
            quantity: 1,
            price: 0,
            total_price: 0,
            product: undefined,
        }),
        [bookingData]
    );

    const form = useForm<BookingAddon>({
        resolver: zodResolver(bookingAddonSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    // Watch for changes in product_id and quantity to auto-calculate prices
    const selectedProductId = form.watch("product_id");
    const quantity = form.watch("quantity");

    useEffect(() => {
        if (selectedProductId && quantity) {
            const selectedProduct = addOns.find(p => p.id === selectedProductId);
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
    }, [selectedProductId, quantity, addOns, form]);

    // Fetch products based on debounced search
    useEffect(() => {
        if (!debouncedSearch) {
            setAddOns([]);
            return;
        }

        let isCancelled = false;

        const loadAddOns = async () => {
            setAddOnLoading(true);
            try {
                const data = await fetchProducts(page, limit, debouncedSearch, "room_addon");
                if (!isCancelled) {
                    setAddOns(data.data);
                }
            } catch (error) {
                console.error("Error fetching addons:", error);
                if (!isCancelled) {
                    setAddOns([]);
                }
            } finally {
                if (!isCancelled) {
                    setAddOnLoading(false);
                }
            }
        };

        loadAddOns();

        return () => {
            isCancelled = true;
        };
    }, [debouncedSearch, page, limit]);

    const handleQuantityChange = (value: number) => value;

    /**
     * Handle addon submission - POST to /addons API
     */
    const handleSubmit = async (values: BookingAddon) => {
        // Find the selected product to ensure we have the latest price
        const selectedProduct = addOns.find(p => p.id === values.product_id);

        if (!selectedProduct) {
            return;
        }

        // Calculate final prices
        const finalPrice = Number(selectedProduct.price) || 0;
        const finalTotalPrice = finalPrice * (values.quantity || 1);

        const payload: BookingAddon = {
            ...values,
            price: finalPrice,
            total_price: finalTotalPrice,
        };

        try {
            const result = await createMutation.mutateAsync(bookingAddonSchema.parse(payload));
            const currentAddons = parentForm.getValues("booking_addons") || [];
            const updatedAddons = [...currentAddons, result];

            // Update parent form
            parentForm.setValue("booking_addons", updatedAddons, {
                shouldValidate: true,
                shouldDirty: true
            });

            // Reset the addon form
            form.reset(defaultValues);
            setSelectedAddonName("");
            setSearchQuery("");

        } catch (error) {
            console.error('Error creating addon:', error);
            toast.error('Failed to add addon');
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
                                        <FormLabel className="text-xs">Addon</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                items={addOns}  // <-- Pass the full product objects
                                                value={selectedAddonName}
                                                onValueChange={(name) => {
                                                    const product = addOns.find(p => p.name === name);
                                                    if (product && name) {
                                                        field.onChange(product.id);
                                                        setSelectedAddonName(name);
                                                        setSearchQuery(name);
                                                    }
                                                }}

                                            >
                                                <ComboboxInput
                                                    placeholder="Type to search addons..."
                                                    value={selectedAddonName || searchQuery}
                                                    onInput={(e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        setSearchQuery(target.value);
                                                        if (target.value !== selectedAddonName) {
                                                            setSelectedAddonName("");
                                                        }
                                                    }}
                                                    className={`bg-white ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                />
                                                <ComboboxContent>
                                                    {addOnLoading ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <LoaderCircle className="w-4 h-4 animate-spin" />
                                                        </div>
                                                    ) : !searchQuery ? (
                                                        <ComboboxEmpty>Start typing to search...</ComboboxEmpty>
                                                    ) : (
                                                        <>
                                                            <ComboboxEmpty>No addons found.</ComboboxEmpty>
                                                            <ComboboxList>
                                                                {(item: Product) => (  // <-- Now 'item' is a Product object
                                                                    <ComboboxItem
                                                                        key={item.id}  // <-- Use id as key
                                                                        value={item.name}  // <-- Display value is the name
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
                                    <FormItem className="w-10">
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
                                    title="Add Addon"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Item</span>
                                </Button>

                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(handleSubmit)}
                                    size="icon"
                                    className="hidden md:block h-[34px] w-[34px] bg-green-600 hover:bg-green-700 text-white rounded-full float-right"
                                    title="Add Addon"
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

            {bookingAddons.length > 0 && (
                <Table className="bg-transparent">
                    <TableHeader>
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="text-xs py-0 h-6 text-gray-400">Addon</TableHead>
                            <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Quantity</TableHead>
                            <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Price</TableHead>
                            <TableHead className="text-xs py-0 h-6 text-gray-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Map from parent form, not bookingData prop */}
                        {bookingAddons.map((addon, index) => (
                            <TableRow key={addon.id || index}>
                                <TableCell className="text-xs py-1 h-6">{addon.product?.name || ""}</TableCell>
                                <TableCell className="text-right text-xs py-1 h-6 w-5">{addon.quantity}</TableCell>
                                <TableCell className="text-right text-xs py-1 h-6 w-14">{Number(addon.total_price).toFixed(2)}</TableCell>
                                <TableCell className="text-right text-xs p-0 h-6 w-5">
                                    <ConfirmDeleteDialog
                                        entityName={`Addon - ${addon.product?.name}`}
                                        loading={deleteMutation.isPending}
                                        onConfirm={async () => {
                                            await deleteMutation.mutateAsync(addon.id!);

                                            // Also update parent form after delete
                                            const currentAddons = parentForm.getValues("booking_addons") || [];
                                            const updatedAddons = currentAddons.filter(a => a.id !== addon.id);
                                            parentForm.setValue("booking_addons", updatedAddons, {
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