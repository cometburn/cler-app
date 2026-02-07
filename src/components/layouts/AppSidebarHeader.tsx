import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useMe } from "@/features/auth/hooks/useMe";
import { useUser } from "@/shared/hooks/useUser";

export default function AppSidebarHeader() {
  const { data: user } = useMe();
  const { switchHotel } = useUser();

  const userHotels = user?.hotels || [];
  const defaultHotelId = user?.default_hotel_id; // ← assuming this field exists on user
  const defaultHotel = userHotels.find((h) => h.id === defaultHotelId);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Show hotel selector only when there are multiple hotels
  if (userHotels.length > 1) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="bg-gray-900">
          <Button
            ref={triggerRef}
            role="combobox"
            aria-expanded={open}
            className="flex w-full justify-between border-none text-white rounded-none cursor-pointer overflow-hidden"
          >
            <span className="overflow-hidden max-w-[98%]">
              {defaultHotel ? defaultHotel.name : "Select a hotel"}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0 -mt-1" style={{ width }}>
          <Command className="rounded-none">
            <CommandList>
              <CommandEmpty>No hotel found.</CommandEmpty>
              <CommandGroup>
                {userHotels.map((hotel) => (
                  <CommandItem
                    key={hotel.id}
                    value={hotel.name}
                    onSelect={() => {
                      switchHotel(hotel.id);
                      setOpen(false);
                      window.location.reload();
                    }}
                    className="cursor-pointer flex items-center justify-start text-left"
                  >
                    <Check
                      className={cn(
                        defaultHotelId === hotel.id
                          ? "text-green-500"
                          : "opacity-0"
                      )}
                    />
                    <span
                      className={cn(
                        defaultHotelId === hotel.id ? "font-bold" : ""
                      )}
                    >
                      {hotel.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Single hotel or no hotels
  return (
    <div className="flex items-center w-full p-2 border-none text-sm text-white">
      <span>{defaultHotel ? defaultHotel.name : "Create a hotel"}</span>
    </div>
  );
}