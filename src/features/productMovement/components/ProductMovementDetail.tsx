import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { ProductMovement } from "@/features/productMovement/types/productMovement.types";
import { formatCurrency, removeUnderscore } from "@/helpers/string.helper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/helpers/date.helper";
import { ChevronDownIcon } from "lucide-react";

interface ProductMovementDetailProps {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    initialData?: Partial<ProductMovement> | null;
}

export const ProductMovementDetail = ({
    open,
    setOpen,
    initialData,
}: ProductMovementDetailProps) => {

    // Reset form when opening or receiving initialData
    useEffect(() => {
        if (!open) return;
    }, [open, initialData]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogContent className="bg-white overflow-y-auto max-h-[90%] md:min-h-auto">

                <DialogHeader className="flex">
                    <DialogTitle className="flex flex-row items-center">
                        <span className="mr-2">Product Movement Detail</span>
                        <Badge
                            className={cn(
                                "uppercase",
                                initialData?.type === "in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                        >
                            {removeUnderscore(initialData?.type || "")}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                {
                    initialData && initialData?.booking &&
                    <Collapsible className="group/collapsible border border-gray-300 rounded-md" defaultOpen={true}>
                        <CollapsibleTrigger className="flex flex-row items-center text-xs w-full p-2 text-left cursor-pointer">
                            Booking Details
                            <ChevronDownIcon className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="grid grid-cols-1 p-4 gap-4 border-t border-gray-300 bg-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Room</div>
                                    <div className="text-sm">{initialData?.booking?.room?.name}</div>
                                </div>
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Room Rate</div>
                                    <div className="text-sm">{initialData?.booking?.room_rate?.name}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Start Date</div>
                                    <div className="text-sm">{formatDate(initialData?.booking?.start_datetime, "MM/DD/YYYY hh:mm A")}</div>
                                </div>
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">End Date</div>
                                    <div className="text-sm">{formatDate(initialData?.booking?.end_datetime, "MM/DD/YYYY hh:mm A")}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Payment Status</div>
                                    <div className="text-sm capitalize">{initialData?.booking?.payment_status}</div>
                                </div>
                                <div className="flex flex-col gap-0">
                                    <div className="text-xs text-gray-400">Payment Type</div>
                                    <div className="text-sm capitalize">{removeUnderscore(initialData?.booking?.payment_type || "")}</div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                }
                <div className="grid grid-cols-1 p-4 gap-4 border border-gray-300 rounded-md bg-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0">
                            <div className="text-xs text-gray-400">Product</div>
                            <div className="text-sm">{initialData?.product?.name}</div>
                        </div>

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0">
                            <div className="text-xs text-gray-400">Quantity</div>
                            <div className="text-sm">{initialData?.quantity}</div>
                        </div>
                        <div className="flex flex-col gap-0">
                            <div className="text-xs text-gray-400">Unit Cost</div>
                            {
                                initialData?.unit_cost &&
                                <div className="text-sm">{formatCurrency(initialData?.unit_cost as number, { currencySymbol: "" })}</div>
                            }
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0">
                            <div className="text-xs text-gray-400">Date</div>
                            {initialData?.orderItem?.created_at ?
                                <div className="text-sm">{formatDate(initialData?.orderItem?.created_at as string, "MM/DD/YYYY hh:mm A")}</div>
                                : <div className="text-sm">{formatDate(initialData?.created_at as string, "MM/DD/YYYY hh:mm A")}</div>
                            }
                        </div>
                        <div className="flex flex-col gap-0">
                            <div className="text-xs text-gray-400">Added By</div>
                            {initialData?.orderItem?.user ?
                                <div className="text-sm capitalize">{initialData?.orderItem?.user?.first_name + " " + initialData?.orderItem?.user?.last_name}</div>
                                : <div className="text-sm capitalize">{initialData?.user?.first_name + " " + initialData?.user?.last_name}</div>
                            }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};
