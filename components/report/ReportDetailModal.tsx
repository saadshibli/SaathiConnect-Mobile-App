import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getReportById } from "../../api/reports";

import type { Report } from "../ReportCard";

export interface HistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
  updatedBy?: { name?: string; role?: string } | null;
  proofImageUrl?: string;
}

export interface FullReport extends Report {
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: HistoryEntry[];
  submittedBy?: { name?: string; email?: string };
  assignedDepartment?: { name?: string };
  assignedWorker?: { name?: string };
}

interface ReportDetailModalProps {
  reportId: string | null;
  initialReport?: Report | null; // Lightweight data we already have
  visible: boolean;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  reportId,
  initialReport,
  visible,
  onClose,
}) => {
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFull = async () => {
      if (!reportId || !visible) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getReportById(reportId);
        if (!cancelled) setFullReport(res.data);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError("Failed to load full report details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFull();
    return () => {
      cancelled = true;
    };
  }, [reportId, visible]);

  const displayReport: FullReport | null =
    fullReport || (initialReport as FullReport) || null;

  const timeline = useMemo(() => {
    if (!displayReport?.history) return [];
    return [...displayReport.history].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [displayReport?.history]);

  const addressString = useMemo(() => {
    const a = displayReport?.address;
    if (!a) return null;
    return [a.street, a.city, a.state].filter(Boolean).join(", ");
  }, [displayReport?.address]);

  const aiVerified = useMemo(() => {
    if (!displayReport) return false;
    if ((displayReport as any).aiAnalyzed) return true;
    const hist = displayReport.history || [];
    return hist.some(
      (h) =>
        (h.status && /ai|analy/i.test(h.status)) ||
        (h.notes && /ai|analy/i.test(h.notes || ""))
    );
  }, [displayReport]);

  const statusStyle = (status?: string) => {
    if (!status) return styles.statusBadgePending;
    if (status === "Resolved") return styles.statusBadgeResolved;
    if (status.startsWith("Assigned") || status === "InProgress")
      return styles.statusBadgeInProgress;
    return styles.statusBadgePending;
  };

  const statusTextColor = (status?: string) => {
    if (!status) return styles.statusTextPending;
    if (status === "Resolved") return styles.statusTextResolved;
    if (status.startsWith("Assigned") || status === "InProgress")
      return styles.statusTextInProgress;
    return styles.statusTextPending;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Report Details</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close report details"
            >
              <Ionicons name="close" size={24} color="#212529" />
            </TouchableOpacity>
          </View>
          {!displayReport && loading && (
            <ActivityIndicator
              size="large"
              color="#E53935"
              style={{ marginTop: 40 }}
            />
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {displayReport && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: displayReport.imageUrl }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                />
                {aiVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.verifiedText}>AI Verified</Text>
                  </View>
                )}
                {addressString && (
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
              <View style={styles.sectionTop}>
                <Text style={styles.category}>{displayReport.category}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    statusStyle(displayReport.status),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTextBase,
                      statusTextColor(displayReport.status),
                    ]}
                  >
                    {displayReport.status}
                  </Text>
                </View>
              </View>
              {displayReport.address && (
                <Text style={styles.addressText}>
                  {[
                    displayReport.address.street,
                    displayReport.address.city,
                    displayReport.address.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {displayReport.description && (
                <Text style={styles.description}>
                  {displayReport.description}
                </Text>
              )}
              <View style={styles.metaRow}>
                {displayReport.priority && (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>
                      Priority: {displayReport.priority}
                    </Text>
                  </View>
                )}
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    Upvotes: {displayReport.upvotes}
                  </Text>
                </View>
              </View>
              {/* Timeline */}
              <View style={styles.timelineSection}>
                <Text style={styles.timelineTitle}>Journey</Text>
                {timeline.length === 0 && (
                  <Text style={styles.timelineEmpty}>
                    No status updates yet.
                  </Text>
                )}
                {timeline.map((h, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStatus}>{h.status}</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(h.timestamp).toLocaleString()}
                      </Text>
                      {h.notes && (
                        <Text style={styles.timelineNotes}>{h.notes}</Text>
                      )}
                      {h.updatedBy?.name && (
                        <Text style={styles.timelineBy}>
                          By: {h.updatedBy.name}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#212529" },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: "#F1F3F5",
  },
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
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  category: { fontSize: 18, fontWeight: "700", color: "#212529" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  statusBadgePending: { backgroundColor: "#FFF4E5" },
  statusBadgeInProgress: { backgroundColor: "#E7F5FF" },
  statusBadgeResolved: { backgroundColor: "#E6F4EA" },
  statusTextBase: { fontSize: 12, fontWeight: "600" },
  statusTextPending: { color: "#FFA940" },
  statusTextInProgress: { color: "#007BFF" },
  statusTextResolved: { color: "#28A745" },
  addressText: { fontSize: 14, color: "#495057", marginBottom: 8 },
  description: {
    fontSize: 15,
    lineHeight: 20,
    color: "#343A40",
    marginBottom: 12,
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metaPill: {
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaPillText: { fontSize: 12, fontWeight: "600", color: "#495057" },
  timelineSection: {
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
    paddingTop: 12,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#212529",
  },
  timelineEmpty: { fontSize: 13, color: "#868E96" },
  timelineItem: { flexDirection: "row", marginBottom: 14 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
    marginTop: 5,
    marginRight: 10,
  },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: "600", color: "#212529" },
  timelineTime: { fontSize: 11, color: "#868E96", marginTop: 2 },
  timelineNotes: { fontSize: 12, color: "#495057", marginTop: 4 },
  timelineBy: { fontSize: 11, color: "#6C757D", marginTop: 2 },
  errorText: { color: "#E03131", textAlign: "center", marginTop: 16 },
});

export default ReportDetailModal;
