import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../api/user';

export default function EditProfileModal() {
    const router = useRouter();
    const { session, signIn } = useAuth() || {};
    
    const [name, setName] = useState(session?.user?.name || '');
    // 🔧 FIX: Correctly access avatarUrl from the updated user type
    const [avatarUri, setAvatarUri] = useState(session?.user?.avatarUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChooseAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (avatarUri && avatarUri.startsWith('file://')) {
                formData.append('avatar', {
                    uri: avatarUri,
                    name: `avatar_${session?.user?.id}.jpg`,
                    type: 'image/jpeg',
                } as any);
            }
            const response = await updateUserProfile(formData);
            
            // 🔧 FIX: Add safety checks before calling signIn
            if (session?.accessToken && session?.refreshToken && signIn) {
                signIn(session.accessToken, session.refreshToken, response.data);
            }
            
            Alert.alert("Success", "Your profile has been updated.");
            router.back();
        } catch (error) {
            console.error("Failed to update profile:", error);
            Alert.alert("Error", "Could not update your profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#212529" />
                </TouchableOpacity>
            </View>
            <View style={styles.form}>
                <TouchableOpacity onPress={handleChooseAvatar} style={styles.avatarContainer}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle" size={100} color="#CED4DA" />
                    )}
                    <View style={styles.cameraIcon}>
                        <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
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