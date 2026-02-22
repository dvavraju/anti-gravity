import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Outfit } from '../../../types/wardrobe';
import { Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface OutfitCardProps {
    outfitHistory: Outfit[];
    currentIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
    onAccept: () => void;
    isLoading?: boolean;
}

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export const OutfitCard: React.FC<OutfitCardProps> = ({
    outfitHistory,
    currentIndex,
    onNavigate,
    onAccept,
}) => {
    const currentOutfit = outfitHistory[currentIndex];
    const nextOutfit = outfitHistory[currentIndex + 1];

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const getLastWornText = (itemOutfit: Outfit) => {
        const wornDates = itemOutfit.items
            .filter((i) => i.lastWornDate)
            .map((i) => new Date(i.lastWornDate!).getTime());

        if (wornDates.length === 0) return 'Never worn before';
        const mostRecent = Math.max(...wornDates);
        const daysAgo = Math.floor((Date.now() - mostRecent) / (1000 * 60 * 60 * 24));
        if (daysAgo === 0) return 'Worn today';
        if (daysAgo === 1) return 'Yesterday';
        return `${daysAgo} days ago`;
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD && currentIndex > 0) {
                // Swipe Right -> Prev
                translateX.value = withSpring(width * 1.5, {}, () => {
                    runOnJS(onNavigate)('prev');
                    translateX.value = 0;
                    translateY.value = 0;
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swipe Left -> Next
                translateX.value = withSpring(-width * 1.5, {}, () => {
                    runOnJS(onNavigate)('next');
                    translateX.value = 0;
                    translateY.value = 0;
                });
            } else {
                // Reset
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const topCardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(translateX.value, [-width, width], [-10, 10]);
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, width],
            [0.96, 1],
            'clamp'
        );
        return {
            transform: [{ scale }],
        };
    });

    const renderOutfitItems = (outfit: Outfit) => {
        const items = [
            outfit.items.find((i) => i.category === 'top'),
            outfit.items.find((i) => i.category === 'bottom'),
            outfit.items.find((i) => i.category === 'shoes'),
        ].filter(Boolean);

        return (
            <View style={styles.itemsContainer}>
                {items.map((item, idx) => {
                    if (!item) return null;
                    const colorCode = idx === 0 ? '#818cf8' : idx === 1 ? '#34d399' : '#fb923c';
                    return (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemImageContainer}>
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.noImagePlaceholder}><Text style={styles.noImageText}>No Image</Text></View>
                                )}
                            </View>
                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemCategory, { color: colorCode }]}>{item.category}</Text>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                {item.color && (
                                    <View style={styles.colorWrapper}>
                                        <View style={[styles.colorSwatch, { backgroundColor: item.color.toLowerCase() }]} />
                                        <Text style={styles.colorText}>{item.color}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.cardsArea}>
                {/* Next Card (Background) */}
                {nextOutfit && (
                    <Animated.View style={[styles.card, styles.behindCard, nextCardStyle]}>
                        {renderOutfitItems(nextOutfit)}
                    </Animated.View>
                )}

                {/* Current Card (Foreground) */}
                {currentOutfit && (
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[styles.card, topCardStyle]}>
                            {renderOutfitItems(currentOutfit)}

                            {/* Footer inside top card */}
                            <View style={styles.cardFooter}>
                                <View style={styles.lastWornWrapper}>
                                    <Clock size={14} color="#64748b" />
                                    <Text style={styles.lastWornText}>{getLastWornText(currentOutfit)}</Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={[styles.smallBtn, currentIndex === 0 && styles.disabledBtn]}
                                        onPress={() => onNavigate('prev')}
                                        disabled={currentIndex === 0}
                                    >
                                        <ChevronLeft size={20} color="#e2e8f0" />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.mainBtn} onPress={onAccept}>
                                        <Check size={20} color="#ffffff" strokeWidth={3} style={{ marginRight: 8 }} />
                                        <Text style={styles.mainBtnText}>Wearing This</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.smallBtn} onPress={() => onNavigate('next')}>
                                        <ChevronRight size={20} color="#e2e8f0" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </GestureDetector>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    cardsArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#18181b', // dark bg
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
        overflow: 'hidden',
        flexDirection: 'column',
    },
    behindCard: {
        zIndex: -1,
        transform: [{ scale: 0.96 }, { translateY: 15 }],
        opacity: 0.8,
    },
    itemsContainer: {
        flex: 1,
        padding: 16,
        gap: 12,
    },
    itemRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    itemImageContainer: {
        width: '40%',
        backgroundColor: '#111118',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    noImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noImageText: {
        color: '#64748b',
        fontSize: 12,
    },
    itemDetails: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    itemCategory: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: 8,
    },
    colorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorSwatch: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    colorText: {
        fontSize: 12,
        color: '#94a3b8',
        textTransform: 'capitalize',
    },
    cardFooter: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    lastWornWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    lastWornText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    smallBtn: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    disabledBtn: {
        opacity: 0.3,
    },
    mainBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8b5cf6', // simplify gradient
        paddingVertical: 16,
        borderRadius: 12,
    },
    mainBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});
