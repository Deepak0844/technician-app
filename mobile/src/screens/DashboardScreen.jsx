import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, View, TouchableOpacity, Image, Text, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useNetworkStatus from "@hooks/useNetworkStatus";
import useTheme from "@hooks/useTheme";
import OfflineBanner from "@components/OfflineBanner";
import { formatCurrency } from "@utils/formatUtils";

// Services
import { useGetDashboardSummaryQuery } from "@services/api/dashboardApi";

// Icons
import { Home, PlusCircle } from "lucide-react-native";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  // 1. RTK Query
  const {
    data: summaryResponse,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery();

  const onRefresh = React.useCallback(async () => {
    refetchSummary();
  }, [refetchSummary]);

  const { isConnected } = useNetworkStatus();

  const dashboardStats = summaryResponse?.data || {
    totalJobs: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    earningsChange: 0,
    efficiency: 0,
    recentJobs: [],
  };
  const allJobs = dashboardStats.recentJobs || [];

  const monthlyEarnings = Number(dashboardStats?.monthlyEarnings ?? 0);
  const totalEarnings = Number(dashboardStats?.totalEarnings ?? 0);
  const earningsChange = Number(dashboardStats?.earningsChange ?? 0);
  const efficiency = Number(dashboardStats?.efficiency ?? 0);
  const totalJobs = Number(dashboardStats?.totalJobs ?? 0);

  function getStatusBadgeStyle(status) {
    if (status === "completed")
      return { bg: colors.secondaryBg, border: colors.secondaryBorder, text: colors.secondary };
    if (status === "pending")
      return { bg: colors.warningBg, border: colors.warningBorder, text: colors.warning };
    if (status === "cancelled")
      return { bg: colors.dangerBg, border: colors.dangerBorder, text: colors.danger };
    return { bg: colors.primaryBgStrong, border: colors.primaryBorderStrong, text: colors.primary };
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSecondary }} edges={["top"]}>
      <OfflineBanner />

      {/* TopAppBar */}
      <LinearGradient
        colors={colors.gradientHeader}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          height: 56,
          zIndex: 50,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          activeOpacity={0.7}
        >
          <Home color={colors.indigo} size={20} />
          <Text
            style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.indigo }}
          >
            Technician Portal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Profile")}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
              backgroundColor: colors.bgCard,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn",
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingSummary}
            onRefresh={onRefresh}
            tintColor={colors.refreshColor}
            colors={[colors.refreshColor]}
          />
        }
      >
        {/* Greeting Section */}
        <View style={{ marginBottom: 16, marginTop: 8 }}>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Welcome back
          </Text>
          <Text style={{ fontFamily: "Inter", fontSize: 13, color: colors.textSecondary }}>
            Status: {isConnected ? "Online" : "Connection Required"} • Session Active
          </Text>
        </View>

        {/* Summary Card */}
        <View
          style={{
            width: "100%",
            backgroundColor: colors.bgSurface,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 11,
              color: colors.textSecondary,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            This Month Earnings
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "700", color: colors.primary }}>
                {formatCurrency(monthlyEarnings)}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  fontWeight: "600",
                  color: earningsChange >= 0 ? colors.secondary : colors.danger,
                }}
              >
                {earningsChange >= 0 ? `+${earningsChange}%` : `${earningsChange}%`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 2,
                }}
              >
                Total (All-time)
              </Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: "700", color: colors.textPrimary }}>
                {formatCurrency(totalEarnings)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: colors.bgSurface,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              width: "48%",
            }}
          >
            <Text style={{ fontFamily: "Inter", fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              Total Jobs
            </Text>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>
              {totalJobs}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.bgSurface,
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              width: "48%",
            }}
          >
            <Text style={{ fontFamily: "Inter", fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              Efficiency
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "700", color: colors.secondary }}>
                {efficiency}
              </Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.secondary }}>
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Add Job Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddJob")}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 40,
            shadowColor: colors.primaryDeep,
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            <PlusCircle color={colors.bgPrimary} size={24} />
            <Text style={{ fontFamily: "Space Grotesk", color: colors.bgPrimary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 }}>
              Add New Job
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Jobs Section */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary }}>
              Recent Jobs
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("JobHistory")} activeOpacity={0.7}>
              <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16 }}>
            {allJobs.map((job) => {
              const badge = getStatusBadgeStyle(job.status);
              return (
                <TouchableOpacity
                  key={job._id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("JobDetails", { job })}
                  style={{
                    backgroundColor: colors.bgSurface,
                    padding: 20,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text
                      style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 }}
                      numberOfLines={1}
                    >
                      {job.customerName || job.customerId?.name || "Unknown"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textSecondary }}>
                        ID: #{job._id?.slice(-6).toUpperCase() || "NEW"}
                      </Text>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textDisabled }} />
                      <Text
                        style={{ fontFamily: "Inter", fontSize: 12, color: colors.textSecondary, flex: 1 }}
                        numberOfLines={1}
                      >
                        {job.applianceType || "General Service"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Text style={{ fontFamily: "Space Grotesk", fontWeight: "700", color: colors.primary }}>
                      {formatCurrency(job.amount)}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        borderWidth: 1,
                        backgroundColor: badge.bg,
                        borderColor: badge.border,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 8,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          paddingHorizontal: 4,
                          color: badge.text,
                        }}
                      >
                        {job.status?.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {allJobs.length === 0 && (
              <View style={{ padding: 20, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "Inter", color: colors.textSecondary }}>
                  No recent jobs found.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
