import { createSocket } from "@/lib/socket";
// import { cn } from "@/lib/utils";
import { useUser } from "@/shared/hooks/useUser";
import { useEffect, useState } from "react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { DashboardRoom } from "../types/dashboard.types";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";
import { BookingDialog } from "@/features/booking/components/BookingDialog";

export const Dashboard = () => {
  const { user, defaultHotelId, isLoading, error } = useUser();
  const { data: dashboardRooms, isLoading: roomsLoading } = useDashboard();
  // const rooms = dashboardRooms?.data ?? [];

  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [_socket, setSocket] = useState<Socket | null>(null);

  // Initialize rooms from API data
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
            ? { ...room, bookings: [data] } // Add the new booking
            : room
        )
      );
    });


    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      // Handle authentication errors
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
      {
        rooms?.map((room: DashboardRoom) => (
          <BookingDialog
            key={room.id}
            mode={`${room.bookings && room.bookings?.length > 0 ? "edit" : "add"}`}
            initialData={room.bookings && room.bookings?.length > 0 ? room.bookings[0] : null}
            roomData={room}
            trigger={
              <Button variant="outline" key={room.id} className="bg-white rounded-md shadow-lg px-2 py-6 md:py-12 text-center">
                {room.bookings && room.bookings?.length > 0 ? (
                  <span className="text-red-600 text-xl">{room.name}</span>
                ) : (
                  <span className="text-green-600 text-xl">{room.name}</span>
                )}
              </Button>
            }
          />
        ))
      }

    </div >
  );
};