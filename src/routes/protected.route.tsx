import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useMe } from "@/features/auth/hooks/useMe";

export const ProtectedRoute = () => {
  const { data: user, isLoading } = useMe();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}