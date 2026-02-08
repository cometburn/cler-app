import { Route, Routes } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomRatesPage } from "@/pages/room/RoomRatesPage";

export const RoomRateRoutes = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route index element={<RoomRatesPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
