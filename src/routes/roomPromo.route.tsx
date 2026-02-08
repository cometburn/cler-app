import { Route, Routes } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomPromosPage } from "@/pages/room/RoomPromosPage";

export const RoomPromoRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<RoomPromosPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
