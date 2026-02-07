import { Route } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
// import { RoomRates } from "@/pages/rooms/RoomRates";
// import { RoomTypes } from "@/pages/rooms/RoomTypes";
// import { RoomPromos } from "@/pages/rooms/RoomPromos";
// import { Rooms } from "@/pages/rooms/Rooms";

export const RoomRoutes = () => {
  return (
    <>
      <Route element={<DefaultLayout />}>
        {/* <Route path="/room-rates" index element={<RoomRates />} />
        <Route path="/room-promos" index element={<RoomPromos />} />
        <Route path="/room-types" element={<RoomTypes />} />
        <Route path="/rooms" element={<Rooms />} /> */}
      </Route>
    </>
  );
}
