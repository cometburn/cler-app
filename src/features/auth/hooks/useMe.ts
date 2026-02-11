import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { User } from '@/shared/types/user.types'

export const useMe = () => {
    return useQuery<User | null, Error>({
        queryKey: ['me'],
        queryFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                return null
            }

            try {
                return await apiFetch<User>('/auth/me')
            } catch (err: any) {
                // Only return null on 401 (token refresh already handled in apiFetch)
                // The token has already been removed if refresh failed
                if (err?.status === 401) {
                    return null
                }
                // Re-throw other errors so React Query can handle retries
                throw err
            }
        },
        retry: (failureCount, error: any) => {
            // Don't retry on 401 (unauthorized) - token is already invalid
            if (error?.status === 401) {
                return false
            }
            // Retry up to 2 times for network errors, 500s, etc.
            return failureCount < 2
        },
        enabled: !!localStorage.getItem('token'),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent unnecessary refetches on tab focus
        refetchOnReconnect: true, // Refetch when internet reconnects
    })
}