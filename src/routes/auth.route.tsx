import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useMe } from '@/features/auth/hooks/useMe'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function ProtectedLayout() {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const AuthRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/users" element={<div>Users List</div>} />
        {/* ... other protected routes ... */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}