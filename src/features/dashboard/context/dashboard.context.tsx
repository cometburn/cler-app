import { createContext } from "react";
import { Room } from "@/features/room/types/room.types";

export const DashboardContext = createContext<{
    open: boolean;
    setOpen: (open: boolean) => void,
    roomData: Room;
} | null>(null);