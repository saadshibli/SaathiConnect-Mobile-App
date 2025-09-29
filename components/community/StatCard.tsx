import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  gradientColors: string[];
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  gradientColors,
  children,
}) => {
  return (
    <View style={styles.card}>
      {/* 🔧 FIX: Cast the colors prop to 'any' to satisfy TypeScript */}
      <LinearGradient
        colors={gradientColors as any}
        style={styles.cardGradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
        </View>
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  label: { fontSize: 13, color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" },
  childrenContainer: { marginTop: 10 },
});
