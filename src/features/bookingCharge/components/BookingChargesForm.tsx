import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingCharge, bookingChargeSchema } from "../types/bookingCharge.types";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";

import { DashboardContext } from "@/features/dashboard/context/dashboard.context";

interface BookingChargesFormProps {
    bookingCharges: BookingCharge[];
    setBookingCharges: (bookingCharges: BookingCharge[]) => void;
    transferRoomId?: number;
}

export const BookingChargesForm = ({ bookingCharges, setBookingCharges, transferRoomId }: BookingChargesFormProps) => {
    const dashboardContext = useContext(DashboardContext);
    const form = useForm<BookingCharge>({
        resolver: zodResolver(bookingChargeSchema),
        defaultValues: {
            name: "",
            price: 0,
        },
        mode: "onSubmit",
        shouldUnregister: false,
    });

    const handleRemoveCharge = (id: number) => {
        const updatedCharges = bookingCharges.filter(a => a.id !== id);
        setBookingCharges(updatedCharges);
    }

    const handleSubmit = async (values: BookingCharge) => {
        const payload: BookingCharge = {
            room_id: dashboardContext?.roomData?.id,
            ...values
        };

        setBookingCharges([...bookingCharges, payload]);

        form.reset();
    }

    return (
        <div className="flex flex-col gap-4 my-4">
            <Form {...form}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_30%] gap-2 items-start">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="bg-white"
                                            value={field.value ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-start gap-2 w-full">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="no-arrows bg-white"
                                                value={field.value ? String(field.value) : ""}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                </div>
            </Form>

            {bookingCharges && bookingCharges?.length > 0 ? (
                <div className="w-full overflow-hidden">
                    <Table className="bg-transparent w-full table-fixed">
                        <TableHeader>
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="text-xs py-0 h-6 text-gray-400 w-full">Name</TableHead>
                                <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Price</TableHead>
                                <TableHead className="text-xs py-0 h-6 text-gray-400 w-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookingCharges?.map((charge, index) => (
                                <TableRow key={charge.id || index}>
                                    <TableCell className="text-xs py-1 h-6 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{charge.name || ""}</TableCell>
                                    <TableCell className="text-right text-xs py-1 h-6 w-20">{Number(charge.price).toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-xs p-0 h-6 w-6">
                                        {!charge.id && <ConfirmDeleteDialog
                                            entityName={`Charge - ${charge.name}`}
                                            onConfirm={() => handleRemoveCharge(charge.id ?? index)}
                                        />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center text-xs py-7 h-6 text-gray-400">No charges available</div>
            )}
        </div>
    )
}