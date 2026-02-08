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

import { hotelSchema, type Hotel } from "@/shared/types/hotel.types";
import { useUser } from "@/shared/hooks/useUser";
import { useLogout } from "@/features/auth/hooks/useLogout";

import { useCreateHotel } from "@/features/hotel/hooks/useCreateHotel";

export const CreateHotelDialog = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const logout = useLogout();

  const [open, setOpen] = useState(false);
  const { mutateAsync: createHotel, isPending } = useCreateHotel();

  const isAdmin = user?.user_type_id === 2;
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
    await createHotel(data);
    toast.success("Hotel created successfully");
    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (hasNoHotels && isAdmin && !isOpen) {
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
                disabled={isPending}
                className="bg-green-600 hover:bg-green-500 cursor-pointer flex-1"
              >
                {isPending ? (
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