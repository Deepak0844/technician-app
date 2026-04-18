import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import useTheme from "@hooks/useTheme";

const SkeletonItem = ({ width, height, borderRadius = 8, style }) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const JobCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <SkeletonItem width={120} height={18} />
        <SkeletonItem width={60} height={20} borderRadius={10} />
      </View>
      <View style={{ gap: 8 }}>
        <SkeletonItem width="100%" height={14} />
        <SkeletonItem width="80%" height={14} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
        <SkeletonItem width={80} height={12} />
        <SkeletonItem width={100} height={12} />
      </View>
    </View>
  );
};

export const StatCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
      <SkeletonItem width={60} height={10} style={{ marginBottom: 8 }} />
      <SkeletonItem width={100} height={24} />
    </View>
  );
};

export const SummaryCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <SkeletonItem width={80} height={12} />
        <SkeletonItem width={60} height={12} />
      </View>
      <SkeletonItem width={150} height={32} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SkeletonItem width={100} height={10} />
        <SkeletonItem width={80} height={10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryCard: {
    width: "100%",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
});
