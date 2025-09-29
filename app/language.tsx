import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons'; // We'll use this for the checkmark icon
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../services/i18n';

// Updated to match the text format in the design
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ml', name: 'മലയാളം (Malyalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'ur', name: 'اردو (Urdu)' }
];

export default function LanguageScreen() {
    const router = useRouter();
    const { markAsOnboarded } = useOnboardingStatus();
    const languageContext = useLanguage();
    const [selectedLang, setSelectedLang] = useState(languageContext?.locale || 'en');

    const handleSetLanguage = (langCode: string) => {
        i18n.locale = langCode;
        setSelectedLang(langCode);
        languageContext?.setLocale(langCode);
    };

    const handleContinue = () => {
        markAsOnboarded();
        router.replace('/welcome');
    };

    const renderLanguageItem = ({ item }: { item: typeof SUPPORTED_LANGUAGES[0] }) => {
        const isSelected = selectedLang === item.code;
        return (
            <TouchableOpacity style={styles.itemButton} onPress={() => handleSetLanguage(item.code)}>
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                    {item.name}
                </Text>
                {isSelected && <Feather name="check" size={24} color="#007BFF" />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{i18n.t('languageScreen.title')}</Text>
                <Text style={styles.subtitle}>{i18n.t('languageScreen.subtitle')}</Text>
            </View>

            <FlatList
                data={SUPPORTED_LANGUAGES}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.listContainer}
            />

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>{i18n.t('languageScreen.buttonContinue')}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // White background for the list area
    },
    header: {
        backgroundColor: '#212529', // Dark header background
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 16,
        color: '#E9ECEF', // Lighter text color for subtitle
        marginTop: 4,
    },
    listContainer: {
        paddingVertical: 16,
    },
    itemButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    itemText: {
        fontSize: 16,
        color: '#495057', // Standard text color
    },
    itemTextSelected: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF', // Blue color for selected text
    },
    continueButton: {
        position: 'absolute', // Makes the button float
        bottom: 40,
        right: 24,
        backgroundColor: '#E53935', // Bright red color
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30, // Makes it a pill shape
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});