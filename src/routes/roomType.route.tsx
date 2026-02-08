import { Route, Routes } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomTypesPage } from "@/pages/room/RoomTypesPage";

export const RoomTypeRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<RoomTypesPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
