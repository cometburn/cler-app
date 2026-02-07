import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: () => apiFetch('/auth/me'),
        enabled: !!localStorage.getItem('token'),
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}