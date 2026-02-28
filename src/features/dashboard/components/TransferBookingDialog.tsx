import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";

import { TransferBookingForm } from "./TransferBookingForm";


interface TransferBookingDialogProps {
    roomName?: string;
    trigger?: React.ReactNode;
}

export const TransferBookingDialog = ({
    roomName,
    trigger,
}: TransferBookingDialogProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="max-h-[90%] min-h-[90%] md:min-h-auto !max-w-2xl overflow-y-auto px-4">
                <DialogHeader className="gap-0 text-left">
                    <DialogTitle>
                        <span className="mr-1">Transfer Booking:</span>
                        <span className={`mr-2 text-red-600`}>Room {roomName}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                    </DialogDescription>
                </DialogHeader>


                <TransferBookingForm open={open} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}
