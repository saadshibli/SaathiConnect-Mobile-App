import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../api/auth';
import i18n from '../services/i18n';

export default function RegisterScreen() {
    const router = useRouter();
    const auth = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state
    const [agreedToTerms, setAgreedToTerms] = useState(false); // New state
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // New state for errors
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name) newErrors.name = "Name is required.";
        if (!email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";
        if (!password) newErrors.password = "Password is required.";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        if (!agreedToTerms) newErrors.terms = "You must agree to the terms.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await registerUser(name, email, password);
            if (auth && response.data.accessToken && response.data.user) {
                auth.signIn(response.data.accessToken, response.data.refreshToken, response.data.user);
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{i18n.t('registerScreen.title')}</Text>
                </View>
                <ScrollView contentContainerStyle={styles.formContainer}>
                    <Text style={styles.label}>FULL NAME</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        placeholderTextColor="#999"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    
                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
                    <TextInput
                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    
                    <View style={styles.termsContainer}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => setAgreedToTerms(!agreedToTerms)}>
                            {agreedToTerms && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <Text style={styles.termsText}>I agree to the Terms of Service.</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                        <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
                    </TouchableOpacity>
                    
                    <Link href="/login" asChild>
                         <TouchableOpacity style={styles.linkButton}>
                             <Text style={styles.linkText}>Already have an account? <Text style={{fontWeight: 'bold'}}>Sign In</Text></Text>
                         </TouchableOpacity>
                    </Link>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { backgroundColor: '#212529', padding: 24, paddingTop: 30, flexDirection: 'row', alignItems: 'center' },
    backButton: { position: 'absolute', left: 16, top: 35, zIndex: 1 },
    title: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    formContainer: { padding: 24, flexGrow: 1, justifyContent: 'center' },
    label: { fontSize: 12, fontWeight: 'bold', color: '#6C757D', marginBottom: 8, letterSpacing: 1 },
    input: { height: 50, backgroundColor: '#F8F9FA', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    inputError: { borderColor: '#E53935' },
    errorText: { color: '#E53935', fontSize: 12, marginTop: 4, marginBottom: 12 },
    termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 24 },
    checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#CED4DA', justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#E53935' },
    termsText: { color: '#6C757D' },
    button: { backgroundColor: '#E53935', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 24, alignItems: 'center' },
    linkText: { fontSize: 14, color: '#6C757D' },
});