import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WardrobeItemCard } from './WardrobeItemCard';
import { WardrobeItem } from '../../../types/wardrobe';

interface WardrobeGridProps {
    items: WardrobeItem[];
    onItemClick?: (item: WardrobeItem) => void;
}

const { width } = Dimensions.get('window');
// Calculate roughly 2 columns with gaps
const CARD_WIDTH = (width - 48) / 2; // 2 cards, 16px padding on sides + 16px gap = 48

export const WardrobeGrid: React.FC<WardrobeGridProps> = ({ items, onItemClick }) => {
    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items in your wardrobe yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.gridContainer}>
            {items.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                    <WardrobeItemCard item={item} onPress={() => onItemClick?.(item)} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: CARD_WIDTH,
    },
});
