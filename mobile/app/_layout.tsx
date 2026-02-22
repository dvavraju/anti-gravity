import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="add-item" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
        </AuthProvider>
    );
}
