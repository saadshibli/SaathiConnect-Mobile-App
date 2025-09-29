import React, {useEffect} from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomSplashScreen() {
    const router = useRouter();
    
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': require('../assets/fonts/ApproachMonoFont.otf'),
    });

    // This effect handles the navigation logic
    React.useEffect(() => {
        if (!fontsLoaded) return;

        const navigateUser = async () => {
            try {
                // Wait for the 3-second timer AND storage checks
                const [_, storedValues] = await Promise.all([
                    new Promise(resolve => setTimeout(resolve, 3000)),
                    Promise.all([
                        AsyncStorage.getItem('hasOnboarded'),
                        SecureStore.getItemAsync('accessToken')
                    ])
                ]);
                
                const hasOnboarded = storedValues[0];
                const accessToken = storedValues[1];

                if (accessToken) {
                    router.replace('/(tabs)');
                } else if (hasOnboarded) {
                    router.replace('/welcome');
                } else {
                    router.replace('/language');
                }
            } catch (error) {
                console.error('[Splash Screen] CRITICAL ERROR:', error);
                router.replace('/welcome'); // Navigate to a safe screen on error
            }
        };

        navigateUser();
    }, [fontsLoaded, router]);
    
    // 🔧 NEW: This separate effect handles hiding the native splash screen
    // once the custom splash screen is ready to be displayed.
    React.useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Keep returning null until fonts are loaded
    }

    // This is your custom UI that will now be visible
    return (
        <LinearGradient
            colors={['#FF416C', '#FF4B2B']}
            style={styles.container}
        >
            <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.appName}>SaathiConnect</Text>
            <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    appName: {
        fontSize: 32,
        color: '#FFF7E0',
        fontFamily: 'Poppins-Bold',
    },
    spinner: {
        marginTop: 40,
    }
});