import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
// 🔧 1. Import the useSafeAreaInsets hook
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MapView, { Marker, Region, Heatmap } from "react-native-maps";
import { Link } from "expo-router"; // (Link kept for potential navigation reuse elsewhere)
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { getMapReports } from "../../api/reports";
import { Report } from "../../components/ReportCard";
import { MapCategoryFilter } from "../../components/explore/MapCategoryFilter";
import ReportDetailModal from "../../components/report/ReportDetailModal";

const INITIAL_REGION: Region = {
  latitude: 19.076, // Default to Mumbai
  longitude: 72.8777,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function ExploreScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"markers" | "heatmap">("markers");
  const [activeCategory, setActiveCategory] = useState("");
  const [currentRegion, setCurrentRegion] = useState<Region>(INITIAL_REGION);

  const mapRef = useRef<MapView>(null);
  const isInitialLoad = useRef(true);

  // 🔧 2. Get the safe area inset values
  const insets = useSafeAreaInsets();

  const fetchReportsForRegion = async (region: Region, category: string) => {
    setIsLoading(true);
    try {
      const bounds = {
        swLat: region.latitude - region.latitudeDelta / 2,
        swLng: region.longitude - region.longitudeDelta / 2,
        neLat: region.latitude + region.latitudeDelta / 2,
        neLng: region.longitude + region.longitudeDelta / 2,
        category: category,
      };
      const response = await getMapReports(bounds);
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch map reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUser = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location access is needed to center the map on you."
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current?.animateToRegion(userRegion, 1000);
    } catch (error) {
      console.error("Failed to get current location:", error);
      Alert.alert("Error", "Could not fetch your current location.");
    }
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      centerOnUser();
      isInitialLoad.current = false;
      return;
    }
    fetchReportsForRegion(currentRegion, activeCategory);
  }, [activeCategory, currentRegion]);

  const normalize = (v: string) => v.trim().toLowerCase();
  const filteredReports = reports.filter((r) => {
    if (!activeCategory) return true;
    return normalize(r.category) === normalize(activeCategory);
  });

  if (__DEV__) {
    if (activeCategory && filteredReports.length !== reports.length) {
      console.log(
        `Category '${activeCategory}': showing ${filteredReports.length} of ${reports.length} reports.`
      );
    } else if (activeCategory && filteredReports.length === reports.length) {
      console.warn(
        `Category '${activeCategory}' did NOT reduce report count. Check backend filtering or category value casing.`
      );
    }
  }

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedReport(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={(region) => {
          setCurrentRegion(region);
        }}
        showsUserLocation={true}
        provider="google"
      >
        {viewMode === "markers" &&
          filteredReports.map((report) => (
            <Marker
              key={report._id}
              coordinate={{
                latitude: report.location.coordinates[1],
                longitude: report.location.coordinates[0],
              }}
              pinColor="#E53935"
              onPress={() => openDetail(report)}
            />
          ))}

        {viewMode === "heatmap" && filteredReports.length > 0 && (
          <Heatmap
            points={filteredReports.map((r) => ({
              latitude: r.location.coordinates[1],
              longitude: r.location.coordinates[0],
            }))}
            radius={40}
            opacity={0.8}
          />
        )}
      </MapView>

      {/* 🔧 3. Apply the top inset to the controls container style */}
      <View style={[styles.controlsContainer, { top: insets.top }]}>
        <MapCategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </View>

      <View style={[styles.sideControls, { top: insets.top + 70 }]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() =>
            setViewMode(viewMode === "markers" ? "heatmap" : "markers")
          }
        >
          <Ionicons
            name={viewMode === "markers" ? "flame-outline" : "grid-outline"}
            size={24}
            color="#212529"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Ionicons name="locate-outline" size={24} color="#212529" />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color="#E53935" style={styles.loader} />
      )}

      <ReportDetailModal
        reportId={selectedReport?._id || null}
        initialReport={selectedReport}
        visible={detailVisible}
        onClose={closeDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  sideControls: {
    position: "absolute",
    right: 16,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  loader: { position: "absolute", bottom: 80, alignSelf: "center" },
  // Removed old callout styles (now using a modal)
});
