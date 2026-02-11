import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomPromosPage } from "@/pages/room/RoomPromosPage";

export const RoomPromoRoutes = () => {
  return (
    <Routes>
      <Route index element={<RoomPromosPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
