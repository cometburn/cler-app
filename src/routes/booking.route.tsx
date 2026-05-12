import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { BookingPage } from "@/pages/BookingPage";

export const BookingRoutes = () => {
    return (
        <Routes>
            <Route index element={<BookingPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
