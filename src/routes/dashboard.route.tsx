import { Routes, Route } from "react-router-dom";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
