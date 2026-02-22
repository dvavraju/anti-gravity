import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { setApiToken } from '../lib/api';

interface AuthContextType {
    token: string | null;
    userName: string | null;
    isLoading: boolean;
    signIn: (token: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useProtectedRoute(token: string | null, isAuthLoaded: boolean) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoaded) return;

        const inAuthGroup = segments[0] === 'login';

        if (!token && !inAuthGroup) {
            router.replace('/login');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [token, segments, isAuthLoaded]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadToken() {
            try {
                const storedToken = await SecureStore.getItemAsync('authToken');
                const storedName = await SecureStore.getItemAsync('authName');
                if (storedToken) {
                    setToken(storedToken);
                    setUserName(storedName);
                    setApiToken(storedToken);
                }
            } catch (e) {
                console.error("SecureStore load error", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadToken();
    }, []);

    useProtectedRoute(token, !isLoading);

    const signIn = async (newToken: string, name: string) => {
        setToken(newToken);
        setUserName(name);
        setApiToken(newToken);
        await SecureStore.setItemAsync('authToken', newToken);
        await SecureStore.setItemAsync('authName', name);
    };

    const signOut = async () => {
        setToken(null);
        setUserName(null);
        setApiToken(null);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('authName');
    };

    return (
        <AuthContext.Provider value={{ token, userName, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
