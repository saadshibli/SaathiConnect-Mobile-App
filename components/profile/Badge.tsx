import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface BadgeProps {
  name: string;
}

const BADGE_CONFIG: { [key: string]: { icon: any; color: string } } = {
  "First Report": { icon: "medal-outline", color: "#CD7F32" }, // Bronze
  "Community Helper": { icon: "heart-outline", color: "#E53935" }, // Red
  "Pothole Patriot": { icon: "car-outline", color: "#007BFF" }, // Blue
  // Add more badges here
  default: { icon: "star-outline", color: "#6C757D" },
};

export const Badge: React.FC<BadgeProps> = ({ name }) => {
  const config = BADGE_CONFIG[name] || BADGE_CONFIG.default;
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  const onPressIn = () =>
    Animated.spring(press, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true }).start();

  const transform = [{ scale: Animated.multiply(scale, press) }];

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.cell}
      accessibilityLabel={`${name} badge`}
    >
      <Animated.View style={[styles.badge, { opacity: fade, transform }]}>
        <LinearGradient
          colors={[config.color, `${config.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBg}
        >
          <Ionicons name={config.icon} size={24} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.badgeText} numberOfLines={2}>
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: { marginRight: 12 },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    width: 110,
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    color: "#212529",
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
  },
});
