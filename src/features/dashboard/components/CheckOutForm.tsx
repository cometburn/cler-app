import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateTimePickerField } from "@/components/fields/datePicker/DatePickerField";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { BookingBreakdown } from "./BookingBreakdown";
import { BookingAddonsForm } from "../../bookingAddon/components/BookingAddonsForm";
import { useCheckOutForm } from "../hooks/useCheckoutForm";
import { PAYMENT_STATUS, PAYMENT_TYPE } from "@/constants/system";
import { removeUnderscore } from "@/helpers/string.helper";
import { Booking } from "../../booking/types/booking.types";
import { Room } from "@/features/room/types/room.types";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { Loader } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { OrderItemForm } from "@/features/orderItem/components/OrderItemForm";
import { cn } from "@/lib/utils";
import { TransferBookingDialog } from "./TransferBookingDialog";

interface CheckOutFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialData?: Partial<Booking> | null;
    roomData?: Partial<Room> | null;
}

export const CheckOutForm = ({ open, setOpen, initialData, roomData }: CheckOutFormProps) => {
    const {
        form,
        roomRates,
        roomRate,
        isLoadingRates,
        isWithinGracePeriod,
        overstayMinutes,
        billedHours,
        overstayCharge,
        extraPerson,
        total,
        updateMutation,
        addonsTotal,
        ordersTotal,
        bookingChargesTotal,
        hasBookingCharges,
        handleRoomRateChange,
        handleExtraPersonChange,
        handleCancelBooking,
        handleSubmit,
    } = useCheckOutForm({ open, setOpen, initialData, roomData });

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className={cn(
                    "grid gap-4",
                    isLoadingRates && "grid-cols-1",
                    !isLoadingRates && "grid-cols-1 md:grid-cols-2"
                )}
            >
                {isLoadingRates ? (
                    <div className="flex items-center justify-center min-h-[300px] w-full">
                        <Loader className="animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {/* Room Rate */}
                            <FormField
                                control={form.control}
                                name="room_rate_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Rate</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ""}
                                            onValueChange={handleRoomRateChange}
                                            disabled={isLoadingRates}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={isLoadingRates ? "Loading rates..." : "Select rate"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingRates ? (
                                                    <SelectItem disabled value="loading">Loading...</SelectItem>
                                                ) : roomRates?.length ? (
                                                    roomRates.map((rate: RoomRate) => (
                                                        <SelectItem key={rate.id} value={String(rate.id)}>{rate.name}</SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem disabled value="no-rates">No rates available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DateTimePickerField control={form.control} name="start_datetime" label="Start Date & Time" wrapperClassName="flex-1" />
                                <DateTimePickerField control={form.control} name="end_datetime" label="End Date & Time" wrapperClassName="flex-1" />
                            </div>

                            {/* Extra Person */}
                            <FormField
                                control={form.control}
                                name="extra_person"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Extra Person</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                value={field.value ? String(field.value) : ""}
                                                onChange={(e) => field.onChange(handleExtraPersonChange(Number(e.target.value)))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tabs */}
                            <Tabs defaultValue={hasBookingCharges ? "charges" : "addons"} className="gap-0 py-4 px-4 rounded-md border border-gray-200 bg-gray-100 mt-5">
                                <TabsList
                                    variant="line"
                                    className={cn("px-0 grid grid-cols-1 md:grid-cols-3 w-full h-auto [&]:h-auto", !hasBookingCharges && "md:grid-cols-2")}
                                >
                                    {hasBookingCharges &&
                                        <TabsTrigger value="charges" className="cursor-pointer">Transfer Charges</TabsTrigger>
                                    }
                                    <TabsTrigger value="addons" className="cursor-pointer">Room Add-ons</TabsTrigger>
                                    <TabsTrigger value="order" className="cursor-pointer">Orders</TabsTrigger>
                                </TabsList>

                                {hasBookingCharges &&
                                    <TabsContent value="charges" className="py-2 mt-18 md:mt-0">
                                        <div className="w-full overflow-hidden">
                                            <Table className="bg-transparent w-full table-fixed">
                                                <TableHeader>
                                                    <TableRow className="border-b border-gray-200">
                                                        <TableHead className="text-xs py-0 h-6 text-gray-400 w-10">From</TableHead>
                                                        <TableHead className="text-xs py-0 h-6 text-gray-400 w-full">Name</TableHead>
                                                        <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Price</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {initialData?.booking_charges?.map((charge) => (
                                                        <TableRow key={charge.id}>
                                                            <TableCell className="text-left text-xs py-1 h-6">{charge.room?.name}</TableCell>
                                                            <TableCell className="text-xs py-1 h-6 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{charge.name || ""}</TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{Number(charge.price).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                }
                                <TabsContent value="addons" className="py-2 mt-18 md:mt-0">
                                    <BookingAddonsForm bookingData={initialData} />
                                </TabsContent>
                                <TabsContent value="order" className="py-2 mt-18 md:mt-0">
                                    <OrderItemForm bookingData={initialData} />
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                {/* Breakdown */}
                                <BookingBreakdown
                                    roomCharge={roomRate?.base_price ?? 0}
                                    extraPerson={extraPerson}
                                    extraPersonRate={roomRate?.extra_person_rate ?? 0}
                                    overstayMinutes={overstayMinutes}
                                    billedHours={billedHours}
                                    overstayRate={roomRate?.overstay_rate ?? 0}
                                    overstayCharge={overstayCharge}
                                    addonsTotal={addonsTotal}
                                    ordersTotal={ordersTotal}
                                    bookingChargesTotal={bookingChargesTotal}
                                    total={total}
                                />

                                {/* Total Amount */}
                                <FormField
                                    control={form.control}
                                    name="total_price"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center my-4">
                                            <FormLabel className="flex-1 font-bold text-lg">Total Amount:</FormLabel>
                                            <FormControl className="flex-1">
                                                <Input
                                                    type="number"
                                                    value={form.watch("total_price") ? String(form.watch("total_price")) : ""}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        field.onChange(isNaN(val) ? 0 : val);
                                                    }}
                                                    className="no-arrows px-0 text-right !text-4xl border-none focus:border-none focus:outline-none focus:ring-0 active:border-none active:outline-none active:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                {/* Payment & Note */}
                                <div className="grid grid-cols-1 px-4 py-6 rounded-md border border-gray-200 gap-4 bg-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                        <FormField
                                            control={form.control}
                                            name="payment_status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Payment Status</FormLabel>
                                                    <Select
                                                        value={field.value ? String(field.value) : ""}
                                                        onValueChange={(val) => field.onChange(val ? String(val) : undefined)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full bg-white">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PAYMENT_STATUS.map((status, index) => (
                                                                <SelectItem key={index} value={status}>{removeUnderscore(status)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="payment_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Payment Type</FormLabel>
                                                    <Select
                                                        value={field.value ? String(field.value) : ""}
                                                        onValueChange={(val) => field.onChange(val ? String(val) : undefined)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full bg-white">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PAYMENT_TYPE.map((type, index) => (
                                                                <SelectItem key={index} value={type}>{removeUnderscore(type)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="note"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Note</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} value={field.value ?? ""} className="h-10 bg-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </form>
            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-start-2 flex flex-col md:flex-row gap-2 pt-2">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)} className="flex-1 text-gray-500 order-3 md:order-1">
                        Close
                    </Button>

                    {isWithinGracePeriod ? (
                        <>
                            <TransferBookingDialog
                                roomName={roomData?.name}
                                trigger={
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="flex-1 text-green-500 border border-green-500 hover:bg-green-500 hover:text-white order-2 md:order-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Transfer Booking
                                    </Button>
                                }
                            />

                            <ConfirmDialog
                                entityTitle="Cancel Booking"
                                entityName="cancel this booking"
                                message="Are you sure you want to cancel this booking?"
                                onConfirm={handleCancelBooking}
                                loading={updateMutation.isPending}
                                confirmBtnClass="flex-3 border-red-300 hover:bg-red-100 hover:text-red-600 animate-[pulse-red_3s_ease-in-out_infinite]"
                                trigger={
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="flex-3 border-red-300 hover:bg-red-100 hover:text-red-600 animate-[pulse-red_3s_ease-in-out_infinite] order-1 md:order-3"
                                    >
                                        Cancel Booking
                                    </Button>
                                }
                            />
                        </>
                    ) : (
                        <ConfirmDialog
                            entityTitle="Check Out"
                            entityName="check out this booking"
                            message="Are you sure you want to check out?"
                            onConfirm={form.handleSubmit(handleSubmit)}
                            loading={updateMutation.isPending}
                            confirmBtnClass="flex-3 border-red-500 hover:bg-red-100 bg-red-700 hover:bg-red-800 text-white hover:text-white"
                            trigger={
                                <Button type="button" className="flex-3  border-red-500 hover:bg-red-100 bg-red-700 hover:bg-red-800 order-2 md:order-1">
                                    Check Out
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>
        </FormProvider>
    );
};