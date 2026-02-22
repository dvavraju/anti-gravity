import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { WardrobeItem } from '../../types/wardrobe';

interface OccasionCardProps {
    title: string;
    image: any;
    color: string;
    gradientFrom: string;
    count: number;
    onPress: () => void;
    style?: any;
}

const OccasionCard: React.FC<OccasionCardProps> = ({ title, image, color, gradientFrom, count, onPress, style }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.card, { borderColor: `${color}35` }, style]}
        >
            <View style={[styles.gradientBg, { backgroundColor: `${gradientFrom}18` }]} />

            <View style={styles.badge}>
                <Text style={styles.badgeText}>{count || 0}</Text>
            </View>

            <Image source={image} style={styles.cardImage} resizeMode="contain" />

            <Text style={styles.cardTitle}>{title}</Text>
        </TouchableOpacity>
    );
};

interface OccasionGridProps {
    onSelectOccasion: (occasion: string) => void;
    wardrobeItems: WardrobeItem[];
}

export const OccasionGrid: React.FC<OccasionGridProps> = ({ onSelectOccasion, wardrobeItems }) => {
    const counts = React.useMemo(() => {
        const result: Record<string, number> = {};
        const occasionsList = ['formal', 'casual', 'family', 'sport', 'informal'];

        for (const occasion of occasionsList) {
            const occasionItems = wardrobeItems.filter(
                (item) => item.occasion?.toLowerCase() === occasion
            );
            const tops = occasionItems.filter((i) => i.category === 'top').length;
            const bottoms = occasionItems.filter((i) => i.category === 'bottom').length;
            const shoes = occasionItems.filter((i) => i.category === 'shoes').length;
            result[occasion] = tops * bottoms * shoes;
        }
        return result;
    }, [wardrobeItems]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Sparkles size={16} color="#fff" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>Style Studio</Text>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {/* Top Row: Formal (Left), Casual (Right) */}
                <View style={styles.row}>
                    <OccasionCard
                        title="Formal"
                        image={require('../../assets/3d/formal_new.png')}
                        color="#818cf8"
                        gradientFrom="#6366f1"
                        count={counts['formal'] || 0}
                        onPress={() => onSelectOccasion('formal')}
                        style={styles.flexHalf}
                    />
                    <OccasionCard
                        title="Casual"
                        image={require('../../assets/3d/casual_new.png')}
                        color="#34d399"
                        gradientFrom="#059669"
                        count={counts['casual'] || 0}
                        onPress={() => onSelectOccasion('casual')}
                        style={styles.flexHalf}
                    />
                </View>

                {/* Bottom Section: Family (Tall Left) and Sport/Informal (Stacked Right) */}
                <View style={styles.row}>
                    <OccasionCard
                        title="Family"
                        image={require('../../assets/3d/family_new.png')}
                        color="#fb7185"
                        gradientFrom="#e11d48"
                        count={counts['family'] || 0}
                        onPress={() => onSelectOccasion('family')}
                        style={[styles.flexHalf, styles.tallCard]}
                    />
                    <View style={[styles.flexHalf, styles.stackedRight]}>
                        <OccasionCard
                            title="Sport"
                            image={require('../../assets/3d/sport_new.png')}
                            color="#fb923c"
                            gradientFrom="#ea580c"
                            count={counts['sport'] || 0}
                            onPress={() => onSelectOccasion('sport')}
                            style={styles.standardHeight}
                        />
                        <OccasionCard
                            title="Informal"
                            image={require('../../assets/3d/informal_new.png')}
                            color="#c084fc"
                            gradientFrom="#7c3aed"
                            count={counts['informal'] || 0}
                            onPress={() => onSelectOccasion('informal')}
                            style={styles.standardHeight}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#6366f1', // fallback
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    grid: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    flexHalf: {
        flex: 1,
    },
    stackedRight: {
        gap: 16,
    },
    standardHeight: {
        height: 160,
    },
    tallCard: {
        height: 336, // 160 + 160 + 16 (gap)
    },
    card: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.02)',
        overflow: 'visible',
        position: 'relative',
        minHeight: 160,
    },
    gradientBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        opacity: 0.5,
    },
    badge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(23, 23, 30, 0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        zIndex: 5,
    },
    badgeText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
    },
    cardImage: {
        position: 'absolute',
        top: -20,
        right: -10,
        width: 110,
        height: 110,
        zIndex: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
        marginTop: 36,
        zIndex: 5,
    },
});
