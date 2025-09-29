import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect, useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile } from "../../api/user";
import { getMyReports } from "../../api/reports";
import ReportCard, { Report } from "../../components/ReportCard";
import ReportDetailModalComp from "../../components/report/ReportDetailModal";
import { Badge } from "../../components/profile/Badge";

interface UserProfile {
  name: string;
  points: number;
  avatarUrl?: string;
  badges: { name: string; earnedAt: string }[];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchData = useCallback(
    async (refresh = false) => {
      if (!auth?.session?.accessToken) {
        setProfile(null);
        setMyReports([]);
        setIsLoading(false);
        return;
      }
      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);
        const [profileRes, reportsRes] = await Promise.all([
          getMyProfile(),
          getMyReports(),
        ]);
        setProfile(profileRes.data);
        setMyReports(reportsRes.data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [auth?.session?.accessToken]
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [fetchData])
  );

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          auth?.signOut();
          router.replace("/welcome");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.heroPlaceholder} />
        <ActivityIndicator
          size="large"
          color="#E53935"
          style={styles.centered}
        />
      </SafeAreaView>
    );
  }

  // This "guard clause" handles the logged-out case AND the case where profile data failed to load.
  // This is why TypeScript knows 'profile' is not null in the code below.
  if (!auth?.session?.accessToken || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="log-in-outline" size={60} color="#ADB5BD" />
          <Text style={styles.infoText}>
            Please log in to view your profile and track your contributions.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/welcome")}
          >
            <Text style={styles.buttonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Main component render ---
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            colors={["#E53935"]}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroPattern1} />
          <View style={styles.heroPattern2} />
          <View style={styles.heroInner}>
            <View style={styles.avatarWrapper}>
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons
                  name="person-circle"
                  size={88}
                  color="rgba(255,255,255,0.85)"
                />
              )}
              <Link href="/edit-profile-modal" asChild>
                <TouchableOpacity style={styles.avatarEditButton}>
                  <Ionicons name="pencil" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </Link>
            </View>
            <Text style={styles.heroName} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.heroSubtitle}>
              Championing civic improvement
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{profile.points}</Text>
                <Text style={styles.heroStatLabel}>Points</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{myReports.length}</Text>
                <Text style={styles.heroStatLabel}>Reports</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {myReports.filter((r) => r.status === "Resolved").length}
                </Text>
                <Text style={styles.heroStatLabel}>Resolved</Text>
              </View>
            </View>
            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={handleLogout}
                accessibilityLabel="Logout"
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.surfaceSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Link href="/all-badges-modal" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {profile.badges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeRow}
            >
              {profile.badges.map((badge, index) => (
                <Badge key={index} name={badge.name} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>
              Earn badges by submitting & supporting reports.
            </Text>
          )}
        </View>

        <View style={styles.surfaceSection}>
          <Text style={styles.sectionTitle}>My Reports</Text>
          {myReports.length > 0 ? (
            myReports.map((report) => (
              <TouchableOpacity
                key={report._id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedReport(report);
                  setDetailVisible(true);
                }}
              >
                <ReportCard
                  report={report}
                  onVoteSuccess={() => fetchData(true)}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              You haven&apos;t submitted any reports yet.
            </Text>
          )}
          <ReportDetailModalComp
            reportId={selectedReport?._id || null}
            initialReport={selectedReport as any}
            visible={detailVisible}
            onClose={() => {
              setDetailVisible(false);
              setSelectedReport(null);
            }}
          />
        </View>

        <View style={styles.surfaceSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionList}>
            <Link href="/edit-profile-modal" asChild>
              <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="person-outline" size={20} color="#E53935" />
                <Text style={styles.actionText}>Edit Profile</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#ADB5BD"
                  style={styles.actionChevron}
                />
              </TouchableOpacity>
            </Link>
            <Link href="/change-password-modal" asChild>
              <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="key-outline" size={20} color="#E53935" />
                <Text style={styles.actionText}>Change Password</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#ADB5BD"
                  style={styles.actionChevron}
                />
              </TouchableOpacity>
            </Link>
            <Link href="/language" asChild>
              <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="language-outline" size={20} color="#E53935" />
                <Text style={styles.actionText}>Language</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#ADB5BD"
                  style={styles.actionChevron}
                />
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
              <Ionicons name="exit-outline" size={20} color="#E53935" />
              <Text style={styles.actionText}>Logout</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#ADB5BD"
                style={styles.actionChevron}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContainer: { paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heroPlaceholder: { height: 240, backgroundColor: "#263238" },
  hero: {
    backgroundColor: "#263238",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  heroPattern1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -60,
    right: -40,
  },
  heroPattern2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -20,
    left: -50,
  },
  heroInner: { position: "relative", alignItems: "center" },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    // Allow the edit button to overlap outside the avatar circle
    overflow: "visible",
    marginBottom: 12,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 48 },
  avatarEditButton: {
    position: "absolute",
    bottom: -6, // overlap outside the avatar
    right: -6,
    backgroundColor: "#E53935",
    padding: 8,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  heroName: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  heroSubtitle: {
    fontSize: 13,
    color: "#FFE5E5",
    marginTop: 4,
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 30,
  },
  heroStatItem: { alignItems: "center" },
  heroStatValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  heroStatLabel: { color: "#FFE5E5", fontSize: 12, marginTop: 2 },
  topRightActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  surfaceSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 8,
  },
  viewAllLink: { color: "#E53935", fontWeight: "600" },
  badgeRow: { paddingVertical: 4 },
  emptyText: { color: "#6C757D", fontSize: 14, marginTop: 4 },
  actionList: { marginTop: 4 },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E9ECEF",
  },
  actionText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#212529",
    fontWeight: "500",
    flex: 1,
  },
  actionChevron: { opacity: 0.6 },
  infoText: { color: "#6C757D", textAlign: "center", marginBottom: 20 },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold" },
});
