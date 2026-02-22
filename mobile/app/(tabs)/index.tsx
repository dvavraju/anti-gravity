import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { OccasionGrid } from '../../components/home/OccasionGrid';
import { OutfitCard } from '../../components/wardrobe/OutfitCard';
import { WardrobeGrid } from '../../components/wardrobe/WardrobeGrid';
import { WardrobeItem, Outfit } from '../../types/wardrobe';
import { fetchApi, getApiToken } from '../../lib/api';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
    const [outfitHistory, setOutfitHistory] = useState<Outfit[]>([]);
    const [outfitIndex, setOutfitIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOutfit, setIsLoadingOutfit] = useState(false);

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

    useEffect(() => {
        fetchWardrobe();
    }, [fetchWardrobe]);

    const fetchRecommendation = async (occasion?: string, appendToHistory = true) => {
        setIsLoadingOutfit(true);
        try {
            const url = occasion ? `/recommendations?occasion=${occasion}` : '/recommendations';
            const res = await fetchApi(url);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            if (data.data) {
                setCurrentOutfit(data.data);
                if (appendToHistory) {
                    setOutfitHistory(prev => {
                        const newHistory = [...prev, data.data];
                        setOutfitIndex(newHistory.length - 1);
                        return newHistory;
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch recommendation:", error);
            setCurrentOutfit(null);
        } finally {
            setIsLoadingOutfit(false);
        }
    };

    const handleSelectOccasion = (occasion: string) => {
        setSelectedOccasion(occasion);
        setOutfitHistory([]);
        setOutfitIndex(0);
        fetchRecommendation(occasion);
    };

    const handleWearOutfit = async () => {
        if (!currentOutfit) return;
        setIsLoadingOutfit(true);
        try {
            await Promise.all(
                currentOutfit.items.map(item =>
                    fetchApi(`/wardrobe/${item.id}/wear`, { method: 'POST' })
                )
            );
            await fetchWardrobe();
            await fetchRecommendation(selectedOccasion || undefined);
        } catch (error) {
            console.error("Failed to log wear:", error);
            Alert.alert('Error', 'Could not log outfit wear.');
        } finally {
            setIsLoadingOutfit(false);
        }
    };

    const handleOutfitNavigate = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && outfitIndex > 0) {
            const newIndex = outfitIndex - 1;
            setOutfitIndex(newIndex);
            setCurrentOutfit(outfitHistory[newIndex]);
        } else if (direction === 'next') {
            if (outfitIndex < outfitHistory.length - 1) {
                const newIndex = outfitIndex + 1;
                setOutfitIndex(newIndex);
                setCurrentOutfit(outfitHistory[newIndex]);
            } else {
                fetchRecommendation(selectedOccasion || undefined);
            }
        }
    };

    const handleBackToHome = () => {
        setSelectedOccasion(null);
        setCurrentOutfit(null);
        setOutfitHistory([]);
        setOutfitIndex(0);
    };

    // 1. Outfit Selection View (Full Screen)
    if (selectedOccasion) {
        return (
            <SafeAreaView style={styles.fullscreenContainer}>
                {/* Header */}
                <View style={styles.outfitHeader}>
                    <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
                        <ArrowLeft size={18} color="#e2e8f0" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitleOccasion}>{selectedOccasion}</Text>
                        <Text style={styles.headerSubtitle}>Your perfect outfit</Text>
                    </View>
                    {outfitHistory.length > 0 && (
                        <View style={styles.headerCountBadge}>
                            <Text style={styles.headerCountText}>{outfitIndex + 1} / {outfitHistory.length}</Text>
                        </View>
                    )}
                </View>

                {/* Outfit Area */}
                <View style={styles.outfitArea}>
                    {currentOutfit ? (
                        <OutfitCard
                            outfitHistory={outfitHistory}
                            currentIndex={outfitIndex}
                            onNavigate={handleOutfitNavigate}
                            onAccept={handleWearOutfit}
                            isLoading={isLoadingOutfit}
                        />
                    ) : (
                        <View style={styles.centerStage}>
                            <View style={styles.emptyOutfitState}>
                                {isLoadingOutfit ? (
                                    <>
                                        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginBottom: 12 }} />
                                        <Text style={styles.emptyOutfitText}>Curating your look...</Text>
                                    </>
                                ) : (
                                    <Text style={styles.emptyOutfitText}>No {selectedOccasion} items in your wardrobe yet.</Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // 2. Main Dashboard View
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
            {/* Top Banner */}
            <View style={styles.bannerRow}>
                <View style={styles.bannerLeft}>
                    <View style={styles.bannerIcon}>
                        <Sparkles size={14} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.bannerSubtitle}>Wardrobe AI</Text>
                        <Text style={styles.bannerTitle}>Welcome</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Occasion Selection */}
                <OccasionGrid onSelectOccasion={handleSelectOccasion} wardrobeItems={wardrobeItems} />

                {/* Quick Preview Wardrobe */}
                <View style={styles.previewSection}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>My Wardrobe</Text>
                        <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/wardrobe')}>
                            <Text style={styles.viewAllText}>View All →</Text>
                        </TouchableOpacity>
                    </View>

                    {wardrobeItems.length > 0 ? (
                        <WardrobeGrid items={wardrobeItems.slice(0, 4)} />
                    ) : (
                        <View style={styles.emptyPreviewBox}>
                            <Text style={styles.emptyPreviewTitle}>Your wardrobe is empty</Text>
                            <Text style={styles.emptyPreviewSub}>Go to the Wardrobe tab to upload your first item!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    centerStage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(10,10,15,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    bannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bannerIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerSubtitle: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    bannerTitle: {
        fontSize: 14,
        color: '#e2e8f0',
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    previewSection: {
        marginTop: 24,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    viewAllBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    viewAllText: {
        color: '#a78bfa',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyPreviewBox: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    emptyPreviewTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#94a3b8',
        marginBottom: 4,
    },
    emptyPreviewSub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    // Outfit Screen Styles
    outfitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitleOccasion: {
        fontSize: 22,
        fontWeight: '700',
        textTransform: 'capitalize',
        color: '#e2e8f0',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2,
    },
    headerCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    headerCountText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    outfitArea: {
        flex: 1,
    },
    emptyOutfitState: {
        padding: 48,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    emptyOutfitText: {
        color: '#64748b',
        fontSize: 15,
    }
});
