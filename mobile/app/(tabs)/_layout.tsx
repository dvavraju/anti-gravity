import { Tabs } from 'expo-router';
import { Home, Grid } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: '#0a0a0f',
                    borderTopColor: '#27272a',
                },
                tabBarActiveTintColor: '#8b5cf6',
                tabBarInactiveTintColor: '#94a3b8',
                headerStyle: {
                    backgroundColor: '#0a0a0f',
                },
                headerTintColor: '#fff',
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="wardrobe"
                options={{
                    title: 'Wardrobe',
                    tabBarIcon: ({ color, size }) => (
                        <Grid color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
