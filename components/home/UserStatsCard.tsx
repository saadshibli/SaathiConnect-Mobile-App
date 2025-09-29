import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, Link } from "expo-router"; // Ensure Link is imported
import { useAuth } from "../../contexts/AuthContext";
import { getMyStats } from "../../api/gamification";

export interface UserStats {
  name: string;
  points: number;
  totalReports: number;
  resolvedReports: number;
  avatarUrl?: string;
}

export const UserStatsCard: React.FC = () => {
  const auth = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        if (auth?.session?.accessToken) {
          setIsLoading(true);
          try {
            const response = await getMyStats();
            setStats(response.data);
          } catch (error) {
            console.error("Failed to fetch user stats:", error);
            setStats(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
          setStats(null);
        }
      };
      fetchStats();
    }, [auth?.session?.accessToken])
  );

  // Guest mode specific render - this remains a standard card if user is not logged in
  if (!auth?.session?.accessToken) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestText}>Login to see your impact!</Text>
        <Link href="/welcome" asChild>
          <TouchableOpacity style={styles.guestLoginButton}>
            <Text style={styles.guestLoginButtonText}>Log In / Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (isLoading) {
    // Full width dark header during loading
    return (
      <View style={styles.loadingWrapper}>
        <View style={styles.topSectionFullWidth}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
        <View style={styles.bottomStatsCardLoading}>
          <ActivityIndicator color="#E53935" />
        </View>
      </View>
    );
  }

  if (!stats) return null; // Should ideally not happen if user is logged in and not loading

  return (
    <View style={styles.container}>
      {/* Top section: Full width dark background */}
      <View style={styles.topSectionFullWidth}>
        <View style={styles.greetingContent}>
          <Text style={styles.greeting}>Hello!</Text>
          {/* Ensure name text wraps gracefully */}
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {stats.name}
          </Text>
          <Text style={styles.motto}>Your voice matters!</Text>
        </View>
        <View style={styles.avatarContainer}>
          {stats.avatarUrl ? (
            <Image source={{ uri: stats.avatarUrl }} style={styles.avatar} />
          ) : (
            <Ionicons
              name="person-circle"
              size={80}
              color="rgba(255,255,255,0.6)"
            />
          )}
          {/* Abstract circles for background */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
      </View>

      {/* Bottom section: Floating stats card */}
      <View style={styles.bottomStatsCard}>
        <View style={styles.statsRow}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{stats.points} pts</Text>
            <Ionicons
              name="sparkles"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 5 }}
            />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Complaint</Text>
            <Text style={styles.statValue}>{stats.totalReports}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={styles.statValue}>{stats.resolvedReports}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // No explicit height or border for the overall container here,
    // it just holds the two distinct sections.
    backgroundColor: "transparent", // Background for the screen area
  },
  loadingWrapper: {
    height: 250, // Combined height during loading
    justifyContent: "center",
    alignItems: "center",
    // Redesigned hero: theme red background
    backgroundColor: "#263238",
  },

  // --- Top Full-Width Section (Dark Background) ---
  topSectionFullWidth: {
    // Theme primary 263238 hero background (redesign Option A)
    backgroundColor: "#263238",
    paddingHorizontal: 20,
    paddingTop: 50, // Adjusted padding for better look and to give space from safe area top
    paddingBottom: 70, // This pushes the dark background down to cover half of the floating card
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Vertically align items
    position: "relative",
    overflow: "hidden", // Contain circles
    minHeight: 180, // Minimum height to ensure space for floating card
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  greetingContent: {
    flex: 1, // Allows text to take available space
    marginRight: 10, // Space between text and avatar
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 2,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    flexShrink: 1, // Allow text to shrink if too long
  },
  motto: {
    // Softer light tone on red background
    color: "#FFE5E5",
    fontSize: 14,
  },

  // Avatar and abstract circles
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2, // Avatar on top of circles
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  circle1: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.15)",
    right: -40,
    top: -40,
    zIndex: 0,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -70,
    top: -70,
    zIndex: 0,
  },
  circle3: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    right: 10,
    bottom: 10,
    zIndex: 1,
  },

  // --- Bottom Floating Stats Card ---
  bottomStatsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: -50, // 🔧 This is the magic: Pull it up to overlap the top section
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10, // Ensure it floats above the dark background
    marginBottom: 6,
  },
  bottomStatsCardLoading: {
    backgroundColor: "transparent",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 12,
    height: 100, // Fixed height for loading state
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: "center",
  },
  pointsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  statItem: {
    alignItems: "center",
    flex: 1, // Distribute space evenly
  },
  statLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  notificationButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },

  // Guest mode specific styles (retained)
  guestContainer: {
    backgroundColor: "#F0F2F5",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 180, // A bit taller for guest message
  },
  guestText: {
    color: "#6C757D",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  guestLoginButton: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  guestLoginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
