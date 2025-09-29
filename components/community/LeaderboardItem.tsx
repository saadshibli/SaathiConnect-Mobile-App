import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

interface LeaderboardItemProps {
  rank: number;
  name: string;
  points: number;
  reportsSubmitted?: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  isTopThree?: boolean;
  animationDelay?: number;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  rank,
  name,
  points,
  reportsSubmitted = 0,
  avatarUrl,
  isCurrentUser,
  isTopThree,
  animationDelay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, delay: animationDelay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: animationDelay, useNativeDriver: true, speed: 18, bounciness: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, delay: animationDelay + 30, useNativeDriver: true, speed: 16, bounciness: 6 }),
    ]).start();
  }, [animationDelay, fadeAnim, slideAnim, scaleAnim]);

  const getPodiumBackground = (): string[] => {
    if (rank === 1) return ["#FFE57F", "#FFC107"]; // Gold
    if (rank === 2) return ["#F5F7F8", "#CFD8DC"]; // Silver
    if (rank === 3) return ["#F3C08B", "#D28B47"]; // Bronze
    return ["#FFFFFF", "#F5F5F5"];
  };

  if (isTopThree) {
    const tierHeight = rank === 1 ? 220 : rank === 2 ? 195 : 180;
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
        <LinearGradient colors={getPodiumBackground() as any} style={[styles.podiumPanel, { height: tierHeight }]}>
          {rank === 1 && <Text style={styles.crown}>👑</Text>}
          <Text style={[styles.inlineRank, rank === 1 && styles.inlineRankFirst]}>{rank}</Text>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.podiumAvatarImage} />
          ) : (
            <Ionicons name="person-circle" size={64} color="rgba(0,0,0,0.25)" />
          )}
          <Text style={styles.podiumName} numberOfLines={1}>{name}</Text>
          <Text style={styles.podiumPoints}>{points} pts</Text>
          <Text style={styles.podiumSubtext}>{reportsSubmitted} reports</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[ styles.listItem, isCurrentUser && styles.currentUserItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.listRank}>{rank}</Text>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.listAvatarImage} />
      ) : (
        <Ionicons name="person-circle-outline" size={40} color={isCurrentUser ? "#005A9C" : "#6C757D"} />
      )}
      <View style={styles.listTextContainer}>
        <Text style={styles.listName} numberOfLines={1}>
          {isCurrentUser ? `${name} (You)` : name}
        </Text>
        <Text style={styles.listSubtext}>{reportsSubmitted} reports submitted</Text>
      </View>
      <Text style={styles.listPoints}>{points} pts</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  podiumPanel: {
    width: 108,
    borderRadius: 22,
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 6,
    position: "relative",
  },
  inlineRank: {
    position: "absolute",
    top: 8,
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  inlineRankFirst: { fontSize: 30, textShadowRadius: 4 },
  podiumAvatarImage: { width: 54, height: 54, borderRadius: 32, marginBottom: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" },
  crown: { position: "absolute", top: -22, fontSize: 26 },
  podiumName: { fontWeight: "700", color: "#212529", fontSize: 14, textAlign: "center", marginTop: 6 },
  podiumPoints: { color: "#E53935", fontWeight: "600", fontSize: 13, marginTop: 2 },
  podiumSubtext: { color: "#6C757D", fontSize: 11, marginTop: 2 },
  listItem: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E9ECEF" },
  currentUserItem: { backgroundColor: "#E7F5FF", borderColor: "#007BFF" },
  listRank: { fontSize: 16, fontWeight: "bold", color: "#6C757D", width: 30, textAlign: "center" },
  listAvatarImage: { width: 40, height: 40, borderRadius: 20 },
  listTextContainer: { flex: 1, marginLeft: 12 },
  listName: { fontSize: 16, fontWeight: "600", color: "#212529" },
  listSubtext: { fontSize: 12, color: "#6C757D" },
  listPoints: { fontSize: 16, fontWeight: "bold", color: "#E53935" },
});