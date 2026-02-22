import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Sparkles, Eye, EyeOff } from 'lucide-react-native';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/auth';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
    const { signIn } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim() || !password) return;

        setError(null);
        setIsLoading(true);

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
            const res = await fetchApi(endpoint, {
                method: 'POST',
                body: JSON.stringify({ name: name.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else {
                await signIn(data.token, data.user.name);
            }
        } catch (e) {
            setError('Network error. Please try again.');
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
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Sparkles size={32} color="white" />
                        </View>
                        <Text style={styles.headerTitle}>Wardrobe AI</Text>
                        <Text style={styles.headerSubtitle}>Your personal AI stylist</Text>
                    </View>

                    {/* Card container */}
                    <View style={styles.card}>
                        {/* Tab Switcher */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabBtn, mode === 'login' && styles.tabActive]}
                                onPress={() => { setMode('login'); setError(null); }}
                            >
                                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Log In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabBtn, mode === 'signup' && styles.tabActive]}
                                onPress={() => { setMode('signup'); setError(null); }}
                            >
                                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Create Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your name"
                                placeholderTextColor="#64748b"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.inputPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="At least 4 characters"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, (isLoading || !name.trim() || !password) && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading || !name.trim() || !password}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[styles.submitText, (isLoading || !name.trim() || !password) && styles.submitTextDisabled]}>
                                    {mode === 'login' ? 'Log In' : 'Create Account'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#8b5cf6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#e2e8f0',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 6,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#8b5cf6',
    },
    tabText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        color: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    passwordContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputPassword: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        color: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        paddingRight: 50,
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    errorContainer: {
        backgroundColor: 'rgba(244,63,94,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(244,63,94,0.2)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#fb7185',
        fontSize: 13,
        textAlign: 'center',
    },
    submitBtn: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    submitText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    submitTextDisabled: {
        color: '#64748b',
    },
});
