import { useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { RoomType } from "@/features/roomType/types/roomType.types";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { fetchRoomTypes } from "@/features/roomType/api/roomType.api";
import { Booking, TransferBooking, TransferBookingInput, transferBookingSchema } from "@/features/booking/types/booking.types";
import { fetchRoomsByRoomTypeId } from "@/features/room/api/room.api";
import { Room } from "@/features/room/types/room.types";
import { fetchRoomRatesByRoomType } from "@/features/roomRate/api/roomRate.api";
import { Input } from "@/components/ui/input";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { BookingChargesForm } from "@/features/bookingCharge/components/BookingChargesForm";
import { BookingCharge } from "@/features/bookingCharge/types/bookingCharge.types";

import { useTransferBooking } from "../../booking/hooks/useBookings";
import { BOOKING_STATUS } from "@/constants/system";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

import { DashboardContext } from "../context/dashboard.context";

interface TransferBookingFormProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export const TransferBookingForm = ({ open, setOpen }: TransferBookingFormProps) => {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isLoadingRoomRates, setIsLoadingRoomRates] = useState(false);
    const [isTransfering, setIsTransfering] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const hasLoadedRoomTypes = useRef(false);

    const dashboardContext = useContext(DashboardContext);

    const transferBookingMutation = useTransferBooking();

    const parentForm = useFormContext<Booking>();

    const currentAddons = parentForm.getValues("booking_addons") || [];
    const currentOrders = parentForm.getValues("orders.order_items") || [];

    const [currentBookingCharges, setCurrentBookingCharges] = useState<BookingCharge[]>(
        parentForm.getValues("booking_charges") || []
    );

    const defaultValues = useMemo<Partial<TransferBooking>>(
        () => ({
            room_id: 0,
            room_rate_id: 0,
            start_datetime: undefined,
            end_datetime: undefined,
            status: "transferred",
            payment_status: "",
            payment_type: "",
            total_price: 0,
            extra_person: 0,
            note: null,
            booking_addons: [],
            orders: [],
        }),
        []
    );

    const form = useForm<TransferBookingInput>({
        resolver: zodResolver(transferBookingSchema),
        defaultValues,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    form.setValue("start_datetime", parentForm.getValues("start_datetime") || new Date());
    form.setValue("end_datetime", parentForm.getValues("end_datetime") || new Date());
    form.setValue("status", "transferred");
    form.setValue("extra_person", parentForm.getValues("extra_person") || 0);
    form.setValue("note", parentForm.getValues("note") || null);
    form.setValue("original_booking_id", parentForm.getValues("id") || 0);
    form.setValue("id", parentForm.getValues("id") || 0);
    form.setValue("orders", parentForm.getValues("orders.order_items") || []);
    form.setValue("booking_addons", parentForm.getValues("booking_addons") || []);
    form.setValue("booking_charges", parentForm.getValues("booking_charges") || []);
    form.setValue("status", parentForm.getValues("status") || "");



    useEffect(() => {
        if (!open) {
            hasLoadedRoomTypes.current = false;
            return;
        }

        if (hasLoadedRoomTypes.current) return;
        hasLoadedRoomTypes.current = true;

        let isCancelled = false;

        const loadRoomTypes = async () => {
            try {
                console.log('test')
                setIsLoadingRoomTypes(true);
                const result = await fetchRoomTypes(1, 100);

                if (isCancelled) return;

                setRoomTypes(result.data ?? []);

            } catch (error) {
                if (isCancelled) return;
                console.error("Error fetching room rates:", error);
                setRoomTypes([]);
            } finally {
                if (!isCancelled) {
                    setIsLoadingRoomTypes(false);
                }
            }
        }

        loadRoomTypes()
    }, [open])

    const handleSetBookingCharges = useCallback((charges: BookingCharge[]) => {
        console.log('charges', charges)
        setCurrentBookingCharges(charges);

        form.setValue("booking_charges", charges);       // sync to transfer form
    }, [form]);


    const handleRoomTypeChange = useCallback(async (value: string) => {
        if (!value) return;
        form.setValue("room_type_id", Number(value));
        form.setValue("room_id", 0);
        form.setValue("room_rate_id", 0);

        try {
            setIsLoadingRooms(true);
            setIsLoadingRoomRates(true);

            const [roomResults, roomRateResults] = await Promise.all([
                fetchRoomsByRoomTypeId(Number(value)),
                fetchRoomRatesByRoomType(Number(value)),
            ]);

            console.log('roomResults', roomResults)
            console.log('roomRateResults', roomRateResults)

            setRooms(roomResults ?? []);
            setRoomRates(roomRateResults ?? []);
        } catch (error) {
            setRooms([]);
            setRoomRates([]);
        } finally {
            setIsLoadingRooms(false);
            setIsLoadingRoomRates(false);
        }
    }, [form]);

    const handleRoomChange = useCallback(async (value: string) => {
        if (!value) return;
        form.setValue("room_id", Number(value));
    }, [form]);

    const handleRoomRateChange = useCallback(async (value: string) => {
        if (!value) return;
        form.setValue("room_rate_id", Number(value));
    }, [form]);

    const handleExtraPersonChange = useCallback((value: number) => value, []);

    const handleTransferClick = async () => {
        const isValid = await form.trigger();

        if (!isValid) {
            toast.error("Please fill in all required fields");
            return;
        }
        setShowConfirmDialog(true);
    };


    const handleTransferBooking = async () => {
        const values = form.getValues();

        console.log('values', values)
        console.log('currentBookingCharges', currentBookingCharges)

        const payload: TransferBooking = {
            id: parentForm.getValues("id") || 0,
            original_booking_id: parentForm.getValues("id") || 0,
            room_id: values.room_id,
            room_rate_id: values.room_rate_id,
            room_type_id: values.room_type_id,
            start_datetime: values.start_datetime ? new Date(values.start_datetime) : new Date(),
            end_datetime: values.end_datetime ? new Date(values.end_datetime) : new Date(),
            status: BOOKING_STATUS[0],
            extra_person: values.extra_person || 0,
            note: "Booking transferred",
            booking_addons: currentAddons,
            orders: [...currentOrders],
            booking_charges: currentBookingCharges,
        };

        console.log('payload', payload)

        try {
            setIsTransfering(true);
            await transferBookingMutation.mutateAsync(transferBookingSchema.parse(payload));
            setShowConfirmDialog(false); // Close confirm dialog
            setOpen(false); // Close transfer dialog
            dashboardContext?.setOpen(false); // Close dashboard dialog
        } catch (error) {
            console.error("Error transferring booking:", error);
            toast.error("Failed to transfer booking");
            throw error; // Let ConfirmDialog handle the error
        } finally {
            setIsTransfering(false);
        }
    };


    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(handleTransferBooking, (error) => {
                    console.log('error', error)
                })}
                className="grid gap-4"
            >
                {
                    isLoadingRoomTypes ? (
                        <div className="flex items-center justify-center min-h-[300px] w-full" >
                            <Loader className="animate-spin" />
                        </div >
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-2 items-start">
                                {/* Room Rate */}
                                <FormField
                                    control={form.control}
                                    name="room_type_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room Type</FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={handleRoomTypeChange}
                                                disabled={isLoadingRoomTypes}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full bg-white">
                                                        <SelectValue placeholder={isLoadingRoomTypes ? "Loading room types..." : "Select room type"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoadingRoomTypes ? (
                                                        <SelectItem disabled value="loading">Loading...</SelectItem>
                                                    ) : roomTypes?.length ? (
                                                        roomTypes.map((type: RoomType) => (
                                                            <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem disabled value="no-room-types">No room types available</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Rooms */}
                                <FormField
                                    control={form.control}
                                    name="room_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room</FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={handleRoomChange}
                                                disabled={isLoadingRooms || rooms?.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full bg-white">
                                                        <SelectValue
                                                            placeholder={
                                                                isLoadingRooms ? "Loading room..." :
                                                                    rooms?.length > 0 ? "Select room" : "No room available"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoadingRooms ? (
                                                        <SelectItem disabled value="loading">Loading...</SelectItem>
                                                    ) : rooms?.length > 0 ? (
                                                        rooms.map((room: Room) => (
                                                            <SelectItem key={room.id} value={String(room.id)}>{room.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem disabled value="no-room-types">No rooms available</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-2 items-start">
                                {/* Room Rates  */}
                                <FormField
                                    control={form.control}
                                    name="room_rate_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room Rate</FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={handleRoomRateChange}
                                                disabled={isLoadingRoomRates || rooms?.length === 0 || roomRates?.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full bg-white">
                                                        <SelectValue
                                                            placeholder={
                                                                isLoadingRoomRates ? "Loading room rates..." :
                                                                    rooms?.length > 0 && roomRates?.length > 0 ? "Select room rate" : "No room rate available"}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoadingRoomRates ? (
                                                        <SelectItem disabled value="loading">Loading...</SelectItem>
                                                    ) : roomRates?.length > 0 ? (
                                                        roomRates.map((roomRate: RoomRate) => (
                                                            <SelectItem key={roomRate.id} value={String(roomRate.id)}>{roomRate.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem disabled value="no-room-types">No rooms available</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                    className="bg-white"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="charges" className="gap-0 pt-0 pb-2 px-4 rounded-md border border-gray-200 bg-gray-100 mt-5">
                                <TabsList
                                    variant="line"
                                    className="px-0 grid grid-cols-1 md:grid-cols-3 w-full h-auto [&]:h-auto"
                                >
                                    <TabsTrigger value="charges" className="cursor-pointer">Transfer Charges</TabsTrigger>
                                    <TabsTrigger value="addons" className="cursor-pointer">Room Add-ons ({currentAddons?.length})</TabsTrigger>
                                    <TabsTrigger value="order" className="cursor-pointer">Orders ({currentOrders?.length})</TabsTrigger>
                                </TabsList>
                                <TabsContent value="charges" className="py-2 mt-18 md:mt-0">
                                    <BookingChargesForm
                                        bookingCharges={currentBookingCharges}
                                        setBookingCharges={handleSetBookingCharges}
                                        transferRoomId={form.getValues("room_id")}
                                    />
                                </TabsContent>
                                <TabsContent value="addons" className="py-2 mt-18 md:mt-0">
                                    {currentAddons && currentAddons?.length > 0 ? (
                                        <Table className="bg-transparent">
                                            <TableHeader>
                                                <TableRow className="border-b border-gray-200">
                                                    <TableHead className="text-xs py-0 h-6 text-gray-400">Addon</TableHead>
                                                    <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Quantity</TableHead>
                                                    <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Price</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentAddons?.map((addon, index) => (
                                                    <TableRow key={addon.id || index}>
                                                        <TableCell className="text-xs py-1 h-6">{addon.product?.name || ""}</TableCell>
                                                        <TableCell className="text-right text-xs py-1 h-6 w-5">{addon.quantity}</TableCell>
                                                        <TableCell className="text-right text-xs py-1 h-6 w-14">{Number(addon.total_price).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center text-xs py-7 h-6 text-gray-400">No addons available</div>
                                    )}
                                </TabsContent>
                                <TabsContent value="order" className="py-2 mt-18 md:mt-0">
                                    {currentOrders?.length > 0 ? (
                                        <Table className="bg-transparent">
                                            <TableHeader>
                                                <TableRow className="border-b border-gray-200">
                                                    <TableHead className="text-xs py-0 h-6 text-gray-400">Product</TableHead>
                                                    <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Quantity</TableHead>
                                                    <TableHead className="text-center text-xs py-0 h-6 text-gray-400">Price</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentOrders.map((item, index) => (
                                                    <TableRow key={item.product?.id || index}>
                                                        <TableCell className="text-xs py-1 h-6">{item.product?.name || ""}</TableCell>
                                                        <TableCell className="text-right text-xs py-1 h-6 w-5">{item.quantity}</TableCell>
                                                        <TableCell className="text-right text-xs py-1 h-6 w-14">{Number(item.total_price).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center text-xs py-7 h-6 text-gray-400">No orders available</div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] mt-4 space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isTransfering}
                                    className="flex-1 bg-white hover:bg-gray-200 hover:border-gray-400 cursor-pointer order-2 md:order-1"
                                >
                                    Cancel
                                </Button>

                                <ConfirmDialog
                                    open={showConfirmDialog}
                                    onOpenChange={setShowConfirmDialog}
                                    entityTitle="Transfer Booking"
                                    entityName="transfer this booking"
                                    message="Are you sure you want to transfer this booking?"
                                    onConfirm={handleTransferBooking}
                                    loading={transferBookingMutation.isPending}
                                    confirmBtnClass="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                                    trigger={
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={handleTransferClick}
                                            disabled={isTransfering}
                                            className="flex-1 bg-white text-green-500 border border-green-500 hover:bg-green-500 hover:text-white order-1 md:order-2"
                                        >
                                            Transfer Booking
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                    )
                }
            </form>
        </FormProvider >
    );
};