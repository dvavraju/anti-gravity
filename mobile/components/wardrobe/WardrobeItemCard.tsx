import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { WardrobeItem } from '../../../types/wardrobe';

interface WardrobeItemCardProps {
    item: WardrobeItem;
    onPress?: () => void;
    style?: any;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({ item, onPress, style }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.card, style]}
        >
            <View style={styles.imageContainer}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>{item.category}</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.meta}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.wearCount}>
                        {item.wearCount > 0 ? `${item.wearCount}× worn` : 'New'}
                    </Text>
                </View>
            </View>

            {item.wearCount === 0 && (
                <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        position: 'relative',
    },
    imageContainer: {
        aspectRatio: 3 / 4,
        backgroundColor: '#111118',
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    content: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.04)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    title: {
        fontWeight: '600',
        fontSize: 14,
        color: '#e2e8f0',
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    categoryBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.15)',
    },
    categoryText: {
        color: '#a78bfa',
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    wearCount: {
        color: '#94a3b8',
        fontSize: 12,
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#6366f1', // simple solid fallback for linear-gradient
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 99,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 4,
    },
    newBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
