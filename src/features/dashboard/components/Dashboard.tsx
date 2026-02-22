import { createSocket } from "@/lib/socket";
import { useUser } from "@/shared/hooks/useUser";
import { useEffect, useState } from "react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { DashboardRoom } from "../types/dashboard.types";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";
import { DashboardDialog } from "./DashboardDialog";
import { toast } from "sonner";
import { isEndingSoon } from "@/helpers/date.helper";
import { AlarmClock } from "lucide-react";
import { ALARM_PERIOD } from "@/constants/system";

export const Dashboard = () => {
  const { user, defaultHotelId, isLoading, error } = useUser();
  const { data: dashboardRooms, isLoading: roomsLoading } = useDashboard();

  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [_socket, setSocket] = useState<Socket | null>(null);
  const [_now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dashboardRooms?.data) {
      setRooms(dashboardRooms.data);
    }
  }, [dashboardRooms?.data]);

  useEffect(() => {
    const socketInstance = createSocket();
    socketInstance.connect();

    socketInstance.on("connect", () => {
      socketInstance.emit("join_hotel", `hotel_${defaultHotelId}`);
    });

    socketInstance.on('check_in', (data) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === data.room_id
            ? { ...room, bookings: [data] }
            : room
        )
      );
    });

    socketInstance.on('check_out', (data) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === data.room_id
            ? { ...room, bookings: [] }
            : room
        )
      );
    });

    socketInstance.on("connect_error", (_error) => {
      toast.error('Websocket connection failed!');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off("message");
      socketInstance.disconnect();
    };
  }, []);

  if (isLoading || roomsLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-6">No user data available</div>;
  }

  return (
    <div className="md:max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
      {rooms?.map((room: DashboardRoom) => {
        const booking = room.bookings?.[0];
        const hasBooking = room.bookings && room.bookings.length > 0;
        const endingSoon = booking?.end_datetime && isEndingSoon(booking.end_datetime, ALARM_PERIOD);
        const isOverdue = booking?.end_datetime && new Date(booking.end_datetime).getTime() < Date.now();
        const bookingId = booking ? booking.id : 0;


        return (
          <DashboardDialog
            key={room.id}
            mode={hasBooking ? 'edit' : 'add'}
            bookingId={bookingId}
            roomData={room}
            trigger={
              <Button className="bg-white rounded-lg shadow-lg px-2 py-12 text-center relative hover:bg-gray-100 border-white">
                {(endingSoon || isOverdue) && (
                  <AlarmClock
                    size={32}
                    className={`absolute top-2 right-2 !w-8 !h-8 animate-pulse animate-shake-infinite ${isOverdue ? "text-red-500" : "text-orange-500"}`}
                  />
                )}
                <span className={hasBooking ? "text-red-600 text-xl" : "text-green-600 text-xl"}>
                  {room.name}
                </span>
              </Button>
            }
          />
        );
      })}
    </div>
  );
};