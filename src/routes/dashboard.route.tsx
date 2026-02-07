import { Routes, Route } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
