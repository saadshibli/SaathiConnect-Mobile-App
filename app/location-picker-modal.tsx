import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export default function LocationPickerModal() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const initialRegion: Region = {
        latitude: params.lat ? Number(params.lat) : 19.0760,
        longitude: params.lng ? Number(params.lng) : 72.8777,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    const [region, setRegion] = useState(initialRegion);

    const handleConfirm = async () => {
        try {
            // 🔧 Use Expo's on-device reverse geocoding
            const addresses = await Location.reverseGeocodeAsync({
                latitude: region.latitude,
                longitude: region.longitude,
            });
            const readableAddress = addresses[0] ? [addresses[0].street, addresses[0].city, addresses[0].postalCode].filter(Boolean).join(", ") : "Selected Location";

            await AsyncStorage.setItem("pickedLocation", JSON.stringify({
                latitude: region.latitude,
                longitude: region.longitude,
                address: readableAddress,
            }));
            router.back();
        } catch (error) {
            console.error("Reverse geocode failed:", error);
            Alert.alert("Error", "Could not get address for this location. Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                provider="google"
            />
            <View style={styles.markerFixed}>
                <Ionicons name="location" size={48} color="#E53935" />
            </View>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                    <Text style={styles.buttonText}>Confirm This Location</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    markerFixed: { position: "absolute", left: "50%", top: "50%", marginLeft: -24, marginTop: -48 },
    footer: { position: "absolute", bottom: 0, width: "100%", padding: 24, paddingBottom: 40, backgroundColor: "rgba(255, 255, 255, 0.9)" },
    button: { backgroundColor: "#007BFF", padding: 16, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});