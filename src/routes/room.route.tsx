
import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoomPage } from "@/pages/room/RoomPage";

export const RoomRoutes = () => {
    return (
        <Routes>
            <Route index element={<RoomPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
