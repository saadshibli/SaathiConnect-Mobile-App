import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ImageInputProps {
    imageUri: string | null;
    isAnalyzing: boolean;
    isLoadingAI: boolean;
    onTakePhoto: () => void;
    onChooseFromLibrary: () => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ imageUri, isAnalyzing, isLoadingAI, onTakePhoto, onChooseFromLibrary }) => {
    return (
        // 🔧 FIX: Use the 'card' style for the container
        <View style={styles.card}>
            <Text style={styles.label}>PHOTO OF THE ISSUE</Text>
            {imageUri ? (
                <View>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    {isAnalyzing && (
                        <View style={styles.analyzingOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.analyzingText}>Analyzing image...</Text>
                        </View>
                    )}
                </View>
            ) : (
                isLoadingAI ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#E53935" />
                        <Text style={styles.loadingText}>Initializing AI Camera...</Text>
                    </View>
                ) : (
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={onTakePhoto}>
                            <Feather name="camera" size={24} color="#E53935" />
                            <Text style={styles.imagePickerButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={onChooseFromLibrary}>
                            <Feather name="image" size={24} color="#E53935" />
                            <Text style={styles.imagePickerButtonText}>Choose from Library</Text>
                        </TouchableOpacity>
                    </View>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // 🔧 FIX: Added all the necessary styles to this component's stylesheet
    card: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 2, 
        elevation: 2 
    },
    label: { fontSize: 12, fontWeight: 'bold', color: '#6C757D', marginBottom: 12, textTransform: "uppercase" },
    imagePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 120 },
    imagePickerButton: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', marginHorizontal: 6 },
    imagePickerButtonText: { marginTop: 8, color: '#E53935', fontWeight: '600' },
    imagePreview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#E9ECEF' },
    analyzingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12 },
    analyzingText: { color: '#FFFFFF', fontWeight: 'bold', marginTop: 8 },
    loadingContainer: { 
        height: 120, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    loadingText: { 
        marginTop: 8, 
        color: '#6C757D', 
        fontWeight: '500' 
    },
});