import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { WardrobeGrid } from '../../components/wardrobe/WardrobeGrid';
import { WardrobeItem } from '../../types/wardrobe';
import { fetchApi } from '../../lib/api';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';

export default function WardrobeScreen() {
    const router = useRouter();
    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWardrobe = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi('/wardrobe');
            const data = await res.json();
            if (data.data) {
                setWardrobeItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch wardrobe', error);
            Alert.alert('Error', 'Could not load wardrobe items.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchWardrobe();
        }, [fetchWardrobe])
    );

    const handleItemClick = (item: WardrobeItem) => {
        // We will hook this up to a detail modal next
        Alert.alert('Item Clicked', item.name);
    };

    if (isLoading && wardrobeItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerStage}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Wardrobe</Text>
                <View style={styles.badgeCount}>
                    <Text style={styles.badgeText}>{wardrobeItems.length} items</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <WardrobeGrid items={wardrobeItems} onItemClick={handleItemClick} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-item')}
                activeOpacity={0.8}
            >
                <Plus size={24} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    centerStage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    badgeCount: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 99,
    },
    badgeText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#94a3b8',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    }
});
