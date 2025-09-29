import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

import { getReportById } from "../../api/reports";
import {
  FullReport,
  HistoryEntry,
} from "../../components/report/ReportDetailModal";

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  // 🔧 FIX: Use the new FullReport type for state
  const [report, setReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      try {
        const response = await getReportById(String(id));
        setReport(response.data);
      } catch (error) {
        console.error("Failed to fetch report details:", error);
        Alert.alert("Error", "Could not load report details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (isLoading) {
    return (
      <ActivityIndicator size="large" color="#E53935" style={styles.centered} />
    );
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text>Report not found.</Text>
      </View>
    );
  }

  // Derive address string and AI verified flag similar to the modal
  const addressString = report.address
    ? [report.address.street, report.address.city, report.address.state]
        .filter(Boolean)
        .join(", ")
    : null;
  const aiVerified =
    (report as any).aiAnalyzed ||
    (report.history || []).some(
      (h) => /ai|analy/i.test(h.status || "") || /ai|analy/i.test(h.notes || "")
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {report.category}
        </Text>
      </View>
      <ScrollView>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: report.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          {aiVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.verifiedText}>AI Verified</Text>
            </View>
          )}
          {!!addressString && (
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.65)"]}
              style={styles.captionGradient}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.captionText} numberOfLines={2}>
                {addressString}
              </Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.detailsCard}>
            <DetailRow
              icon="cube-outline"
              label="Status"
              value={report.status}
            />
            <DetailRow
              icon="location-outline"
              label="Address"
              value={addressString || "N/A"}
            />
            <DetailRow
              icon="chatbox-ellipses-outline"
              label="Description"
              value={report.description}
            />
          </View>

          <Text style={styles.timelineTitle}>Report Journey</Text>
          <View style={styles.timelineContainer}>
            {(report.history || []).map(
              (entry: HistoryEntry, index: number, arr: HistoryEntry[]) => {
                const timeText = entry.timestamp
                  ? new Date(entry.timestamp).toLocaleString()
                  : "";
                const submitterName =
                  report.submittedBy?.name ||
                  ((report as any).isAnonymous ? "Anonymous" : "User");
                const role = entry.updatedBy?.role
                  ? ` (${entry.updatedBy.role})`
                  : "";
                const actorText = entry.updatedBy?.name
                  ? `${entry.updatedBy.name}${role}`
                  : index === 0
                  ? `Submitted by ${submitterName}`
                  : "System";
                return (
                  <TimelineItem
                    key={index}
                    data={entry}
                    isLast={index === arr.length - 1}
                    actorText={actorText}
                    timeText={timeText}
                  />
                );
              }
            )}
          </View>

          <MapView
            style={styles.map}
            region={{
              latitude: report.location.coordinates[1],
              longitude: report.location.coordinates[0],
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: report.location.coordinates[1],
                longitude: report.location.coordinates[0],
              }}
            />
          </MapView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔧 FIX: Added explicit types for props
const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color="#6C757D" style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// 🔧 FIX: Added explicit types for props
const TimelineItem = ({
  data,
  isLast,
  actorText,
  timeText,
}: {
  data: HistoryEntry;
  isLast: boolean;
  actorText: string;
  timeText: string;
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={styles.timelineIcon} />
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineStatus}>{data.status}</Text>
      <Text style={styles.timelineNote}>{data.notes}</Text>
      {!!timeText && (
        <Text style={styles.timelineMeta}>Date & Time: {timeText}</Text>
      )}
      {!!actorText && <Text style={styles.timelineMeta}>By: {actorText}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  imageWrapper: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F3F5",
  },
  image: { width: "100%", height: "100%" },
  captionGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  captionText: { color: "#FFFFFF", fontSize: 12, flex: 1 },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(40,167,69,0.95)",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  content: { padding: 16 },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailIcon: { marginRight: 12, marginTop: 2 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 12, color: "#6C757D", marginBottom: 2 },
  detailValue: { fontSize: 16, color: "#212529", lineHeight: 22 },
  timelineTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  timelineContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  timelineItem: { flexDirection: "row" },
  timelineIconContainer: { alignItems: "center" },
  timelineIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007BFF",
  },
  timelineLine: { flex: 1, width: 2, backgroundColor: "#E9ECEF" },
  timelineContent: { flex: 1, paddingLeft: 16, paddingBottom: 20 },
  timelineStatus: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  timelineNote: { color: "#495057", marginBottom: 6 },
  timelineMeta: { fontSize: 12, color: "#ADB5BD" },
  map: { width: "100%", height: 200, borderRadius: 12, marginTop: 24 },
});
