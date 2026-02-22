import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Room } from "@/features/room/types/room.types";
import { useBookingById } from "../../booking/hooks/useBookings";

import { CheckInForm } from "./CheckInForm";
import { CheckOutForm } from "./CheckOutForm";
import { TimeRemaining } from "./TimeRemaining";
import { Loader } from "lucide-react";

interface DashboardDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    bookingId?: number;
    roomData?: Partial<Room> | null;
}

export const DashboardDialog = ({
    mode = "add",
    trigger,
    bookingId = 0,
    roomData,
}: DashboardDialogProps) => {
    const [open, setOpen] = useState(false);
    const [frozenMode, setFrozenMode] = useState(mode);

    // Only enable query when dialog is open AND we have a valid bookingId
    const shouldEnableQuery = open && bookingId > 0;

    // Fetch booking data - automatically fetches when enabled becomes true
    const { data: bookingData, isLoading, isFetching } = useBookingById(
        bookingId,
        {
            enabled: shouldEnableQuery,
            staleTime: 0, // Always treat as stale
        }
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) setFrozenMode(mode);
        setOpen(nextOpen);
    };

    const isLoadingData = (isLoading || isFetching) && frozenMode === "edit";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger && trigger}
            </DialogTrigger>

            <DialogContent className="bg-white overflow-y-auto max-h-[90%] min-h-[90%] md:min-h-auto flex flex-col justify-start">
                <DialogHeader className="gap-0 text-left">
                    <DialogTitle className="flex items-center">
                        <span className="mr-1">{frozenMode === "add" ? "Add" : "Current"} Booking:</span>
                        <span className={`mr-2 ${frozenMode === "add" ? "text-green-600" : "text-red-600"}`}>Room {roomData?.name}</span>
                        {frozenMode === "edit" && bookingData?.end_datetime && (
                            <TimeRemaining endDatetime={bookingData.end_datetime} className="text-white rounded-full p-1 px-3 text-xs shadow-md" />
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {frozenMode === "add" ? "Create a booking." : ""}
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="animate-spin h-8 w-8" />
                    </div>
                ) : frozenMode === "add" ? (
                    <div className="max-w-screen-xs">
                        <CheckInForm
                            key="check-in"
                            open={open}
                            setOpen={setOpen}
                            initialData={null}
                            roomData={roomData}
                        />
                    </div>
                ) : (
                    <div className="max-w-screen-xs">
                        <CheckOutForm
                            key="check-out"
                            open={open}
                            setOpen={setOpen}
                            initialData={bookingData || null}
                            roomData={roomData}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};