import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomTypesPage } from "@/pages/room/RoomTypesPage";

export const RoomTypeRoutes = () => {
  return (
    <Routes>
      <Route index element={<RoomTypesPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
