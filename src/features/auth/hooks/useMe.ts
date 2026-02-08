import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { User } from '@/shared/types/user.types'

export function useMe() {
    return useQuery<User | null, Error>({
        queryKey: ['me'],
        queryFn: async () => {
            if (!localStorage.getItem('token')) {
                return null
            }

            try {
                return await apiFetch<User>('/auth/me')
            } catch (err) {
                localStorage.removeItem('token')
                return null
            }
        },
        retry: false,
        enabled: !!localStorage.getItem('token'),
    })
}