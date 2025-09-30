import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../contexts/AuthContext";
import { useReportAI } from "../hooks/useReportAI";
import { submitReport, submitAnonymousReport } from "../api/reports";
import { ImageInput } from "../components/report/ImageInput";

const CATEGORIES = [
  { key: "Pothole", icon: "car-outline" },
  { key: "Garbage", icon: "trash-outline" },
  { key: "Streetlight", icon: "bulb-outline" },
  { key: "Other", icon: "ellipsis-horizontal" },
];

const MUMBAI_INITIAL_REGION: Region = {
  latitude: 19.076,
  longitude: 72.8777,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function ReportModal() {
  const router = useRouter();
  const auth = useAuth();
  const { isModelLoading, analyzeImage } = useReportAI();

  // State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(MUMBAI_INITIAL_REGION);

  const mapRef = useRef<MapView>(null);

  const [photoExif, setPhotoExif] = useState<ImagePicker.ImagePickerAsset['exif'] | null>(null);
  const [locationAuthenticity, setLocationAuthenticity] = useState<string | null>(null);
  const [photoCaptureLocation, setPhotoCaptureLocation] = useState<Location.LocationObject | null>(null);
  // Effect to check for a location picked from the full-screen map modal
  useFocusEffect(
    React.useCallback(() => {
      const checkPickedLocation = async () => {
        const raw = await AsyncStorage.getItem("pickedLocation");
        if (!raw) return;

        await AsyncStorage.removeItem("pickedLocation");
        try {
          const data = JSON.parse(raw) as {
            latitude: number;
            longitude: number;
            address: string;
          };
          if (data?.latitude && data?.longitude) {
            const newLocation: Location.LocationObject = {
              coords: {
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            };
            updateLocationState(newLocation, data.address);
          }
        } catch (e) {
          console.error("Failed to parse picked location:", e);
        }
      };
      checkPickedLocation();
    }, [])
  );

  // Central function to keep location, address, and map in sync

const updateLocationState = (
  newLocation: Location.LocationObject,
  newAddress: string
) => {
  setLocation(newLocation);
  setAddress(newAddress);
  const newRegion: Region = {
    latitude: newLocation.coords.latitude,
    longitude: newLocation.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  setMapRegion(newRegion);
  // This command imperatively moves the map to the new region.
  mapRef.current?.animateToRegion(newRegion, 1000);
};

  const handleFetchLocation = async () => {
    setIsFetchingAddress(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location access is needed to auto-detect the address."
      );
      setIsFetchingAddress(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const addresses = await Location.reverseGeocodeAsync(
        currentLocation.coords
      );
      const readableAddress = addresses[0]
        ? [addresses[0].street, addresses[0].city, addresses[0].postalCode]
            .filter(Boolean)
            .join(", ")
        : "Current Location";
      updateLocationState(currentLocation, readableAddress);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch current location.");
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const handleAddressSubmit = async (textToGeocode: string) => {
    if (textToGeocode.length < 5) return;
    Keyboard.dismiss();
    setIsFetchingAddress(true);
    try {
      const locations = await Location.geocodeAsync(textToGeocode);
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0];
        const newLocation: Location.LocationObject = {
          coords: {
            latitude,
            longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        updateLocationState(newLocation, textToGeocode);
      } else {
        Alert.alert("Not Found", "Could not find a location for that address.");
      }
    } catch {
      Alert.alert("Error", "An error occurred while searching.");
    } finally {
      setIsFetchingAddress(false);
    }
  };

const runAuthenticityCheck = (claimedLocation: Location.LocationObject, exifData: ImagePicker.ImagePickerAsset['exif']) => {
  if (!exifData || !exifData.GPSLatitude || !exifData.GPSLongitude) {
    // If there's no GPS data in the photo, it's unverified.
    setLocationAuthenticity('NO_EXIF_DATA');
    return;
  }

  const photoCoords = {
    latitude: exifData.GPSLatitude,
    longitude: exifData.GPSLongitude,
  };

  const claimedCoords = claimedLocation.coords;

  const distance = Math.sqrt(
    Math.pow(claimedCoords.latitude - photoCoords.latitude, 2) +
    Math.pow(claimedCoords.longitude - photoCoords.longitude, 2)
  ) * 111320;

  if (distance < 200) { // If claimed location is within 200m of photo's actual location
    setLocationAuthenticity('VERIFIED_IN_APP');
  } else {
    setLocationAuthenticity('LOCATION_MISMATCH');
  }
};

const handleTakePhoto = async () => {
  try {
    // We launch both async operations at the same time.
    // The camera will appear instantly to the user.
    // The location request runs in the background while the user is aiming.
    const [locationResult, cameraResult] = await Promise.all([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.7,
      })
    ]);

    // If the user cancels the camera, we don't do anything.
    if (cameraResult.canceled) {
      return;
    }

    // If both were successful, we now have both the image and the location.
    if (cameraResult.assets?.[0] && locationResult) {
      setImageUri(cameraResult.assets[0].uri);
      setPhotoCaptureLocation(locationResult);
      setLocationAuthenticity(null); // Reset UI for the new photo

      // Run AI Analysis
      setIsAnalyzing(true);
      analyzeImage(cameraResult.assets[0].uri).then(predictedCategory => {
        if (predictedCategory) setCategory(predictedCategory);
        setIsAnalyzing(false);
      });
    }
  } catch (error) {
    console.warn("Error during photo capture or location fetch:", error);
    Alert.alert("Error", "Could not capture photo or location. Please ensure permissions are granted and GPS is on.");
  }
};

const handleChooseFromLibrary = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.7,
  });

  if (!res.canceled && res.assets?.[0]) {
    // For gallery photos, there's no live location to verify.
    setImageUri(res.assets[0].uri);
    setPhotoCaptureLocation(null); // Explicitly set to null
    setLocationAuthenticity('GALLERY_UPLOAD'); // Set status immediately

    // Run AI analysis
    setIsAnalyzing(true);
    analyzeImage(res.assets[0].uri).then(predictedCategory => {
      if (predictedCategory) setCategory(predictedCategory);
      setIsAnalyzing(false);
    });
  }
};

  const handleStartVoiceRecognition = () => {
    Alert.alert(
      "Feature Coming Soon",
      "Voice-to-text will be added in a future update."
    );
  };

const handleSubmit = async () => {
  if (!imageUri || !description || !category || !location) {
    Alert.alert("Incomplete Report", "Please fill all fields: photo, description, category, and location.");
    return;
  }
  setIsSubmitting(true);

  // --- START NEW AUTHENTICITY CHECK ---
  let finalAuthenticityStatus = 'NOT_AVAILABLE';

  if (photoCaptureLocation) { // If we have a live location from the camera
    const photoCoords = photoCaptureLocation.coords;
    const claimedCoords = location.coords;

    const distance = Math.sqrt(
      Math.pow(claimedCoords.latitude - photoCoords.latitude, 2) +
      Math.pow(claimedCoords.longitude - photoCoords.longitude, 2)
    ) * 111320;

    if (distance < 200) {
      finalAuthenticityStatus = 'VERIFIED_IN_APP';
    } else {
      finalAuthenticityStatus = 'LOCATION_MISMATCH';
    }
  } else {
    // If photoCaptureLocation is null, it must be from the gallery
    finalAuthenticityStatus = 'GALLERY_UPLOAD';
  }
  // --- END NEW AUTHENTICITY CHECK ---
  
  // The rest of the function remains the same...
  const netState = await NetInfo.fetch();
  if (netState.isConnected) {
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("category", category);
      formData.append("latitude", String(location.coords.latitude));
      formData.append("longitude", String(location.coords.longitude));
      formData.append("address", address);
      formData.append("locationAuthenticity", finalAuthenticityStatus);
      formData.append("image", {
        uri: imageUri,
        name: `report_${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      if (auth?.session?.accessToken) {
        await submitReport(formData);
      } else {
        await submitAnonymousReport(formData);
      }
      Alert.alert("Success", "Your report has been submitted. Thank you!");
      router.back();
    } catch (error) {
      console.error("Submission failed:", error);
      Alert.alert("Submission Failed", "Could not submit your report. Please try again.");
    }
  } else {
    // Offline logic
  }
  setIsSubmitting(false);
};

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close-circle" size={28} color="#CED4DA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ImageInput
          imageUri={imageUri}
          isAnalyzing={isAnalyzing}
          isLoadingAI={isModelLoading}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
        />

        <View style={styles.card}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <View>
            <TextInput
              style={styles.textInputLarge}
              placeholder="Provide a brief description of the issue..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleStartVoiceRecognition}
            >
              <Ionicons name="mic-outline" size={24} color="#495057" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.categoryButton,
                  category === item.key && styles.categoryButtonSelected,
                ]}
                onPress={() => setCategory(item.key)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={category === item.key ? "#FFFFFF" : "#E53935"}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === item.key && styles.categoryTextSelected,
                  ]}
                >
                  {item.key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ADDRESS / LOCATION</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type address and press enter to search"
              value={address}
              onChangeText={setAddress}
              onSubmitEditing={() => handleAddressSubmit(address)}
            />
            <TouchableOpacity
              onPress={handleFetchLocation}
              style={styles.locationButton}
              accessibilityLabel="Get current location"
            >
              {isFetchingAddress ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : (
                <Ionicons
                  name="navigate-circle-outline"
                  size={24}
                  color="#E53935"
                />
              )}
            </TouchableOpacity>
          </View>

          <Link
            href={{
              pathname: "/location-picker-modal",
              params: {
                lat: String(mapRegion.latitude),
                lng: String(mapRegion.longitude),
              },
            }}
            asChild
          >
            <TouchableOpacity>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                {location && <Marker coordinate={location.coords} />}
              </MapView>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#212529" },
  closeButton: { position: "absolute", right: 16 },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6C757D",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  textInputLarge: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    paddingRight: 50,
    paddingBottom: 40,
    borderRadius: 8,
    fontSize: 16,
    borderColor: "#CED4DA",
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: "top",
  },
  micButton: { position: "absolute", bottom: 12, right: 12 },
  categoryContainer: { flexDirection: "row", justifyContent: "space-around" },
  categoryButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginHorizontal: 6,
    minHeight: 90,
  },
  categoryButtonSelected: {
    backgroundColor: "#212529",
    borderColor: "#212529",
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
  },
  categoryTextSelected: { color: "#FFFFFF" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#CED4DA",
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  locationButton: { paddingHorizontal: 12 },
  map: {
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CED4DA",
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: "#E53935",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  // badgeBase: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderRadius: 20,
  //   paddingVertical: 6,
  //   paddingHorizontal: 10,
  //   alignSelf: 'flex-start',
  //   marginBottom: 10,
  // },
  // badgeTextBase: {
  //   marginLeft: 6,
  //   fontSize: 12,
  //   fontWeight: 'bold',
  // },
  // // Verified (Green)
  // badgeVerified: { backgroundColor: '#E6F4EA' },
  // textVerified: { color: '#198754' },
  // // Unverified (Yellow)
  // badgeUnverified: { backgroundColor: '#FFFBEA' },
  // textUnverified: { color: '#B58900' },
  // // Mismatch (Red)
  // badgeMismatch: { backgroundColor: '#F8D7DA' },
  // textMismatch: { color: '#DC3545' },
});




