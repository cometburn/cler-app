
import { apiFetch } from '@/lib/api'
import { Hotel } from '@/shared/types/hotel.types';

const HOTEL_ENDPOINTS = {
    CREATE: '/hotels',
};

export async function createHotel(data: Hotel): Promise<Hotel> {
    return apiFetch<Hotel>(HOTEL_ENDPOINTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}