import { Route, Routes } from "react-router-dom";
import { LoginPage } from '@/pages/LoginPage'
import { useMe } from '@/features/auth/hooks/useMe'
import { Navigate } from 'react-router-dom'

export const AuthRoutes = () => {
  const { data: user } = useMe()

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route path="/" element={<LoginPage />} />
    </Routes>
  )
}