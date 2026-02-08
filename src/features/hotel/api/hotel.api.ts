
import { apiFetch } from '@/lib/api'
import { Hotel } from '@/shared/types/hotel.types';

const HOTEL_ENDPOINTS = {
    CREATE: '/hotels',
};

export const createHotel = async (data: Hotel): Promise<Hotel> => {
    return await apiFetch<Hotel>(HOTEL_ENDPOINTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}