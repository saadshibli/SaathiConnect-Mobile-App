import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { UserStatsCard } from "../../components/home/UserStatsCard";
import ReportCard, { Report } from "../../components/ReportCard";
import ReportDetailModalComp from "../../components/report/ReportDetailModal";
import { getNearbyReports } from "../../api/reports";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { CategoryFilter } from "../../components/home/CategoryFilter";
import { DistanceSlider } from "../../components/home/DistanceSlider";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { session } = useAuth() || {};
  const { userLocation } = useLocation() || {};

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortMode, setSortMode] = useState<"distance" | "recent" | "popular">(
    "distance"
  );
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filterPanelAnim = useRef(new Animated.Value(0)).current;

  const toggleFilterPanel = () => {
    setIsFilterPanelVisible((prev) => {
      Animated.timing(filterPanelAnim, {
        toValue: !prev ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
      return !prev;
    });
  };

  const filterPanelHeight = filterPanelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });

  const fetchData = useCallback(
    async (refresh = false) => {
      if (!userLocation) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        const response = await getNearbyReports({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          maxDistance: distance * 1000,
          category: selectedCategory || "",
          sortBy: sortMode,
        });
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userLocation, selectedCategory, distance, sortMode]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (sortMode === "distance" || sortMode === "recent") fetchData();
  }, [sortMode, fetchData]);

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;
    const term = searchTerm.toLowerCase();
    return reports.filter(
      (r) =>
        (r.title || "").toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term)
    );
  }, [reports, searchTerm]);

  if (!session?.accessToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContent}>
          <Ionicons name="alert-circle-outline" size={60} color="#ADB5BD" />
          <Text style={styles.guestMessage}>
            Please log in to view community reports and your contributions.
          </Text>
          <Link href="/welcome" asChild>
            <TouchableOpacity style={styles.guestLoginButton}>
              <Text style={styles.guestLoginButtonText}>Log In / Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            colors={["#E53935"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <UserStatsCard />
        <View style={styles.stickyHeaderContainer}>
          <View style={styles.filterBar}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#6C757D" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reports..."
                placeholderTextColor="#6C757D"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <TouchableOpacity
              onPress={toggleFilterPanel}
              style={styles.filterButton}
            >
              <Ionicons name="options-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={[styles.filterPanel, { height: filterPanelHeight }]}
        >
          {isFilterPanelVisible && (
            <>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) =>
                  setSelectedCategory(cat === selectedCategory ? null : cat)
                }
              />
              <DistanceSlider distance={distance} onValueChange={setDistance} />
              <View style={styles.sortRow}>
                {(["distance", "recent", "popular"] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.sortChip,
                      sortMode === mode && styles.sortChipActive,
                    ]}
                    onPress={() => setSortMode(mode)}
                  >
                    <Text
                      style={[
                        styles.sortChipText,
                        sortMode === mode && styles.sortChipTextActive,
                      ]}
                    >
                      {mode === "distance"
                        ? "Nearby"
                        : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Animated.View>

        <View style={styles.reportsListContainer}>
          {isLoading && !isRefreshing ? (
            <ActivityIndicator
              size="large"
              color="#E53935"
              style={styles.loader}
            />
          ) : reports.length === 0 ? (
            <Text style={styles.noReportsText}>
              No reports found. Try expanding your search!
            </Text>
          ) : (
            filteredReports.map((report) => (
              <TouchableOpacity
                key={report._id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedReport(report);
                  setDetailVisible(true);
                }}
              >
                <ReportCard report={report} onVoteSuccess={() => {}} />
              </TouchableOpacity>
            ))
          )}
        </View>
        <ReportDetailModalComp
          reportId={selectedReport?._id || null}
          initialReport={selectedReport as any}
          visible={detailVisible}
          onClose={() => {
            setDetailVisible(false);
            setSelectedReport(null);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  stickyHeaderContainer: { backgroundColor: "#F8F9FA", paddingTop: 10 },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#212529", marginLeft: 8 },
  filterButton: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  filterPanel: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    overflow: "hidden",
  },
  sortRow: { flexDirection: "row", marginTop: 12, marginBottom: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#F1F3F5",
    marginRight: 10,
  },
  sortChipActive: { backgroundColor: "#E53935" },
  sortChipText: { fontSize: 14, color: "#495057", fontWeight: "500" },
  sortChipTextActive: { color: "#FFFFFF", fontWeight: "600" },
  reportsListContainer: { paddingHorizontal: 16, marginTop: 10 },
  loader: { marginVertical: 40 },
  noReportsText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#6C757D",
  },
  guestContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guestMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#6C757D",
    marginTop: 15,
  },
  guestLoginButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  guestLoginButtonText: { color: "#FFFFFF", fontWeight: "bold" },
});
