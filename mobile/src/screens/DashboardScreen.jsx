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
import { formatCurrency, formatDate } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";
import JobCard from "@components/JobCard";

// Icons
import {
  Home,
  PlusCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

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
    earningsChange: null,
    efficiency: 0,
    outstandingPayments: 0,
    recentJobs: [],
  };

  const allJobs = dashboardStats.recentJobs || [];
  const monthlyTotalEarnings = Number(dashboardStats?.monthlyPaidEarnings ?? 0);
  const rawEarningsChange = dashboardStats?.earningsChange;
  const isNewMonth = rawEarningsChange === null;
  const earningsChange = isNewMonth ? 0 : Number(rawEarningsChange ?? 0);
  const efficiency = Number(dashboardStats?.efficiency ?? 0);
  const totalJobs = Number(dashboardStats?.totalJobs ?? 0);
  const outstandingPayments = Number(dashboardStats?.outstandingPayments ?? 0);

  // Event handlers
  async function handleRefresh() {
    setIsRefreshing(true);
    await refetchSummary();
    setIsRefreshing(false);
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
          height: 64,
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
              fontSize: 16,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 2,
            }}
          >
            {(() => {
              const hour = new Date().getHours();
              const timeGreeting =
                hour < 12
                  ? "Good morning"
                  : hour < 17
                    ? "Good afternoon"
                    : "Good evening";
              const name = user?.name?.split(" ")[0] || "Technician";
              return totalJobs > 0
                ? `${timeGreeting}, ${name}! 👋`
                : `Welcome, ${name}! 🎉`;
            })()}
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {new Date().toLocaleDateString("en-IN", { weekday: "long" })},{" "}
            {formatDate(new Date())}
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
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Calendar color={colors.textSecondary} size={12} />
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
            </View>
            {/* Badge Logic: Show 'New ✦' if no jobs ever, else show earnings change if available */}
            {totalJobs === 0 ? (
              <View
                style={{
                  backgroundColor: colors.secondary + "15",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "800",
                    color: colors.secondary,
                  }}
                >
                  New ✦
                </Text>
              </View>
            ) : !isNewMonth ? (
              <View
                style={{
                  backgroundColor:
                    (earningsChange >= 0 ? colors.secondary : colors.danger) +
                    "15",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {earningsChange >= 0 ? (
                  <TrendingUp color={colors.secondary} size={10} />
                ) : (
                  <TrendingDown color={colors.danger} size={10} />
                )}
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
            ) : null}
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
                  fontSize: 10,
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
                  fontSize: 10,
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
                {formatCurrency(monthlyTotalEarnings)}
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
                    letterSpacing: 0.3,
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
                Service, diagnostic & spare parts
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.warningBg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: 12,
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  color: colors.warningIcon,
                  fontSize: 10,
                  fontWeight: "800",
                }}
                numberOfLines={1}
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
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              width: "48%",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.primaryBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Wrench color={colors.primary} size={15} />
            </View>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 22,
                fontWeight: "700",
                color: colors.textPrimary,
                marginBottom: 2,
              }}
            >
              {totalJobs}
            </Text>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 10,
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Total Jobs
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.bgSurface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              width: "48%",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.secondaryBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <CheckCircle2 color={colors.secondary} size={15} />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 22,
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
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 10,
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Success Rate
            </Text>
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
                  fontSize: 13,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                View All{totalJobs > 0 ? ` (${totalJobs})` : ""}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 0 }}>
            {allJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onPress={() =>
                  navigation.navigate(RouteNames.JOB_DETAILS, { job })
                }
              />
            ))}

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
