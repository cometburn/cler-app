"use client";

import { useState } from "react";
import { LoaderCircle, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    entityTitle: string;
    entityName: string;
    message?: string;
    onConfirm: () => void | Promise<void>;
    trigger?: React.ReactNode;
    confirmBtnClass?: string;
    loading?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const ConfirmDialog = ({
    entityTitle,
    entityName,
    message,
    onConfirm,
    trigger,
    confirmBtnClass,
    loading = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ConfirmDialogProps) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Determine if we're in controlled mode
    const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;

    // Use controlled state if provided, otherwise use internal state
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

    const handleConfirm = async () => {
        try {
            await onConfirm();
            setOpen(false);
        } catch (error) {
            console.error("Confirm error:", error);
            // Don't close dialog on error
        }
    };

    // Default trigger with proper onClick handler
    const defaultTrigger = (
        <Button
            disabled={loading}
            variant="ghost"
            onClick={() => setOpen(true)} // Manually control
            className="text-red-400 hover:bg-red-50 hover:text-red-400 cursor-pointer float-right size-7"
        >
            {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin p-0 loader-icon" />
            ) : (
                <Trash className="w-4 h-4" />
            )}
        </Button>
    );

    return (
        <>
            {/* Render trigger outside Dialog when controlled */}
            {isControlled && trigger}
            {!isControlled && !trigger && defaultTrigger}

            <Dialog open={open} onOpenChange={setOpen}>
                {/* Only use DialogTrigger in uncontrolled mode */}
                {!isControlled && trigger && (
                    <DialogTrigger asChild>
                        {trigger}
                    </DialogTrigger>
                )}

                <DialogContent className="max-w-auto">
                    <DialogHeader>
                        <DialogTitle className="mb-5">Confirm {entityTitle}</DialogTitle>
                        <DialogDescription>
                            {message || `Do you want to ${entityName}?`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="flex-1 hover:bg-gray-200 hover:border-gray-400 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`flex-1 cursor-pointer ${confirmBtnClass}`}
                        >
                            {loading ? `Processing...` : entityTitle}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};