import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { googleLogin } from '../api/auth.api'
import type { LoginResponse } from '../types/auth.types'
import { toast } from 'sonner'

export const useGoogleLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation<LoginResponse, Error, string>({
        mutationFn: (googleToken: string) => googleLogin(googleToken),

        onSuccess: (data) => {
            localStorage.setItem('token', data.accessToken)
            queryClient.setQueryData(['me'], data.user)
            toast.success('Logged in with Google successfully!')
            navigate('/dashboard')
        },

        onError: (error) => {
            toast.error(error.message || 'Google login failed. Please try again.')
        },

        retry: false,
    })
}