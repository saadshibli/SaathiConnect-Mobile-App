import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getAllBadges } from '../api/gamification';
import { getMyProfile } from '../api/user'; // We'll use this to get the latest user data
import { useAuth } from '../contexts/AuthContext';
import { FullBadge } from '../components/profile/FullBadge';

interface BadgeInfo {
    name: string;
    description: string;
    icon: any;
    color: string;
}

export default function AllBadgesModal() {
    const router = useRouter();
    const { session } = useAuth() || {};
    const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
    const [earnedBadges, setEarnedBadges] = useState(new Set<string>());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // We'll fetch the master list of all badges
                const allBadgesPromise = getAllBadges();
                
                // And we'll fetch the user's most up-to-date profile
                const myProfilePromise = session?.accessToken ? getMyProfile() : Promise.resolve(null);

                const [allBadgesRes, myProfileRes] = await Promise.all([allBadgesPromise, myProfilePromise]);

                setAllBadges(allBadgesRes.data);

                // 🔧 FIX: Use the fresh profile data from the API, not the stale context
                if (myProfileRes?.data?.badges) {
                    const earnedBadgeNames = new Set<string>(myProfileRes.data.badges.map((b: { name: string }) => b.name));
                    setEarnedBadges(earnedBadgeNames);
                }
            } catch (error) {
                console.error("Failed to fetch badges data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [session?.accessToken]);

    if (isLoading) {
        return <ActivityIndicator size="large" color="#E53935" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Achievements</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#212529" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.grid}>
                {allBadges.map((badge, index) => (
                    <FullBadge 
                        key={index} 
                        name={badge.name}
                        description={badge.description}
                        icon={badge.icon}
                        color={badge.color}
                        isEarned={earnedBadges.has(badge.name)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E9ECEF', backgroundColor: '#FFFFFF' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    closeButton: { position: 'absolute', right: 16, top: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
});