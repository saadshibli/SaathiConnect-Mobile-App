import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface FullBadgeProps {
  name: string;
  description: string;
  icon: any;
  color: string;
  isEarned: boolean;
}

export const FullBadge: React.FC<FullBadgeProps> = ({
  name,
  description,
  icon,
  color,
  isEarned,
}) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const shineX = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (isEarned) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shineX, {
            toValue: 220,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(shineX, {
            toValue: -120,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isEarned, shineX]);

  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  const cardTransform = [{ scale: Animated.multiply(scale, pressScale) }];

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.cell}
      accessibilityRole="imagebutton"
      accessibilityLabel={`${name} badge`}
    >
      <Animated.View
        style={[
          styles.card,
          !isEarned && styles.unearnedCard,
          { opacity, transform: cardTransform },
        ]}
      >
        <View style={styles.iconWrap}>
          {isEarned ? (
            <LinearGradient
              colors={[color, `${color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBg}
            >
              <Ionicons name={icon} size={32} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={[styles.iconBg, { backgroundColor: "#E9ECEF" }]}>
              <Ionicons name={icon} size={32} color="#ADB5BD" />
            </View>
          )}
          {isEarned && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shine,
                { transform: [{ translateX: shineX }, { rotate: "25deg" }] },
              ]}
            />
          )}
        </View>

        <Text
          style={[styles.name, !isEarned && styles.unearnedText]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

        {isEarned ? (
          <View style={styles.ribbonEarned}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.ribbonText}>Earned</Text>
          </View>
        ) : (
          <View style={styles.ribbonLocked}>
            <Ionicons name="lock-closed" size={12} color="#495057" />
            <Text style={styles.ribbonTextLocked}>Locked</Text>
          </View>
        )}

        {!isEarned && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: { width: "48%", marginBottom: 12 },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  unearnedCard: { backgroundColor: "#F8F9FA" },
  iconWrap: { width: 72, height: 72, marginTop: 4, marginBottom: 8 },
  iconBg: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  shine: {
    position: "absolute",
    top: -10,
    left: 0,
    width: 60,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: "#212529",
    marginTop: 4,
    textAlign: "center",
  },
  unearnedText: { color: "#ADB5BD" },
  description: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "center",
    marginTop: 6,
  },
  ribbonEarned: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#28A745",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ribbonLocked: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ribbonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  ribbonTextLocked: { color: "#495057", fontSize: 11, fontWeight: "700" },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
});
