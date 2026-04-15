import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useGetDashboardSummaryQuery } from "@services/api/dashboardApi";
import { RouteNames } from "@constants/routeNames";
import { JobStatuses, PriorityLevels } from "@constants/appConstants";
import { formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";

// Icons
import { Home, PlusCircle } from "lucide-react-native";

export default function DashboardScreen() {
  const navigation = useNavigation();

  const { colors } = useTheme();
  const user = useSelector((state) => state.auth.user);

  // RTK Query
  const { data: summaryResponse, refetch: refetchSummary } =
    useGetDashboardSummaryQuery();

  // Local state
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Derived vars
  const dashboardStats = summaryResponse?.data || {
    totalJobs: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    earningsChange: 0,
    efficiency: 0,
    outstandingPayments: 0,
    recentJobs: [],
  };

  const allJobs = dashboardStats.recentJobs || [];
  const totalEarnings = Number(dashboardStats?.totalEarnings ?? 0);
  const earningsChange = Number(dashboardStats?.earningsChange ?? 0);
  const efficiency = Number(dashboardStats?.efficiency ?? 0);
  const totalJobs = Number(dashboardStats?.totalJobs ?? 0);
  const outstandingPayments = Number(dashboardStats?.outstandingPayments ?? 0);

  // Event handlers
  async function handleRefresh() {
    setIsRefreshing(true);
    await refetchSummary();
    setIsRefreshing(false);
  }

  function getStatusBadgeStyle(status) {
    if (status === JobStatuses.COMPLETED)
      return {
        bg: colors.secondaryBg,
        border: colors.secondaryBorder,
        text: colors.secondary,
      };
    if (status === JobStatuses.PENDING)
      return {
        bg: colors.warningBg,
        border: colors.warningBorder,
        text: colors.warning,
      };
    if (status === JobStatuses.CANCELLED)
      return {
        bg: colors.dangerBg,
        border: colors.dangerBorder,
        text: colors.danger,
      };
    return {
      bg: colors.primaryBgStrong,
      border: colors.primaryBorderStrong,
      text: colors.primary,
    };
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgSecondary }}
      edges={["top"]}
    >
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
            style={{
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: "700",
              color: colors.indigo,
            }}
          >
            Technician Portal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(RouteNames.PROFILE)}
        >
          <Avatar name={user?.name} uri={user?.avatar} size={32} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
            Welcome back, {user?.name?.split(" ")[0] || "Technician"}!
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            Status: Session Active
          </Text>
        </View>

        {/* Summary Card - Financial Intelligence */}
        <View
          style={{
            width: "100%",
            backgroundColor: colors.bgSurface,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 10,
                fontWeight: "700",
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              This Month
            </Text>
            <View
              style={{
                backgroundColor:
                  (earningsChange >= 0 ? colors.secondary : colors.danger) +
                  "15",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: "800",
                  color: earningsChange >= 0 ? colors.secondary : colors.danger,
                }}
              >
                {earningsChange >= 0
                  ? `+${earningsChange}%`
                  : `${earningsChange}%`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.bgPrimary,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Paid
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.secondary,
                }}
              >
                {formatCurrency(
                  Number(dashboardStats?.monthlyPaidEarnings ?? 0),
                )}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.bgPrimary,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                To Collect
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                {formatCurrency(
                  Number(dashboardStats?.monthlyPendingEarnings ?? 0),
                )}
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 12,
              opacity: 0.3,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 9,
                  color: colors.textDisabled,
                  textTransform: "uppercase",
                }}
              >
                Total Earnings
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  marginTop: 2,
                }}
              >
                {formatCurrency(totalEarnings)}
              </Text>
            </View>
          </View>
        </View>

        {/* Outstanding Payments Card */}
        {outstandingPayments > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(RouteNames.JOB_HISTORY)}
            style={{
              width: "100%",
              backgroundColor: colors.bgCard,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.warningBorder,
              marginBottom: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.warningIcon,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "700",
                    color: colors.warningIcon,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Payments Pending
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 22,
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                {formatCurrency(outstandingPayments)}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                From completed service jobs
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.warningBg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: colors.warningIcon,
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                RECOVER
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
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
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 11,
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              Total Jobs
            </Text>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 20,
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
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
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 11,
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              Success Rate
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.secondary,
                }}
              >
                {efficiency}
              </Text>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.secondary,
                }}
              >
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Add Job Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate(RouteNames.ADD_JOB)}
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
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <PlusCircle color={colors.bgPrimary} size={24} />
            <Text
              style={{
                fontFamily: "Space Grotesk",
                color: colors.bgPrimary,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Add New Job
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Jobs Section */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 14,
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Recent Jobs
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(RouteNames.JOB_HISTORY)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  color: colors.primary,
                }}
              >
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
                  onPress={() =>
                    navigation.navigate(RouteNames.JOB_DETAILS, { job })
                  }
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
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Space Grotesk",
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {job.customerName || job.customerId?.name || "Unknown"}
                      </Text>
                      {job.priority === PriorityLevels.URGENT && (
                        <View
                          style={{
                            backgroundColor: "#fee2e2",
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                            borderRadius: 4,
                            borderWidth: 0.5,
                            borderColor: "#ef4444",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 7,
                              fontWeight: "800",
                              color: "#b91c1c",
                              textTransform: "uppercase",
                            }}
                          >
                            Urgent
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        ID: #{job._id?.slice(-6).toUpperCase() || "NEW"}
                      </Text>
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: colors.textDisabled,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 12,
                          color: colors.textSecondary,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {job.applianceType || "General Service"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: "Space Grotesk",
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
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

            {allJobs.length === 0 ? (
              <View
                style={{
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontFamily: "Inter", color: colors.textSecondary }}
                >
                  No recent jobs found.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
