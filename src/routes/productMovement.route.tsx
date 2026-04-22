
import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProductMovementPage } from "@/pages/ProductMovementPage";

export const ProductMovementRoutes = () => {
    return (
        <Routes>
            <Route index element={<ProductMovementPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
