import { Platform } from 'react-native';

// Use deployed production URL
export const API_URL = 'https://wardrobe-api-production-9d77.up.railway.app';

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
