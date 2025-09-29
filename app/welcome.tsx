import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import i18n from '../services/i18n';

export default function WelcomeScreen() {
    const router = useRouter();

    const handleGuestLogin = () => {
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Top Illustration Section */}
            <View style={styles.illustrationContainer}>
                <Image
                    source={require('../assets/images/welcome-illustration.png')}
                    style={styles.illustrationImage}
                    resizeMode="cover"
                />
                <View style={styles.chevronContainer}>
                    <Feather name="chevron-down" size={24} color="#FFFFFF" />
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                <Image
                    source={require('../assets/images/logo-heart.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>SaathiConnect</Text>

                <View style={styles.buttonGroup}>
                    {/* Google Sign-In Button (currently disabled) */}
                    <TouchableOpacity style={styles.btnGoogle} disabled>
                        <Image source={require('../assets/images/google-logo.png')} style={styles.googleLogo} />
                        <Text style={styles.btnGoogleText}>Sign in with Google</Text>
                        <View style={{ width: 24 }} />
                    </TouchableOpacity>
                    
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign In / Sign Up Buttons */}
                    <Link href="/login" asChild>
                        <TouchableOpacity style={styles.btnPrimary}>
                            <Text style={styles.btnPrimaryText}>Sign In</Text>
                            <Feather name="arrow-right" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </Link>
                    <Link href="/register" asChild>
                        <TouchableOpacity style={styles.btnSecondary}>
                            <Text style={styles.btnSecondaryText}>Sign Up</Text>
                            <Feather name="arrow-right" size={20} color="#E53935" />
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Guest Login Section */}
                <View style={styles.guestContainer}>
                     <Text style={styles.guestPrompt}>Don&apos;t want to show your identity?</Text>
                     <TouchableOpacity style={styles.btnGuest} onPress={handleGuestLogin}>
                        <Text style={styles.btnGuestText}>Guest Login</Text>
                        <Feather name="arrow-right" size={20} color="#FFFFFF" />
                     </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    illustrationContainer: {
        width: '100%',
        height: '25%',
        backgroundColor: '#212529',
    },
    illustrationImage: { width: '100%', height: '100%' },
    chevronContainer: {
        position: 'absolute',
        bottom: -18,
        alignSelf: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#212529',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logo: { width: 50, height: 50, marginTop: 40 },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E53935',
        marginTop: 8,
    },
    buttonGroup: {
        width: '100%',
        marginTop: 32,
    },
    btnGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    googleLogo: { width: 24, height: 24 },
    btnGoogleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 8,
        color: '#BDBDBD',
        fontWeight: '600',
    },
    btnPrimary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E53935',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    btnPrimaryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    btnSecondary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 24,
        borderWidth: 1.5,
        borderColor: '#E53935',
    },
    btnSecondaryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53935',
    },
    guestContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 86,
    },
    guestPrompt: {
        color: '#6C757D',
        marginBottom: 8,
    },
    btnGuest: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#212529',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 24,
        width: '100%',
    },
    btnGuestText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});