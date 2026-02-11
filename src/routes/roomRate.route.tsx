import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomRatesPage } from "@/pages/room/RoomRatesPage";

export const RoomRateRoutes = () => {
    return (
        <Routes>
            <Route index element={<RoomRatesPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
