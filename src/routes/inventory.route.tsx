
import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { InventoryPage } from "@/pages/InventoryPage";

export const InventoryRoutes = () => {
    return (
        <Routes>
            <Route index element={<InventoryPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
