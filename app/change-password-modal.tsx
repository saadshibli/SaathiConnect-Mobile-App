import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { changePassword } from '../api/user';

export default function ChangePasswordModal() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (newPassword !== confirmPassword) {
            return Alert.alert("Error", "New passwords do not match.");
        }
        setIsSubmitting(true);
        try {
            await changePassword({ currentPassword, newPassword });
            Alert.alert("Success", "Your password has been changed.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Could not change password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Change Password</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#212529" />
                </TouchableOpacity>
            </View>
            <View style={styles.form}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
                <Text style={styles.label}>New Password</Text>
                <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Password</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E9ECEF', backgroundColor: '#FFFFFF' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    closeButton: { position: 'absolute', right: 16, top: 16 },
    form: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    cameraIcon: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: '#E53935', padding: 8, borderRadius: 15, borderWidth: 2, borderColor: '#FFFFFF' },
    label: { fontSize: 14, fontWeight: '600', color: '#6C757D', marginBottom: 8 },
    input: { height: 50, backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#CED4DA' },
    saveButton: { backgroundColor: '#E53935', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});