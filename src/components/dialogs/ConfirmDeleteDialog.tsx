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

interface ConfirmDeleteDialogProps {
  entityName: string;
  message?: string;
  onConfirm: () => void | Promise<void>;
  trigger?: React.ReactNode;
  loading?: boolean;
}

export const ConfirmDeleteDialog = ({
  entityName,
  message,
  onConfirm,
  trigger,
  loading = false,
}: ConfirmDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      // No local loading state anymore
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            disabled={loading}
            variant="ghost"
            className="text-red-400 hover:bg-red-50 hover:text-red-400 cursor-pointer float-right size-7"
          >
            {loading ? (
              <LoaderCircle className="w-4 h-4 animate-spin p-0  loader-icon" />
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="mb-5">Confirm Delete</DialogTitle>
          <DialogDescription>
            {message || `Do you want to delete ${entityName}?`}
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
            className="border-red-300 hover:bg-red-500 hover:border-red-500 hover:text-white  flex-1 text-red-400 cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
