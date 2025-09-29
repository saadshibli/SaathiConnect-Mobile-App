import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-svg-charts";
import { StatCard } from "../../components/community/StatCard";
import { LeaderboardItem } from "../../components/community/LeaderboardItem";
import {
  getTransparencyStats,
  getCategoryCounts,
  getZoneLeaderboard,
  getPublicTrends,
} from "../../api/transparency";
import { getLeaderboard, getMyRank } from "../../api/gamification";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  resolutionRate: number;
}
interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  reportsSubmitted: number;
  avatarUrl?: string;
}
interface MyRank {
  rank: number;
  points: number;
  reportsSubmitted: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface ZoneRow {
  zoneId: string;
  zoneName: string;
  total: number;
  resolved: number;
  resolutionRate: number; // 0-100
}

interface TrendsData {
  dates: string[];
  submissions: number[];
  resolutions: number[];
}

export default function CommunityScreen() {
  const router = useRouter();
  const { session } = useAuth() || {};
  const [viewMode, setViewMode] = useState<"leaderboard" | "dashboard">(
    "leaderboard"
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [segmentContainerWidth, setSegmentContainerWidth] = useState(0);

  const segmentAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(segmentAnim, {
      toValue: viewMode === "leaderboard" ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [viewMode, segmentAnim]);

  const fetchData = useCallback(async () => {
    try {
      const [
        statsRes,
        leaderboardRes,
        categoriesRes,
        zonesRes,
        trendsRes,
        myRankRes,
      ] = await Promise.all([
        getTransparencyStats(),
        getLeaderboard(),
        getCategoryCounts(),
        getZoneLeaderboard(),
        getPublicTrends(14), // last 14 days for compact chart
        session?.accessToken ? getMyRank() : Promise.resolve(null),
      ]);

      setDashboardStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
      setCategories(categoriesRes.data || []);
      setZones(zonesRes.data || []);
      setTrends(trendsRes.data || null);
      if (myRankRes) setMyRank(myRankRes.data);
    } catch (error) {
      console.error("Failed to fetch community data:", error);
    }
  }, [session?.accessToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData().finally(() => setIsLoading(false));
    }, [fetchData])
  );

  const renderHeader = () => (
    <View style={styles.hero}>
      <View style={styles.heroPatternOne} />
      <View style={styles.heroPatternTwo} />
      <View style={styles.heroInner}>
        <Text style={styles.heroTitle}>
          {viewMode === "leaderboard"
            ? "Community Leaders"
            : "Community Dashboard"}
        </Text>
        {session?.accessToken && myRank && viewMode === "leaderboard" && (
          <View style={styles.rankChip}>
            <Ionicons name="ribbon-outline" size={14} color="#FFFFFF" />
            <Text style={styles.rankChipText}>Your Rank: {myRank.rank}</Text>
          </View>
        )}
        <View
          style={styles.segmentContainer}
          onLayout={(e) => setSegmentContainerWidth(e.nativeEvent.layout.width)}
        >
          {segmentContainerWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.segmentActiveBg,
                {
                  width: (segmentContainerWidth - 8) / 2,
                  transform: [
                    {
                      translateX: segmentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (segmentContainerWidth - 8) / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={styles.segmentTouchable}
            onPress={() => setViewMode("leaderboard")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="trophy-outline"
              size={16}
              color={viewMode === "leaderboard" ? "#E53935" : "#FFFFFF"}
            />
            <Text
              style={[
                styles.segmentLabel,
                viewMode === "leaderboard" && styles.segmentLabelActive,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.segmentTouchable}
            onPress={() => setViewMode("dashboard")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="bar-chart-outline"
              size={16}
              color={viewMode === "dashboard" ? "#E53935" : "#FFFFFF"}
            />
            <Text
              style={[
                styles.segmentLabel,
                viewMode === "dashboard" && styles.segmentLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDashboard = () => {
    if (!dashboardStats) return null;
    const { totalReports, resolvedReports, pendingReports, resolutionRate } =
      dashboardStats;
    // Simple milestone logic: 0->100->500->1000->2500
    const milestones = [100, 500, 1000, 2500, 5000];
    const nextMilestone =
      milestones.find((m) => resolvedReports < m) ||
      milestones[milestones.length - 1];
    const milestoneProgress = Math.min(1, resolvedReports / nextMilestone);
    const resolvedProgress =
      totalReports > 0 ? resolvedReports / totalReports : 0;
    const pieData = [
      { value: resolvedReports, svg: { fill: "#28A745" }, key: "resolved" },
      { value: pendingReports, svg: { fill: "#FFC107" }, key: "pending" },
    ];
    return (
      <View style={styles.contentContainer}>
        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[
              styles.quickAction,
              styles.quickActionNarrow,
              { backgroundColor: "#FFF1F2" },
            ]}
            onPress={() => router.push("/(tabs)/report")}
            activeOpacity={0.85}
          >
            <Ionicons name="megaphone-outline" size={18} color="#E53935" />
            <Text style={styles.quickActionText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickAction,
              styles.quickActionWide,
              { backgroundColor: "#E7F5FF" },
            ]}
            onPress={() => setViewMode("leaderboard")}
            activeOpacity={0.85}
          >
            <Ionicons name="trophy-outline" size={18} color="#007BFF" />
            <Text style={styles.quickActionText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickAction,
              styles.quickActionNarrow,
              { backgroundColor: "#FFF8E1" },
            ]}
            onPress={() => router.push("/all-badges-modal")}
            activeOpacity={0.85}
          >
            <Ionicons name="medal-outline" size={18} color="#FB8C00" />
            <Text style={styles.quickActionText}>Badges</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.surfaceSection}>
          <Text style={styles.sectionTitle}>Reports Overview</Text>
          <View style={styles.chartRow}>
            <View style={styles.chartShell}>
              <PieChart
                style={{ height: 140, width: 140 }}
                data={pieData}
                outerRadius="100%"
                innerRadius="70%"
              />
              <View style={styles.chartCenter}>
                <Text style={styles.chartValue}>{totalReports}</Text>
                <Text style={styles.chartLabel}>Total</Text>
              </View>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: "#28A745" }]}
                />
                <Text style={styles.legendText}>
                  Resolved ({resolvedReports})
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: "#FFC107" }]}
                />
                <Text style={styles.legendText}>
                  Pending ({pendingReports})
                </Text>
              </View>
              <View style={styles.legendDivider} />
              <Text style={styles.resolutionRateLabel}>Resolution Rate</Text>
              <Text style={styles.resolutionRateValue}>
                {resolutionRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
        {/* Community Progress */}
        <View style={styles.surfaceSection}>
          <Text style={styles.sectionTitle}>Community Progress</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Resolved</Text>
            <Text style={styles.progressValue}>
              {resolvedReports}/{totalReports}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${resolvedProgress * 100}%` },
              ]}
            />
          </View>
          <View style={styles.milestoneCard}>
            <Ionicons name="flag-outline" size={16} color="#6C757D" />
            <View style={{ flex: 1 }}>
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
              <Text style={styles.milestoneSub}>
                {resolvedReports} / {nextMilestone} resolved
              </Text>
              <View style={styles.milestoneTrack}>
                <View
                  style={[
                    styles.milestoneFill,
                    { width: `${milestoneProgress * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.milestonePct}>
              {Math.round(milestoneProgress * 100)}%
            </Text>
          </View>
        </View>
        <View style={styles.statGrid}>
          <View style={styles.statCol}>
            <StatCard
              icon="checkmark-done-circle"
              label="Resolved"
              value={resolvedReports}
              gradientColors={["#28A745", "#20C997"]}
            />
          </View>
          <View style={styles.statCol}>
            <StatCard
              icon="hourglass"
              label="Pending"
              value={pendingReports}
              gradientColors={["#FFC107", "#FD7E14"]}
            />
          </View>
        </View>
        <View style={styles.statGridFullWidth}>
          {/* Resolution Rate full width with extra content */}
          <View style={styles.statFullWidthCard}>
            <StatCard
              icon="trending-up"
              label="Resolution Rate"
              value={`${resolutionRate.toFixed(1)}%`}
              gradientColors={["#007BFF", "#00BFFF"]}
            />
            <View style={styles.inlineInsightRow}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#0b5ed7"
              />
              <Text style={styles.inlineInsightText}>
                Great job! Keep pushing to reach the next milestone.
              </Text>
            </View>
          </View>
          {/* Total Reports full width with stacked pills on right inside the card */}
          <View style={styles.statFullWidthCard}>
            <StatCard
              icon="albums"
              label="Total Reports"
              value={totalReports}
              gradientColors={["#6f42c1", "#845ef7"]}
            >
              <View style={styles.kpiStackRight}>
                <View style={[styles.kpiPill, styles.kpiPillTight]}>
                  <Text style={styles.kpiPillText}>
                    Resolved: {resolvedReports}
                  </Text>
                </View>
                <View
                  style={[
                    styles.kpiPill,
                    styles.kpiPillTight,
                    { backgroundColor: "#FFF3CD", borderColor: "#FFECB5" },
                  ]}
                >
                  <Text style={[styles.kpiPillText, { color: "#856404" }]}>
                    Pending: {pendingReports}
                  </Text>
                </View>
              </View>
            </StatCard>
          </View>
        </View>
        {/* Top Categories */}
        {categories.length > 0 && (
          <View style={styles.surfaceSection}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            {(() => {
              const top = categories.slice(0, 5);
              const maxCount = Math.max(...top.map((c) => c.count), 1);
              return top.map((c) => (
                <View key={c.category} style={styles.barRow}>
                  <Ionicons
                    name="pricetag-outline"
                    size={14}
                    color="#6C757D"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {c.category || "Uncategorized"}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFillPrimary,
                        { width: `${(c.count / maxCount) * 100}%` },
                      ]}
                    />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.barValue}>{c.count}</Text>
                    <Text style={styles.barSubValue}>
                      {Math.round(
                        (c.count /
                          (top.reduce((a, b) => a + b.count, 0) || 1)) *
                          100
                      )}
                      %
                    </Text>
                  </View>
                </View>
              ));
            })()}
          </View>
        )}

        {/* Zone Leaderboard */}
        {zones.length > 0 && (
          <View style={styles.surfaceSection}>
            <Text style={styles.sectionTitle}>Zone Leaderboard</Text>
            {zones.slice(0, 5).map((z, idx) => (
              <View key={String(z.zoneId)} style={styles.zoneRow}>
                <View style={styles.zoneLeft}>
                  {idx < 3 ? (
                    <Ionicons
                      name={
                        idx === 0
                          ? "trophy"
                          : idx === 1
                          ? "trophy-outline"
                          : "medal-outline"
                      }
                      size={18}
                      color={
                        idx === 0
                          ? "#E53935"
                          : idx === 1
                          ? "#0d6efd"
                          : "#FB8C00"
                      }
                      style={{ marginRight: 6 }}
                    />
                  ) : (
                    <View style={styles.zoneRankBadge}>
                      <Text style={styles.zoneRankText}>{idx + 1}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.zoneName} numberOfLines={1}>
                      {z.zoneName}
                    </Text>
                    <View style={styles.barTrackSmall}>
                      <View
                        style={[
                          styles.barFillSecondary,
                          { width: `${Math.min(100, z.resolutionRate)}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.zoneMeta}>
                  <Text style={styles.zoneMetaText}>
                    {z.resolved}/{z.total}
                  </Text>
                  <View
                    style={[
                      styles.rateChip,
                      {
                        backgroundColor:
                          z.resolutionRate >= 70
                            ? "#E8F5E9"
                            : z.resolutionRate >= 40
                            ? "#FFF3CD"
                            : "#F8D7DA",
                        borderColor:
                          z.resolutionRate >= 70
                            ? "#C8E6C9"
                            : z.resolutionRate >= 40
                            ? "#FFECB5"
                            : "#F5C2C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rateChipText,
                        {
                          color:
                            z.resolutionRate >= 70
                              ? "#1B5E20"
                              : z.resolutionRate >= 40
                              ? "#856404"
                              : "#842029",
                        },
                      ]}
                    >
                      {z.resolutionRate.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Trends */}
        {trends && trends.dates.length > 0 && (
          <View style={styles.surfaceSection}>
            <Text style={styles.sectionTitle}>Trends (14 days)</Text>
            {(() => {
              const maxVal = Math.max(
                ...trends.submissions,
                ...trends.resolutions,
                1
              );
              const items = trends.dates.map((d, i) => ({
                date: d,
                sub: trends.submissions[i] || 0,
                res: trends.resolutions[i] || 0,
              }));
              return (
                <>
                  <View style={styles.trendBarsRow}>
                    <View style={styles.trendGrid} />
                    {items.map((it, idx) => (
                      <View key={it.date + idx} style={styles.trendCluster}>
                        <View
                          style={[
                            styles.trendBarSub,
                            { height: 60 * (it.sub / maxVal) },
                          ]}
                        />
                        <View
                          style={[
                            styles.trendBarRes,
                            { height: 60 * (it.res / maxVal) },
                          ]}
                        />
                      </View>
                    ))}
                  </View>
                  <View style={styles.trendLegendRow}>
                    <View style={styles.legendPair}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#007BFF" },
                        ]}
                      />
                      <Text style={styles.legendSmall}>Submissions</Text>
                    </View>
                    <View style={styles.legendPair}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#28A745" },
                        ]}
                      />
                      <Text style={styles.legendSmall}>Resolutions</Text>
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        )}
        {/* Compact Top Contributors - removed per request */}
      </View>
    );
  };

  const renderLeaderboard = () => {
    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);
    const currentUserInList = leaderboard.some(
      (u) => u._id === session?.user?.id
    );
    return (
      <View style={styles.contentContainer}>
        <View style={[styles.surfaceSection, styles.podiumSectionOverride]}>
          <Text style={styles.sectionTitle}>Top Contributors</Text>
          {topThree.length > 0 && (
            <View style={styles.podiumContainer}>
              {topThree[1] && (
                <LeaderboardItem
                  {...topThree[1]}
                  rank={2}
                  isTopThree
                  animationDelay={100}
                />
              )}
              {topThree[0] && (
                <LeaderboardItem
                  {...topThree[0]}
                  rank={1}
                  isTopThree
                  animationDelay={0}
                />
              )}
              {topThree[2] && (
                <LeaderboardItem
                  {...topThree[2]}
                  rank={3}
                  isTopThree
                  animationDelay={200}
                />
              )}
            </View>
          )}
        </View>
        <View style={styles.surfaceSection}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {restOfLeaderboard.map((user, index) => (
            <LeaderboardItem
              key={user._id}
              rank={index + 4}
              name={user.name}
              points={user.points}
              reportsSubmitted={user.reportsSubmitted}
              isCurrentUser={session?.user?.id === user._id}
              animationDelay={150 + index * 40}
            />
          ))}
          {myRank && session?.user && !currentUserInList && (
            <View style={styles.myRankContainer}>
              <LeaderboardItem
                rank={myRank.rank}
                name={session.user.name}
                points={myRank.points}
                reportsSubmitted={myRank.reportsSubmitted}
                isCurrentUser={true}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.skeletonBlock, { height: 180 }]} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonCard]} />
        <View style={[styles.skeletonCard]} />
      </View>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonCard]} />
        <View style={[styles.skeletonCard]} />
      </View>
      <View style={[styles.skeletonBlock, { height: 260, marginTop: 24 }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E53935"]}
          />
        }
      >
        {isLoading
          ? renderSkeleton()
          : viewMode === "dashboard"
          ? renderDashboard()
          : renderLeaderboard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  hero: {
    backgroundColor: "#263238",
    paddingTop: 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    marginBottom: 8,
  },
  heroPatternOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -70,
    right: -70,
  },
  heroPatternTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -20,
    left: -60,
  },
  heroInner: { alignItems: "center" },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 18,
  },
  rankChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  rankChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    padding: 4,
    width: "100%",
    maxWidth: 360,
    position: "relative",
  },
  segmentActiveBg: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  segmentTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  segmentLabelActive: { color: "#E53935", fontWeight: "700" },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionNarrow: { flex: 1 },
  quickActionWide: { flex: 1.6 },
  quickActionText: { marginLeft: 6, fontWeight: "700", color: "#212529" },
  surfaceSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  podiumSectionOverride: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 22,
  },
  chartRow: { flexDirection: "row", alignItems: "center" },
  chartShell: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chartCenter: { position: "absolute", alignItems: "center" },
  chartValue: { fontSize: 24, fontWeight: "700", color: "#212529" },
  chartLabel: { fontSize: 12, color: "#6C757D" },
  chartLegend: { flex: 1, paddingLeft: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  legendText: { fontSize: 13, color: "#343A40", fontWeight: "500" },
  legendDivider: { height: 1, backgroundColor: "#E9ECEF", marginVertical: 10 },
  resolutionRateLabel: { fontSize: 12, color: "#6C757D", letterSpacing: 0.3 },
  resolutionRateValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E53935",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13, color: "#6C757D" },
  progressValue: { fontSize: 13, color: "#212529", fontWeight: "700" },
  progressBarTrack: {
    height: 10,
    backgroundColor: "#F1F3F5",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#28A745",
    borderRadius: 8,
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 10,
  },
  milestoneTitle: { fontSize: 13, fontWeight: "700", color: "#212529" },
  milestoneSub: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  milestoneTrack: {
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 6,
  },
  milestoneFill: { height: "100%", backgroundColor: "#E53935" },
  milestonePct: { fontWeight: "800", color: "#E53935" },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statCol: { flex: 0.485 },
  statGridFullWidth: { marginTop: 4 },
  statFullWidthCard: { marginBottom: 16 },
  inlineInsightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -8,
    paddingHorizontal: 8,
  },
  inlineInsightText: { fontSize: 12, color: "#0b5ed7" },
  inlineKpisRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: -8,
    paddingHorizontal: 8,
  },
  inlineKpisRowInside: { flexDirection: "row", gap: 8, marginTop: 10 },
  kpiPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
    borderWidth: 1,
    borderRadius: 12,
    opacity:0.8,
  },
  kpiPillText: { fontSize: 12, fontWeight: "700", color: "#1B5E20", },
  kpiStackRight: { position: "absolute", right: 20, top: 20, gap: 8 },
  kpiPillTight: { paddingVertical: 4, paddingHorizontal: 8 },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  compactLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  compactRank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  compactRankText: { fontSize: 12, fontWeight: "800", color: "#495057" },
  compactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    flexShrink: 1,
  },
  compactRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  compactRightAligned: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 110,
  },
  compactPoints: { fontSize: 13, fontWeight: "700", color: "#E53935" },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 210,
    paddingHorizontal: 4,
  },
  myRankContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 16,
  },
  skeletonBlock: {
    backgroundColor: "#E3E6E8",
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonRow: { flexDirection: "row", justifyContent: "space-between" },
  skeletonCard: {
    backgroundColor: "#E3E6E8",
    borderRadius: 16,
    height: 120,
    flex: 0.48,
    marginTop: 12,
  },
  scrollContent: { paddingBottom: 80 },
  // Bars and lists
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  barLabel: { flex: 1, fontSize: 13, color: "#212529", fontWeight: "600" },
  barTrack: {
    flex: 2,
    height: 10,
    backgroundColor: "#F1F3F5",
    borderRadius: 6,
    overflow: "hidden",
  },
  barTrackSmall: {
    height: 8,
    backgroundColor: "#F1F3F5",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 6,
  },
  barFillPrimary: { height: "100%", backgroundColor: "#007BFF" },
  barFillSecondary: { height: "100%", backgroundColor: "#28A745" },
  barValue: {
    width: 34,
    textAlign: "right",
    fontWeight: "700",
    color: "#343A40",
  },
  barSubValue: { fontSize: 10, color: "#6C757D", marginTop: 2 },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  zoneLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 6 },
  zoneRankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  zoneRankText: { fontSize: 10, fontWeight: "800", color: "#495057" },
  zoneName: { fontSize: 14, fontWeight: "700", color: "#212529" },
  zoneMeta: { alignItems: "flex-end", minWidth: 72 },
  zoneMetaText: { fontSize: 12, color: "#495057" },
  zoneRateText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#28A745",
    marginTop: 2,
  },
  rateChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  rateChipText: { fontSize: 11, fontWeight: "800" },
  // Trends
  trendBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 72,
    marginTop: 4,
  },
  trendGrid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderColor: "#E9ECEF",
  },
  trendCluster: {
    width: 12,
    height: 60,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  trendBarSub: {
    width: 5,
    backgroundColor: "#007BFF",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginBottom: 2,
  },
  trendBarRes: {
    width: 5,
    backgroundColor: "#28A745",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  trendLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 10,
  },
  legendPair: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendSmall: { fontSize: 12, color: "#6C757D" },
  rankGold: { backgroundColor: "#FFD700" },
  rankSilver: { backgroundColor: "#C0C0C0" },
  rankBronze: { backgroundColor: "#CD7F32" },
  pointsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFD1D7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactRowHighlight: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
});
