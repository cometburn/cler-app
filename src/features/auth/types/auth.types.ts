export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    user: {
        id: number
        email: string
        name: string
        role: string
    }
}