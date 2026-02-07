import { Routes, Route } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { DashboardPage } from "@/pages/DashboardPage";

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
