"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { useBookingById } from "../hooks/useBookings";
import { formatDate } from "@/helpers/date.helper";
import { BookingBreakdown } from "@/features/dashboard/components/BookingBreakdown";
import { formatCurrency } from "@/helpers/string.helper";
import { useBookingBreakdown } from "../hooks/useBookingBreakdown";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    bookingId: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const BookingDialog = ({
    trigger,
    bookingId,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: BookingDialogProps) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Support both controlled (row click) and uncontrolled (trigger button) usage
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (controlledOnOpenChange ?? setInternalOpen) : setInternalOpen;

    const { data: bookingData, isLoading } = useBookingById(bookingId, {
        enabled: !!bookingId && open,
    });

    const {
        overstayMinutes,
        billedHours,
        overstayCharge,
        total,
        addonsTotal,
        ordersTotal,
        hasBookingCharges,
        hasBookingAddons,
        hasBookingOrders,
        bookingChargesTotal,
    } = useBookingBreakdown({ initialData: bookingData });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {trigger ?? (
                        <button className="flex items-center p-0.5 text-white rounded-full bg-green-600 hover:bg-green-700 cursor-pointer float-right">
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="bg-white overflow-y-auto max-h-[90%] min-h-[90%] md:min-h-auto">
                <div className="grid gap-4 grid-cols-1">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col md:flex-row item-start md:items-center gap-2">
                            <span className="mr-1">Booking Details:</span>
                            <span className="text-red-600">Room {bookingData?.room?.name}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
                    {bookingData && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Check In Date</div>
                                    <div className="text-sm">{formatDate(bookingData?.start_datetime, "MM/DD/YYYY hh:mm A")}</div>
                                </div>
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Check Out Date</div>
                                    <div className="text-sm">{formatDate(bookingData?.updated_at, "MM/DD/YYYY hh:mm A")}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Extra Person</div>
                                    <div className="text-sm">{bookingData?.extra_person}</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            {(hasBookingCharges || hasBookingAddons || hasBookingOrders) && <Tabs
                                className="gap-0 py-4 px-4 rounded-md border border-gray-200 bg-gray-100"
                            >
                                <TabsList
                                    variant="line"
                                    className={cn("px-0 grid grid-cols-1 md:grid-cols-3 w-full h-auto [&]:h-auto", !hasBookingCharges && "md:grid-cols-2")}
                                >
                                    {hasBookingCharges &&
                                        <TabsTrigger value="charges" className="cursor-pointer">Transfer Charges</TabsTrigger>
                                    }
                                    {hasBookingAddons && <TabsTrigger value="addons" className="cursor-pointer">Room Add-ons</TabsTrigger>}
                                    {hasBookingOrders && <TabsTrigger value="orders" className="cursor-pointer">Orders</TabsTrigger>}
                                </TabsList>

                                {hasBookingCharges &&
                                    <TabsContent value="charges" className="pt-2 md:mt-0">
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
                                                    {bookingData?.booking_charges?.map((charge) => (
                                                        <TableRow key={charge.id}>
                                                            <TableCell className="text-left text-xs py-1 h-6">{charge.room?.name}</TableCell>
                                                            <TableCell className="text-xs py-1 h-6 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{charge.name || ""}</TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{formatCurrency(Number(charge.price), { currencySymbol: "" })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                }

                                {hasBookingAddons &&
                                    <TabsContent value="addons" className="pt-2 md:mt-0">
                                        <div className="w-full overflow-hidden">
                                            <Table className="bg-transparent w-full table-fixed">
                                                <TableHeader>
                                                    <TableRow className="border-b border-gray-200">
                                                        <TableHead className="text-xs py-0 h-6 text-gray-400 w-full">Name</TableHead>
                                                        <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Price</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bookingData?.booking_addons?.map((addon) => (
                                                        <TableRow key={addon.id}>
                                                            <TableCell className="text-xs py-1 h-6 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{addon.product?.name || ""}</TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{formatCurrency(Number(addon.price), { currencySymbol: "" })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                }

                                {hasBookingOrders &&
                                    <TabsContent value="orders" className="pt-2 md:mt-0">
                                        <div className="w-full overflow-hidden">
                                            <Table className="bg-transparent w-full table-fixed">
                                                <TableHeader>
                                                    <TableRow className="border-b border-gray-200">
                                                        <TableHead className="text-xs py-0 h-6 text-gray-400 w-full">Name</TableHead>
                                                        <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Quantity</TableHead>
                                                        <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Unit Price</TableHead>
                                                        <TableHead className="text-center text-xs py-0 h-6 text-gray-400 w-20">Total Price</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bookingData?.orders?.order_items?.map((orderItem) => (
                                                        <TableRow key={orderItem.id}>
                                                            <TableCell className="text-xs py-1 h-6 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {orderItem.product?.name || ""} x {orderItem.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{orderItem.quantity}</TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{formatCurrency(Number(orderItem.price), { currencySymbol: "" })}</TableCell>
                                                            <TableCell className="text-right text-xs py-1 h-6">{formatCurrency(Number(orderItem.total_price), { currencySymbol: "" })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                }
                            </Tabs>
                            }

                            <BookingBreakdown
                                roomCharge={bookingData?.room_rate?.base_price ?? 0}
                                extraPerson={bookingData?.extra_person ?? 0}
                                extraPersonRate={bookingData?.room_rate?.extra_person_rate ?? 0}
                                overstayMinutes={overstayMinutes}
                                billedHours={billedHours}
                                overstayRate={bookingData?.room_rate?.overstay_rate ?? 0}
                                overstayCharge={overstayCharge}
                                addonsTotal={addonsTotal}
                                ordersTotal={ordersTotal}
                                bookingChargesTotal={bookingChargesTotal}
                                total={total}
                            />

                            {/* Total Amount */}
                            <div className="flex flex-row items-center my-4">
                                <p className="flex-1 font-bold text-lg">Total Amount:</p>
                                <p className="flex-1 text-right text-4xl">{formatCurrency(bookingData.total_price)}</p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" className="flex-1 text-gray-500" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};