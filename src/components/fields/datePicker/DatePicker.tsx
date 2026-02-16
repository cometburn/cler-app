import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatDate?: (date: Date) => string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  className,
  formatDate,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);

  // Update internal state when value prop changes
  useEffect(() => {
    setDate(value);
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      onChange?.(undefined);
      return;
    }

    // Preserve time if date already exists, otherwise set to current time
    const newDate = date
      ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
      : selectedDate;

    setDate(newDate);
    onChange?.(newDate);
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    if (!date) {
      const now = new Date();
      setDate(now);
      onChange?.(now);
      return;
    }

    const newDate = new Date(date);

    switch (type) {
      case "hour": {
        const hour = parseInt(value);
        const isPM = newDate.getHours() >= 12;
        if (isPM) {
          newDate.setHours(hour === 12 ? 12 : hour + 12);
        } else {
          newDate.setHours(hour === 12 ? 0 : hour);
        }
        break;
      }
      case "minute": {
        newDate.setMinutes(parseInt(value));
        break;
      }
      case "ampm": {
        const currentHours = newDate.getHours();
        if (value === "AM" && currentHours >= 12) {
          newDate.setHours(currentHours - 12);
        } else if (value === "PM" && currentHours < 12) {
          newDate.setHours(currentHours + 12);
        }
        break;
      }
    }

    setDate(newDate);
    onChange?.(newDate);
  };

  const defaultFormatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          {date ? (
            formatDate ? formatDate(date) : defaultFormatDate(date)
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto h-[180px] sm:h-full">
              <div className="flex sm:flex-col p-2 gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .reverse()
                  .map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() % 12 === hour % 12
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
            </ScrollArea>

            {/* Minutes */}
            <ScrollArea className="w-64 sm:w-auto h-[180px] sm:h-full">
              <div className="flex sm:flex-col p-2 gap-1">
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* AM/PM */}
            <ScrollArea className="h-[180px] sm:h-full">
              <div className="flex sm:flex-col p-2 gap-1">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}