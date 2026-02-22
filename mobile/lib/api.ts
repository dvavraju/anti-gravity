import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const PORT = 3001;

export const API_URL = `http://${LOCALHOST}:${PORT}`;

let globalToken: string | null = null;

export const setApiToken = (token: string | null) => {
    globalToken = token;
};

export const getApiToken = () => globalToken;

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (globalToken) {
        headers['Authorization'] = `Bearer ${globalToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        return response;
    } catch (error) {
        console.error(`API Error on ${url}:`, error);
        throw error;
    }
};
