import { io } from "socket.io-client";

const SOCKET_BASE_URL = (import.meta as any).env.VITE_SOCKET_BASE_URL || "http://localhost:9001/api";

export const createSocket = () => {
    return io(SOCKET_BASE_URL, {
        autoConnect: false,
        auth: {
            token: localStorage.getItem('token')
        },
        withCredentials: true,
    });
};