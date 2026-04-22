import { createHashRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected.route";
import { DashboardRoutes } from "./dashboard.route";
import { AuthRoutes } from "./auth.route";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomPromoRoutes } from "./roomPromo.route";
import { RoomTypeRoutes } from "./roomType.route";
import { RoomRateRoutes } from "./roomRate.route";
import { RoomRoutes } from "./room.route";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import { InventoryRoutes } from "./inventory.route";
import { ProductRoutes } from "./product.route";
import { ProductMovementRoutes } from "./productMovement.route";

export const router = createHashRouter([
  {
    path: "/",
    element: <AuthRoutes />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "dashboard/*",
            element: <DashboardRoutes />,
          },
          {
            path: "rooms/*",
            element: <RoomRoutes />,
          },
          {
            path: "room-promos/*",
            element: <RoomPromoRoutes />,
          },
          {
            path: "room-types/*",
            element: <RoomTypeRoutes />,
          },
          {
            path: "room-rates/*",
            element: <RoomRateRoutes />,
          },
          {
            path: "inventory/*",
            element: <InventoryRoutes />,
          },
          {
            path: "products/*",
            element: <ProductRoutes />,
          },
          {
            path: "product-movements/*",
            element: <ProductMovementRoutes />,
          },
        ]
      }
    ],
  },

  {
    path: "/*",
    element: <NotFoundPage />,
  },
]);
