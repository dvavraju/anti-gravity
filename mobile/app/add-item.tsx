import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
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

    const handleImageSelected = async (uri: string) => {
        setImageUri(uri);
        setError(null);
        setIsAnalyzing(true);

        try {
            // Convert to base64 immediately for analysis and storage
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
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
        } catch (e) {
            console.error('AI Analysis failed:', e);
            // We don't block the user if AI fails, they can still fill manually
        } finally {
            setIsAnalyzing(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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
                    <Text style={styles.headerTitle}>Add New Item</Text>
                    <View style={{ width: 40 }} /> {/* Spacer for centering */}
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Image Picker Area */}
                    <View style={styles.imageSection}>
                        {imageUri ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                {isAnalyzing && (
                                    <View style={styles.analyzingOverlay}>
                                        <ActivityIndicator color="#FFF" size="large" />
                                        <View style={styles.analyzingBadge}>
                                            <Sparkles size={14} color="#8b5cf6" style={{ marginRight: 6 }} />
                                            <Text style={styles.analyzingText}>Gemini is analyzing...</Text>
                                        </View>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setImageBase64(null); }} disabled={isAnalyzing}>
                                    <X size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <View style={styles.imageActions}>
                                    <TouchableOpacity style={styles.imageActionBtn} onPress={takePhoto}>
                                        <Camera size={24} color="#8b5cf6" />
                                        <Text style={styles.imageActionText}>Take Photo</Text>
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                    <TouchableOpacity style={styles.imageActionBtn} onPress={pickImage}>
                                        <ImageIcon size={24} color="#8b5cf6" />
                                        <Text style={styles.imageActionText}>Upload</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Item Name</Text>
                            {isAnalyzing && <ActivityIndicator size="small" color="#8b5cf6" />}
                        </View>
                        <TextInput
                            style={[styles.input, isAnalyzing && styles.inputDisabled]}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Denim Jacket"
                            placeholderTextColor="#64748b"
                            editable={!isAnalyzing}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pillContainer}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.pill, category === cat && styles.pillActive, isAnalyzing && styles.pillDisabled]}
                                        onPress={() => setCategory(cat)}
                                        disabled={isAnalyzing}
                                    >
                                        <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Color (Optional)</Text>
                        <TextInput
                            style={[styles.input, isAnalyzing && styles.inputDisabled]}
                            value={color}
                            onChangeText={setColor}
                            placeholder="e.g. Blue"
                            placeholderTextColor="#64748b"
                            editable={!isAnalyzing}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Best Occasion</Text>
                        <View style={styles.pillContainer}>
                            {OCCASIONS.map(occ => (
                                <TouchableOpacity
                                    key={occ}
                                    style={[styles.pill, occasion === occ && styles.pillActive, isAnalyzing && styles.pillDisabled]}
                                    onPress={() => setOccasion(occ)}
                                    disabled={isAnalyzing}
                                >
                                    <Text style={[styles.pillText, occasion === occ && styles.pillTextActive]}>
                                        {occ}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                </ScrollView>

                {/* Submit Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (isLoading || isAnalyzing || !name.trim()) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading || isAnalyzing || !name.trim()}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={[styles.submitText, (isLoading || isAnalyzing || !name.trim()) && styles.submitTextDisabled]}>
                                Save Item to Wardrobe
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
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
});
