import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { createHotel } from "../api/hotel.api";
import { hotelSchema, type Hotel } from "@/shared/types/hotel.types";
import { useUser } from "@/shared/hooks/useUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useQueryClient } from "@tanstack/react-query";

export const CreateHotelDialog = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.user_type_id === 2; // adjust based on your user shape
  const hasNoHotels = user?.hotels?.length === 0;

  const form = useForm<Hotel>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  // Auto-open dialog if admin with no hotels
  useEffect(() => {
    if (!isUserLoading && user && hasNoHotels && isAdmin) {
      setOpen(true);
    }
  }, [user, isAdmin, hasNoHotels, isUserLoading]);

  const onSubmit = async (data: Hotel) => {
    setSubmitting(true);
    try {
      const newHotel = await createHotel(data);

      // Optimistically update the user query cache with the new hotel
      queryClient.setQueryData(["currentUser"], (oldUser: any) => {
        if (!oldUser) return oldUser;

        return {
          ...oldUser,
          hotels: [...(oldUser.hotels || []), { ...newHotel, is_default: true }],
        };
      });

      toast.success("Hotel created successfully");
      setOpen(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create hotel:", err);
      toast.error("Failed to create hotel");
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent closing dialog when no hotels (force user to create one or logout)
  const handleOpenChange = (isOpen: boolean) => {
    if (hasNoHotels && isAdmin && !isOpen) {
      // Don't allow closing — user must create hotel or logout
      return;
    }
    setOpen(isOpen);
  };

  if (isUserLoading) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "sm:max-w-[425px] bg-white",
          hasNoHotels && isAdmin && "[&>button]:hidden" // hide close button
        )}
      >
        <DialogHeader>
          <DialogTitle>Create Hotel</DialogTitle>
          <DialogDescription className="text-xs">
            Please create a hotel to continue.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="bg-white cursor-pointer"
                onClick={logout}
              >
                Logout
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-500 cursor-pointer flex-1"
              >
                {submitting ? (
                  <LoaderCircle className="w-5 h-5 animate-spin text-white" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};