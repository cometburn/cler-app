import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/features/auth/hooks/useMe";

interface RoleProtectedRouteProps {
  allowed: number[]; // list of allowed user_type_ids
  redirectTo?: string; // optional redirect (default: /dashboard)
}

export default function RoleProtectedRoute({
  allowed,
  redirectTo = "/dashboard",
}: RoleProtectedRouteProps) {
  const { data: user } = useMe();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Restrict if user_type_id is not in allowed list
  if (user.user_type_id == null || !allowed.includes(user.user_type_id)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authorized → render children routes
  return <Outlet />;
}
