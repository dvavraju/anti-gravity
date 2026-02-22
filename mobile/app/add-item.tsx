import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, ChevronDown } from 'lucide-react-native';
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please provide a name for the item');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // Normally, you would upload the image to a storage bucket (S3, Cloudinary, etc.)
            // and get a URL back. Since this relies on a specific backend implementation, 
            // if imageUri exists, we can base64 encode or we can just pass the string if the mock backend accepts it.
            // For now, let's pass it as imageUrl. Most simple backends will fail on massive base64 strings,
            // so we'll just send the string. If it fails, you might need a real upload endpoint.

            const payload = {
                name: name.trim(),
                category,
                color: color.trim().toLowerCase(),
                occasion,
                imageUrl: imageUri || undefined,
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
                                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
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
                        <Text style={styles.label}>Item Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Denim Jacket"
                            placeholderTextColor="#64748b"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pickerWrapper}>
                                <Text style={styles.pickerText}>{category}</Text>
                                <ChevronDown size={16} color="#64748b" />
                            </View>
                            {/* Simple inline selection for Category */}
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
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Color (Optional)</Text>
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

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                </ScrollView>

                {/* Submit Footer */}
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
});
