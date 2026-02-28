import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, ChevronDown, Sparkles } from 'lucide-react-native';
import { fetchApi } from '../lib/api';

const CATEGORIES = ['top', 'bottom', 'shoes'];
const OCCASIONS = ['casual', 'formal', 'sport', 'family', 'informal'];

export default function AddItemScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<string>('top');
    const [color, setColor] = useState('');
    const [occasion, setOccasion] = useState<string>('casual');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flowStatus, setFlowStatus] = useState<'initial' | 'picking' | 'analyzing' | 'review' | 'saving'>('initial');

    useEffect(() => {
        // Auto-trigger image selection on mount
        if (flowStatus === 'initial') {
            setFlowStatus('picking');
        }
    }, []);

    const handleImageSelected = async (uri: string) => {
        setImageUri(uri);
        setError(null);
        setIsAnalyzing(true);

        try {
            setFlowStatus('analyzing');
            // Convert to base64 immediately for analysis and storage
            const file = new FileSystem.File(uri);
            const base64 = await file.base64();
            const dataUri = `data:image/jpeg;base64,${base64}`;
            setImageBase64(dataUri);

            // Trigger AI Analysis
            const res = await fetchApi('/api/analyze-item', {
                method: 'POST',
                body: JSON.stringify({ imageUrl: dataUri }),
            });

            if (res.ok) {
                const { data } = await res.json();
                if (data) {
                    setName(data.name || '');
                    if (CATEGORIES.includes(data.category)) {
                        setCategory(data.category);
                    }
                    if (OCCASIONS.includes(data.occasion)) {
                        setOccasion(data.occasion);
                    }
                    setColor(data.color || '');
                }
            }
            setFlowStatus('review');
        } catch (e) {
            console.error('AI Analysis failed:', e);
            setFlowStatus('review'); // Still let them review/edit manually
        } finally {
            setIsAnalyzing(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // DISABLING CROP
            quality: 0.7, // Reduce quality slightly for faster base64 transfer
        });

        if (!result.canceled) {
            handleImageSelected(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // DISABLING CROP
            quality: 0.7,
        });

        if (!result.canceled) {
            handleImageSelected(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please provide a name for the item');
            return;
        }

        if (!imageBase64) {
            setError('Please provide an image of the item');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                name: name.trim(),
                category,
                color: color.trim().toLowerCase(),
                occasion,
                imageUrl: imageBase64,
            };

            const res = await fetchApi('/wardrobe', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add item');
            }

            // Success! Go back to wardrobe screen
            router.back();
        } catch (e: any) {
            setError(e.message || 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <X size={24} color="#e2e8f0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {flowStatus === 'review' ? 'Review Item' : 'Add New Item'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {flowStatus === 'picking' && (
                    <View style={styles.pickerFlowContainer}>
                        <View style={styles.pickerHeader}>
                            <Sparkles size={32} color="#8b5cf6" />
                            <Text style={styles.pickerTitle}>Add to Your Wardrobe</Text>
                            <Text style={styles.pickerSubtitle}>Take a photo or upload an image to start</Text>
                        </View>
                        <View style={styles.pickerButtons}>
                            <TouchableOpacity style={styles.heroActionBtn} onPress={takePhoto}>
                                <View style={[styles.iconCircle, { backgroundColor: '#8b5cf6' }]}>
                                    <Camera size={28} color="#FFF" />
                                </View>
                                <Text style={styles.heroActionText}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroActionBtn} onPress={pickImage}>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <ImageIcon size={28} color="#8b5cf6" />
                                </View>
                                <Text style={styles.heroActionText}>Upload Image</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {flowStatus === 'analyzing' && (
                    <View style={styles.analyzingFlowContainer}>
                        {imageUri && <Image source={{ uri: imageUri }} style={styles.analyzingGhostImage} />}
                        <View style={styles.analyzingFlowContent}>
                            <ActivityIndicator size="large" color="#8b5cf6" />
                            <View style={styles.analyzingBadgeLarge}>
                                <Sparkles size={20} color="#8b5cf6" style={{ marginRight: 8 }} />
                                <Text style={styles.analyzingTextLarge}>Gemini is analyzing...</Text>
                            </View>
                            <Text style={styles.analyzingSubtext}>Identifying category, color, and style</Text>
                        </View>
                    </View>
                )}

                {flowStatus === 'review' && (
                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Image Preview */}
                        <View style={styles.reviewImageSection}>
                            <Image source={{ uri: imageUri! }} style={styles.reviewImage} />
                            <TouchableOpacity
                                style={styles.changeImageBtn}
                                onPress={() => setFlowStatus('picking')}
                            >
                                <Camera size={16} color="#FFF" />
                                <Text style={styles.changeImageText}>Change</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Review Form */}
                        <View style={styles.reviewCard}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Item Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Denim Jacket"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.pillContainer}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.pill, category === cat && styles.pillActive]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Color</Text>
                                <TextInput
                                    style={styles.input}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="e.g. Blue"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Best Occasion</Text>
                                <View style={styles.pillContainer}>
                                    {OCCASIONS.map(occ => (
                                        <TouchableOpacity
                                            key={occ}
                                            style={[styles.pill, occasion === occ && styles.pillActive]}
                                            onPress={() => setOccasion(occ)}
                                        >
                                            <Text style={[styles.pillText, occasion === occ && styles.pillTextActive]}>
                                                {occ}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {flowStatus === 'review' && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitBtn, (isLoading || !name.trim()) && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[styles.submitText, (isLoading || !name.trim()) && styles.submitTextDisabled]}>
                                    Add to My Wardrobe
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    imageSection: {
        marginBottom: 24,
    },
    imagePlaceholder: {
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageActionBtn: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    imageActionText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    imagePreviewContainer: {
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        color: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    pickerWrapper: {
        display: 'none', // using pills instead for better UI
    },
    pickerText: {
        color: '#e2e8f0',
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pillActive: {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
    },
    pillText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    pillTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: 'rgba(244,63,94,0.1)',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    errorText: {
        color: '#fb7185',
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        backgroundColor: '#0a0a0f',
    },
    submitBtn: {
        backgroundColor: '#8b5cf6',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    submitTextDisabled: {
        color: '#64748b',
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10,10,15,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139,92,246,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.3)',
        marginTop: 12,
    },
    analyzingText: {
        color: '#e2e8f0',
        fontSize: 13,
        fontWeight: '600',
    },
    inputDisabled: {
        opacity: 0.5,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    pillDisabled: {
        opacity: 0.5,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    pickerFlowContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    pickerHeader: {
        alignItems: 'center',
        marginBottom: 60,
    },
    pickerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 20,
        textAlign: 'center',
    },
    pickerSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 10,
        textAlign: 'center',
    },
    pickerButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    heroActionBtn: {
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroActionText: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '600',
    },
    analyzingFlowContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingGhostImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.15,
        width: '100%',
        height: '100%',
    },
    analyzingFlowContent: {
        alignItems: 'center',
    },
    analyzingBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139,92,246,0.15)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.3)',
        marginTop: 24,
    },
    analyzingTextLarge: {
        color: '#e2e8f0',
        fontSize: 18,
        fontWeight: '700',
    },
    analyzingSubtext: {
        color: '#64748b',
        marginTop: 12,
        fontSize: 14,
    },
    reviewImageSection: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    reviewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    changeImageBtn: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    changeImageText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    reviewCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 20,
    },
});
