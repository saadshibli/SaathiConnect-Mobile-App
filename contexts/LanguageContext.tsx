import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/i18n';

const LANGUAGE_KEY = 'user-language';

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => void;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
    return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState(i18n.locale);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLocale = await AsyncStorage.getItem(LANGUAGE_KEY);
                if (savedLocale) {
                    i18n.locale = savedLocale;
                    setLocaleState(savedLocale);
                }
            } catch (e) {
                console.error("Failed to load language", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadLanguage();
    }, []);

    const setLocale = async (newLocale: string) => {
        try {
            i18n.locale = newLocale;
            setLocaleState(newLocale);
            await AsyncStorage.setItem(LANGUAGE_KEY, newLocale);
        } catch (e) {
            console.error("Failed to save language", e);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
}