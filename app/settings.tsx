import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: () => {
                auth?.signOut();
                router.replace('/welcome');
            }}
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#212529" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <View style={styles.menu}>
                <Link href="/change-password-modal" asChild>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="lock-closed-outline" size={22} color="#495057" />
                        <Text style={styles.menuItemText}>Change Password</Text>
                        <Ionicons name="chevron-forward" size={22} color="#CED4DA" />
                    </TouchableOpacity>
                </Link>
                {/* Add more settings items here in the future */}
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E9ECEF', backgroundColor: '#FFFFFF', flexDirection: 'row' },
    backButton: { position: 'absolute', left: 16, top: 16 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    menu: { marginTop: 24, marginHorizontal: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 12 },
    menuItemText: { flex: 1, marginLeft: 16, fontSize: 16 },
    logoutButton: { margin: 16, marginTop: 'auto', backgroundColor: '#FFF1F2', padding: 16, borderRadius: 8, alignItems: 'center' },
    logoutButtonText: { color: '#E53935', fontSize: 16, fontWeight: 'bold' },
});