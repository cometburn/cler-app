import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import { DashboardRoutes } from "./dashboard.route";
import { AuthRoutes } from "./auth.route";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomPromoRoutes } from "./roomPromo.route";
import { RoomTypeRoutes } from "./roomType.route";
import { RoomRateRoutes } from "./roomRate.route";

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
      {
        path: "/room-promos/*",
        element: <RoomPromoRoutes />,
      },
      {
        path: "/room-types/*",
        element: <RoomTypeRoutes />,
      },
      {
        path: "/room-rates/*",
        element: <RoomRateRoutes />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
