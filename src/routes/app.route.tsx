import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import { DashboardRoutes } from "./dashboard.route";
import { AuthRoutes } from "./auth.route";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRoutes />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard/*",
        element: <DashboardRoutes />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
