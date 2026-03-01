import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image } from 'react-native';
import { WardrobeGrid } from '../../components/wardrobe/WardrobeGrid';
import { WardrobeItem } from '../../types/wardrobe';
import { fetchApi } from '../../lib/api';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2, X, Tag, Palette, Briefcase } from 'lucide-react-native';

export default function WardrobeScreen() {
    const router = useRouter();
    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        setSelectedItem(item);
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;

        Alert.alert(
            "Delete Item",
            "Are you sure you want to permanently remove this item from your wardrobe?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            const res = await fetchApi(`/wardrobe/${selectedItem.id}`, {
                                method: 'DELETE'
                            });
                            if (res.ok) {
                                setSelectedItem(null);
                                fetchWardrobe();
                            } else {
                                Alert.alert("Error", "Failed to delete item.");
                            }
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", "An unexpected error occurred.");
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
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

            {/* Item Detail Modal */}
            <Modal
                visible={!!selectedItem}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSelectedItem(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Item Details</Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedItem(null)}
                                        style={styles.closeButton}
                                    >
                                        <X size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalImageContainer}>
                                        <Image
                                            source={{ uri: selectedItem.imageUrl }}
                                            style={styles.modalImage}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.detailName}>{selectedItem.name}</Text>

                                        <View style={{ gap: 12, flexDirection: 'column' }}>
                                            <View style={styles.detailRow}>
                                                <Tag size={16} color="#8b5cf6" />
                                                <Text style={styles.detailLabel}>Category:</Text>
                                                <Text style={styles.detailValue}>{selectedItem.category}</Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Palette size={16} color="#8b5cf6" />
                                                <Text style={styles.detailLabel}>Color:</Text>
                                                <View style={[styles.colorBubble, { backgroundColor: selectedItem.color?.toLowerCase() || '#ccc' }]} />
                                                <Text style={styles.detailValue}>{selectedItem.color}</Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Briefcase size={16} color="#8b5cf6" />
                                                <Text style={styles.detailLabel}>Occasion:</Text>
                                                <Text style={styles.detailValue}>{selectedItem.occasion}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={handleDeleteItem}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Trash2 size={18} color="#fff" />
                                                <Text style={styles.deleteButtonText}>Delete Item</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#18181b',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        maxHeight: '80%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    closeButton: {
        padding: 4,
    },
    modalImageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#0a0a0f',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        padding: 20,
        gap: 16,
    },
    detailName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#94a3b8',
        width: 80,
    },
    detailValue: {
        fontSize: 16,
        color: '#e2e8f0',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    colorBubble: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        margin: 20,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
