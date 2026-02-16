"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Label,
} from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RoomPromo, roomPromoSchema } from "../types/roomPromo.types";

import { useRoomRates } from "@/features/roomRate/hooks/useRoomRates";

import { DAYS } from "@/constants/system";
import { RoomRate } from "@/features/roomRate/types/roomRate.types";
import { ApiError } from "@/shared/types/apiError.types";
import { DateTimePickerField } from "@/components/fields/datePicker/DatePickerField";

interface RoomPromoDialogProps {
  mode?: "add" | "edit";
  trigger?: React.ReactNode;
  initialData?: Partial<RoomPromo> | null;
  onSubmit: (data: RoomPromo) => void | Promise<void>;
}

export const RoomPromoDialog = ({
  mode = "add",
  trigger,
  initialData,
  onSubmit,
}: RoomPromoDialogProps) => {
  const [open, setOpen] = useState(false);

  const { data } = useRoomRates(1, 100);
  const roomRates = data?.data ?? [];

  const defaultValues = useMemo<Partial<RoomPromo>>(
    () => ({
      name: "",
      room_rate_id: 0,
      start_datetime: undefined,
      end_datetime: undefined,
      days_of_week: [],
      price: 0,
      note: "",
      extra_person_rate: 0,
    }),
    []
  );

  const form = useForm<RoomPromo>({
    resolver: zodResolver(roomPromoSchema),
    defaultValues,
    mode: "onSubmit",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.reset({
        ...defaultValues,
        ...initialData,
        start_datetime: initialData.start_datetime
          ? new Date(initialData.start_datetime)
          : undefined,
        end_datetime: initialData.end_datetime
          ? new Date(initialData.end_datetime)
          : undefined,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [open, initialData, form, defaultValues]);


  const handleSubmit = async (values: RoomPromo) => {
    try {
      const { start_datetime, end_datetime, ...rest } = values;

      const payload = {
        ...rest,
        ...(start_datetime != null ? { start_datetime } : {}),
        ...(end_datetime != null ? { end_datetime } : {}),
      };

      await onSubmit(payload as RoomPromo);
      setOpen(false);
      form.reset(defaultValues);

    } catch (error: unknown) {
      const errors = (error as ApiError).response?.data?.errors;

      if (errors && Array.isArray(errors)) {
        errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            const fieldPath = err.path[0] as keyof RoomPromo;

            form.setError(fieldPath, {
              type: "manual",
              message: err.message,
            });
          }
        });
      }
    }
  };

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
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Room Promo" : "Edit Room Promo"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {mode === "add"
              ? "Create a new promo for selected room rate."
              : "Update the promo details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Weekend Special" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Rate */}
            <FormField
              control={form.control}
              name="room_rate_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Rate</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) =>
                      field.onChange(val ? Number(val) : undefined)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {roomRates?.length ? (
                        roomRates.map((rate: RoomRate) => (
                          <SelectItem key={rate.id} value={String(rate.id)}>
                            {rate.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-rates">
                          No rates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <DateTimePickerField
              control={form.control}
              name="start_datetime"
              label="Start Date & Time"
            />

            <DateTimePickerField
              control={form.control}
              name="end_datetime"
              label="End Date & Time"
            />

            {/* Days of Week */}
            <FormField
              control={form.control}
              name="days_of_week"
              render={({ field }) => {
                const selectedDays: number[] = Array.isArray(field.value)
                  ? field.value
                  : [];

                return (
                  <FormItem className="py-2">
                    <FormLabel>Days of Week</FormLabel>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {DAYS.map(({ label, value }) => {
                        const id = `day-${value}`;
                        const checked = selectedDays.includes(value);

                        return (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={(checked) => {
                                const updated = checked
                                  ? [...selectedDays, value]
                                  : selectedDays.filter((d) => d !== value);

                                field.onChange(updated);
                              }}
                              className="
                                data-[state=checked]:bg-green-500
                                data-[state=checked]:border-green-500
                                data-[state=checked]:text-white
                              "
                            />
                            <Label
                              htmlFor={id}
                              className="cursor-pointer select-none"
                            >
                              {label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        field.onChange(isNaN(val) ? 0 : val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Extra Person Rate */}
            <FormField
              control={form.control}
              name="extra_person_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extra Person Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        field.onChange(isNaN(val) ? 0 : val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={6} className="h-30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 text-gray-500"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-green-500">
                {mode === "add" ? "Save" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
