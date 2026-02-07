import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth.api'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'
import { toast } from 'sonner'

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation<LoginResponse, Error, LoginCredentials>({
        mutationFn: login,

        onSuccess: (data) => {
            localStorage.setItem('token', data.accessToken)
            queryClient.setQueryData(['me'], data.user)
            toast.success('Logged in successfully!')
            navigate('/dashboard')
        },

        onError: (error) => {
            toast.error(error.message || 'Login failed. Please check your credentials.')
        },
        retry: false,
    })
}