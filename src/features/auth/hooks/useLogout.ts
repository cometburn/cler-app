import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function useLogout() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return () => {
        localStorage.removeItem('token')
        queryClient.clear()           // clears all queries
        queryClient.setQueryData(['me'], null)
        navigate('/', { replace: true })
    }
}