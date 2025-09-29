import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_FLAG_KEY = 'hasOnboarded';

export function useOnboardingStatus() {
    const [status, setStatus] = useState<'loading' | 'first_launch' | 'not_first_launch'>('loading');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const value = await AsyncStorage.getItem(ONBOARDING_FLAG_KEY);
                setStatus(value !== null ? 'not_first_launch' : 'first_launch');
            } catch (e) {
                console.error("Failed to check onboarding status:", e);
                setStatus('not_first_launch');
            }
        };
        checkStatus();
    }, []);

    const markAsOnboarded = useCallback(async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_FLAG_KEY, 'true');
            setStatus('not_first_launch');
        } catch (e) {
            console.error("Failed to mark as onboarded:", e);
        }
    }, []);

    return { status, markAsOnboarded };
}