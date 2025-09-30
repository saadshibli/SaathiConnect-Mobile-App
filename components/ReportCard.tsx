import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { upvoteReportApi } from "../api/reports";

// export interface HistoryEntry { /* ... */ }

// export interface FullReport extends Report { /* ... */ }

export interface Report {
  location: any;
  _id: string;
  imageUrl: string;
  category: string;
  status: string;
  description: string;
  title?: string; // optional short title (used in search & list)
  createdAt?: string; // ISO date string (used for recent sorting)
  upvotes: number;
  upvotedBy: string[];
  distance?: number;
  address?: { street?: string; city?: string };
  locationAuthenticity?: string;
}

interface ReportCardProps {
  report: Report;
  onVoteSuccess: () => void;
}


const AuthenticityBadge = ({ status }: { status?: string }) => {
  if (!status || status === 'NOT_AVAILABLE' || status === 'CHECK_FAILED') {
    return null; // Don't show a badge for these statuses
  }

  const isVerified = status === 'VERIFIED_IN_APP';
  const isMismatch = status === 'LOCATION_MISMATCH';
  
  // --- Start of New Logic ---
  const badgeStyle = isVerified ? styles.badgeVerified : isMismatch ? styles.badgeMismatch : styles.badgeUnverified;
  const textStyle = isVerified ? styles.textVerified : isMismatch ? styles.textMismatch : styles.textUnverified;

  // Use a 'location' icon for verified/unverified, and a 'close' icon for mismatch
  const iconName = isMismatch ? 'close-circle-outline' : 'location-outline';
  
  const text = isVerified ? 'Verified' : isMismatch ? 'Mismatch' : 'Unverified';
  // --- End of New Logic ---

  return (
    <View style={[styles.badgeBase, badgeStyle]}>
      <Ionicons name={iconName} size={12} color={textStyle.color} />
      <Text style={[styles.badgeTextBase, textStyle]}>{text}</Text>
    </View>
  );
};
// Helper function to format the distance nicely
const formatDistance = (meters?: number): string => {
  if (meters === undefined || meters === null) return "";
  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
};

