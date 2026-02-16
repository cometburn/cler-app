import { useState } from "react";
import { Plus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Booking } from "../types/booking.types";
import { Room } from "@/features/room/types/room.types";

import { CheckInForm } from "./CheckInForm";

interface BookingDialogProps {
    mode?: "add" | "edit";
    trigger?: React.ReactNode;
    initialData?: Partial<Booking> | null;
    roomData?: Partial<Room> | null;
}

export const BookingDialog = ({
    mode = "add",
    trigger,
    initialData,
    roomData,
}: BookingDialogProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <button className="flex items-center p-0.5 text-white rounded-full bg-green-600 hover:bg-green-700 cursor-pointer float-right">
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="bg-white max-w-lg">
                <DialogHeader className="gap-0">
                    <DialogTitle>
                        <span className="mr-1">{mode === "add" ? `Add Booking:` : `Current Booking:`}</span>
                        <span className={`${mode === "add" ? "text-green-600" : "text-red-600"}`}>Room {roomData?.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === "add"
                            ? "Create a booking."
                            : "Update the booking."}
                    </DialogDescription>
                </DialogHeader>

                {
                    mode === "add" && (
                        <CheckInForm
                            open={open}
                            setOpen={setOpen}
                            initialData={initialData}
                            roomData={roomData}
                        />
                    )
                }

            </DialogContent>
        </Dialog>
    );
};
