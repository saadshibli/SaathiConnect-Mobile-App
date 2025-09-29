import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../api/auth';
import i18n from '../services/i18n';

export default function LoginScreen() {
    const router = useRouter();
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Information', 'Please fill in both email and password.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await loginUser(email, password);
            auth?.signIn(response.data.accessToken, response.data.refreshToken, response.data.user)
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{i18n.t('loginScreen.title')}</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                        <Text style={styles.buttonText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
                    </TouchableOpacity>

                    <Link href="/register" asChild>
                         <TouchableOpacity style={styles.linkButton}>
                             <Text style={styles.linkText}>Don&apos;t have an account? <Text style={{fontWeight: 'bold'}}>Sign Up</Text></Text>
                         </TouchableOpacity>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        backgroundColor: '#212529',
        padding: 24,
        paddingTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: { position: 'absolute', left: 16, top: 35 },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6C757D',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 50,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        backgroundColor: '#E53935',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: '#6C757D',
    },
});