export default function ReportCard({ report, onVoteSuccess }: ReportCardProps) {
  const auth = useAuth();
  const userId = auth?.session?.user?.id;

  const [currentUpvotes, setCurrentUpvotes] = useState(report.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isProcessingVote, setIsProcessingVote] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (userId && report.upvotedBy?.includes(userId)) {
      setIsUpvoted(true);
    } else {
      setIsUpvoted(false);
    }
  }, [userId, report.upvotedBy]);

  const handleUpvote = async () => {
    if (!userId) {
      return Alert.alert(
        "Login Required",
        "You must be logged in to upvote reports."
      );
    }
    if (isUpvoted || isProcessingVote) return;

    setIsProcessingVote(true);
    setCurrentUpvotes((prev) => prev + 1);
    setIsUpvoted(true);

    // Trigger scale bounce animation
    scaleAnim.setValue(0.85);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.back(1.8)),
      useNativeDriver: true,
    }).start();

    try {
      await upvoteReportApi(report._id);
      onVoteSuccess(); // Tell the parent screen to refresh stats
    } catch (error: any) {
      setCurrentUpvotes((prev) => prev - 1);
      setIsUpvoted(false);
      const errorMessage =
        error.response?.data?.message || "An error occurred.";
      Alert.alert("Upvote Failed", errorMessage);
    } finally {
      setIsProcessingVote(false);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "Resolved") {
      return {
        badge: styles.statusBadgeResolved,
        text: styles.statusTextResolved,
      };
    }
    if (status.startsWith("Assigned") || status === "InProgress") {
      return {
        badge: styles.statusBadgeInProgress,
        text: styles.statusTextInProgress,
      };
    }
    // Default case
    return { badge: styles.statusBadgePending, text: styles.statusTextPending };
  };
  const statusStyle = getStatusStyle(report.status);

  return (
    <View style={styles.card}>
      <Link href={`/report/${report._id}`} asChild>
        <TouchableOpacity activeOpacity={0.85}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: report.imageUrl }}
              style={styles.image}
              contentFit="cover"
            />
            <View style={styles.gradientOverlay} />
            <View style={styles.topChipsRow}>
              <View style={styles.categoryChip}>
                <Ionicons name="pricetag-outline" size={14} color="#FFF" />
                <Text style={styles.categoryChipText} numberOfLines={1}>
                  {report.category}
                </Text>
              </View>
              <View style={[styles.statusChip, statusStyle.badge]}>
                <Ionicons
                  name={
                    report.status === "Resolved"
                      ? "checkmark-circle"
                      : report.status.startsWith("Assigned") ||
                        report.status === "InProgress"
                      ? "construct-outline"
                      : "time-outline"
                  }
                  size={12}
                  color={statusStyle.text.color}
                />
                <Text style={statusStyle.text} numberOfLines={1}>
                  {report.status}
                </Text>
              </View>
            </View>
            {report.title && (
              <Text style={styles.title} numberOfLines={2}>
                {report.title}
              </Text>
            )}
            <Animated.View
              style={[
                styles.floatingUpvote,
                isUpvoted && styles.floatingUpvoteActive,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={styles.floatingUpvoteInner}
                onPress={handleUpvote}
                disabled={isProcessingVote}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isUpvoted ? "caret-up" : "caret-up-outline"}
                  size={18}
                  color={isUpvoted ? "#FFF" : "#E53935"}
                />
                <Text
                  style={[
                    styles.floatingUpvoteText,
                    isUpvoted && styles.floatingUpvoteTextActive,
                  ]}
                >
                  {currentUpvotes}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Link>
      <View style={styles.metaRow}>
        <AuthenticityBadge status={report.locationAuthenticity} />
        {report.locationAuthenticity && report.locationAuthenticity !== 'NOT_AVAILABLE' && <View style={styles.dot} />}
        <Ionicons name="location-outline" size={14} color="#6C757D" />
        <Text style={styles.metaText} numberOfLines={1}>
          {formatDistance(report.distance)}
        </Text>
        <View style={styles.dot} />
        <Ionicons name="time-outline" size={14} color="#6C757D" />
        <Text style={styles.metaText} numberOfLines={1}>
          {report.createdAt
            ? new Date(report.createdAt).toLocaleDateString()
            : "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  imageWrapper: { position: "relative" },
  image: { width: "100%", height: 190 },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topChipsRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(229,57,53,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: "55%",
  },
  categoryChipText: {
    color: "#FFF",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  // Base chip style - pill, auto width based on content
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    // subtle lift for readability on light images
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  // Tinted backgrounds + matching borders per status (no fixed width)
  statusBadgePending: {
    backgroundColor: "rgba(255,169,64,0.92)", // solid amber for contrast
    borderColor: "transparent",
  },
  statusBadgeInProgress: {
    backgroundColor: "rgba(13,110,253,0.92)", // solid blue for contrast
    borderColor: "transparent",
  },
  statusBadgeResolved: {
    backgroundColor: "rgba(40,167,69,0.92)", // solid green for contrast
    borderColor: "transparent",
  },
  statusTextPending: { color: "#FFFFFF", fontWeight: "700", fontSize: 11 },
  statusTextInProgress: { color: "#FFFFFF", fontWeight: "700", fontSize: 11 },
  statusTextResolved: { color: "#FFFFFF", fontWeight: "700", fontSize: 11 },
  title: {
    position: "absolute",
    left: 14,
    bottom: 16,
    right: 14,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metaText: { fontSize: 12, color: "#6C757D", marginLeft: 4, flexShrink: 1 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CED4DA",
    marginHorizontal: 8,
  },
  floatingUpvote: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingUpvoteInner: { flexDirection: "row", alignItems: "center" },
  floatingUpvoteActive: { backgroundColor: "#E53935" },
  floatingUpvoteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E53935",
    marginLeft: 4,
  },
  floatingUpvoteTextActive: { color: "#FFFFFF" },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeTextBase: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Verified (Green)
  badgeVerified: { backgroundColor: '#E6F4EA' },
  textVerified: { color: '#198754' },
  // Unverified (Yellow)
  badgeUnverified: { backgroundColor: '#FFFBEA' },
  textUnverified: { color: '#B58900' },
  // Mismatch (Red)
  badgeMismatch: { backgroundColor: '#F8D7DA' },
  textMismatch: { color: '#DC3545' },
});
