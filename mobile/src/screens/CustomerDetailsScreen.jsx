import React from "react";
import {
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGetCustomerByIdQuery } from "@services/api/customerApi";
import { useGetJobsByCustomerPagedInfiniteQuery } from "@services/api/jobApi";
import { RouteNames } from "@constants/routeNames";
import { openDirections } from "@utils/locationUtils";
import { formatDate, formatCurrency, formatDateShort } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";
import Avatar from "@components/Avatar";

// UI Primitives
import { Text } from "@components/ui/text";

// Icons
import {
  ArrowLeft,
  Edit3,
  Phone,
  CalendarPlus,
  CheckCircle2,
  Wrench,
  Navigation as NavIcon,
  MapPin,
  Clock,
  IndianRupee,
  Briefcase,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colors, accentColor }) {
  const bg = accentColor ? `${accentColor}15` : colors.bgSurface;
  const iconColor = accentColor || colors.primary;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 6,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon color={iconColor} size={16} />
      </View>
      <Text
        style={{
          fontFamily: "Space Grotesk",
          fontSize: 16,
          fontWeight: "800",
          color: colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter",
          fontSize: 10,
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Quick Action Button ─────────────────────────────────────────────────────
function ActionButton({ icon: Icon, label, onPress, colors, primary }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 6,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: primary ? colors.primary : colors.bgCard,
          borderWidth: primary ? 0 : 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: primary ? colors.primary : "transparent",
          shadowOpacity: primary ? 0.3 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: primary ? 4 : 0,
        }}
      >
        <Icon color={primary ? "#fff" : colors.textMuted} size={20} />
      </View>
      <Text
        style={{
          fontFamily: "Inter",
          fontSize: 11,
          fontWeight: "600",
          color: primary ? colors.primary : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Job Row ─────────────────────────────────────────────────────────────────
function JobRow({ job, colors, onPress }) {
  const isCompleted = job.status === "completed";
  const isPending = job.status === "pending";
  const statusColor = isCompleted
    ? colors.success
    : isPending
      ? colors.warning
      : colors.primary;
  const statusBg = isCompleted
    ? colors.successBg
    : isPending
      ? colors.warningBg
      : colors.primaryBg;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      {/* Status stripe */}
      <View
        style={{
          width: 4,
          alignSelf: "stretch",
          backgroundColor: statusColor,
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
        }}
      />
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: statusBg,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 12,
        }}
      >
        <Wrench color={statusColor} size={17} />
      </View>
      {/* Content */}
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12 }}>
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: "700",
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: 3,
          }}
          numberOfLines={1}
        >
          {job?.applianceType || "General Service"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Clock color={colors.textDisabled} size={10} />
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 11,
              color: colors.textMuted,
            }}
          >
            {formatDate(job?.serviceDate)}
          </Text>
          <Text style={{ color: colors.textDisabled, fontSize: 11 }}>·</Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 11,
              color: colors.textDisabled,
            }}
          >
            #{job?._id ? job._id.substring(0, 6).toUpperCase() : "..."}
          </Text>
        </View>
      </View>
      {/* Right */}
      <View style={{ alignItems: "flex-end", paddingRight: 14, gap: 4 }}>
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 14,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          {formatCurrency(
            (job.amount || 0) +
              (job.diagnosticFee || 0) +
              (job.partsUsed || []).reduce(
                (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
                0,
              ),
          )}
        </Text>
        <View
          style={{
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: statusBg,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 9,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: statusColor,
            }}
          >
            {job.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CustomerDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { customerId } = route.params;

  const {
    data: custResponse,
    isLoading: loadingCustomerApi,
    refetch: refetchCustomer,
  } = useGetCustomerByIdQuery(customerId, { skip: !customerId });
  const {
    data: jobsData,
    isLoading: loadingJobsApi,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchJobs,
  } = useGetJobsByCustomerPagedInfiniteQuery(customerId, {
    skip: !customerId,
  });

  const [selectedAppliance, setSelectedAppliance] = React.useState(null);
  const hasScrolledRef = React.useRef(false);

  // Flatten all fetched pages into a single array
  const jobs = React.useMemo(
    () => jobsData?.pages.flatMap((p) => p.data) ?? [],
    [jobsData],
  );

  // Total job count comes from the server (accurate even before all pages load)
  const totalJobCount =
    jobsData?.pages[0]?.pagination?.total ?? jobs.length;

  const filteredJobs = React.useMemo(() => {
    if (!selectedAppliance) return jobs;
    return jobs.filter(
      (j) => (j.applianceType || "General") === selectedAppliance,
    );
  }, [jobs, selectedAppliance]);

  const onRefresh = React.useCallback(() => {
    hasScrolledRef.current = false;
    Promise.all([refetchCustomer(), refetchJobs()]);
  }, [refetchCustomer, refetchJobs]);

  const rawCustomer = custResponse?.data;
  const customer = rawCustomer?.data ? rawCustomer.data : rawCustomer || {};

  const isLoading = loadingCustomerApi || loadingJobsApi;

  // Appliance stats
  const applianceStats = React.useMemo(() => {
    const stats = {};
    jobs.forEach((job) => {
      const type = job.applianceType || "General";
      if (!stats[type]) {
        stats[type] = { count: 0, lastDate: null, totalSpent: 0 };
      }
      stats[type].count += 1;
      const date = new Date(job.serviceDate);
      if (!stats[type].lastDate || date > new Date(stats[type].lastDate)) {
        stats[type].lastDate = job.serviceDate;
      }
      stats[type].totalSpent +=
        (parseFloat(job.amount) || 0) +
        (parseFloat(job.diagnosticFee) || 0) +
        (job.partsUsed || []).reduce(
          (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
          0,
        );
    });
    return Object.entries(stats).map(([type, data]) => ({ type, ...data }));
  }, [jobs]);

  // Summary stats
  const totalSpent = React.useMemo(
    () =>
      jobs.reduce(
        (sum, j) =>
          sum +
          (parseFloat(j.amount) || 0) +
          (parseFloat(j.diagnosticFee) || 0) +
          (j.partsUsed || []).reduce(
            (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
            0,
          ),
        0,
      ),
    [jobs],
  );
  const lastServiceDate = React.useMemo(() => {
    if (!jobs.length) return null;
    return jobs.map((j) => new Date(j.serviceDate)).sort((a, b) => b - a)[0];
  }, [jobs]);

  // ── Loading ──
  if (isLoading && !customer?.name) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const primaryLocation =
    Array.isArray(customer.locations) && customer.locations.length > 0
      ? customer.locations[0]
      : null;

  function renderHeader() {
    return (
      <View>
        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            height: 52,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.bgCard,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft color={colors.textPrimary} size={18} />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: "700",
              fontSize: 14,
              color: colors.textPrimary,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Customer Profile
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(RouteNames.CREATE_CUSTOMER, { customer })
            }
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.primaryBg,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Edit3 color={colors.primary} size={16} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Section ── */}
        <LinearGradient
          colors={[colors.primaryBgStrong, colors.bgPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            paddingTop: 28,
            paddingBottom: 24,
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <View style={{ position: "relative", marginBottom: 14 }}>
            <Avatar
              name={customer?.name}
              uri={customer?.avatar || customer?.imageUrl}
              size={84}
              style={{
                borderWidth: 3,
                borderColor: colors.primaryBorderStrong,
                shadowColor: colors.primary,
                shadowOpacity: 0.25,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                backgroundColor: colors.success,
                padding: 4,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: colors.bgPrimary,
              }}
            >
              <CheckCircle2 color="#fff" size={10} />
            </View>
          </View>

          {/* Name */}
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 22,
              fontWeight: "800",
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {customer.name || "Unknown Customer"}
          </Text>

          {/* Phone */}
          <TouchableOpacity
            onPress={() =>
              customer.phone && Linking.openURL(`tel:${customer.phone}`)
            }
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.bgCard,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Phone color={colors.primary} size={13} />
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              {customer.phone || "No phone"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16 }}>
          {/* ── Quick Actions ── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.bgCard,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 16,
              paddingHorizontal: 8,
              marginBottom: 20,
            }}
          >
            <ActionButton
              icon={Phone}
              label="Call"
              colors={colors}
              onPress={() =>
                customer.phone && Linking.openURL(`tel:${customer.phone}`)
              }
            />
            <ActionButton
              icon={NavIcon}
              label="Navigate"
              colors={colors}
              onPress={() =>
                primaryLocation &&
                openDirections(
                  primaryLocation.latitude,
                  primaryLocation.longitude,
                  primaryLocation.address,
                )
              }
            />
            <ActionButton
              icon={CalendarPlus}
              label="Add Job"
              colors={colors}
              primary
              onPress={() =>
                navigation.navigate(RouteNames.ADD_JOB, { customer })
              }
            />
            <ActionButton
              icon={Edit3}
              label="Edit"
              colors={colors}
              onPress={() =>
                navigation.navigate(RouteNames.CREATE_CUSTOMER, { customer })
              }
            />
          </View>

          {/* ── Stats Row ── */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <StatCard
              icon={Briefcase}
              label="Total Jobs"
              value={totalJobCount}
              colors={colors}
              accentColor={colors.primary}
            />
            <StatCard
              icon={IndianRupee}
              label="Total Spent"
              value={formatCurrency(totalSpent)}
              colors={colors}
              accentColor={colors.success}
            />
            <StatCard
              icon={Clock}
              label="Last Service"
              value={lastServiceDate ? formatDateShort(lastServiceDate) : "—"}
              colors={colors}
              accentColor={colors.secondary}
            />
          </View>

          {/* ── Service Locations ── */}
          {(Array.isArray(customer.locations) &&
            customer.locations.length > 0) ||
          customer.address ? (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <MapPin size={14} color={colors.primary} />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Service Locations
                </Text>
                {Array.isArray(customer.locations) &&
                  customer.locations.length > 1 && (
                    <View
                      style={{
                        backgroundColor: colors.primaryBg,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginLeft: "auto",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 10,
                          color: colors.primary,
                        }}
                      >
                        {customer.locations.length} locations
                      </Text>
                    </View>
                  )}
              </View>

              {Array.isArray(customer.locations) &&
              customer.locations.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                  decelerationRate="fast"
                  snapToInterval={240}
                  snapToAlignment="start"
                >
                  {customer.locations.map((loc) => (
                    <View
                      key={loc._id || Math.random().toString()}
                      style={{
                        width: 230,
                        backgroundColor: colors.bgCard,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                      }}
                    >
                      {/* Card header */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          backgroundColor: colors.primaryBg,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <MapPin color={colors.primary} size={12} />
                          <Text
                            style={{
                              fontFamily: "Inter",
                              fontSize: 10,
                              fontWeight: "700",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              color: colors.primary,
                            }}
                          >
                            {loc.label || "Primary"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            openDirections(
                              loc.latitude,
                              loc.longitude,
                              loc.address,
                            )
                          }
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: colors.primary,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <NavIcon color="#fff" size={11} />
                          <Text
                            style={{
                              fontFamily: "Inter",
                              fontSize: 10,
                              fontWeight: "600",
                              color: "#fff",
                            }}
                          >
                            Go
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {/* Address body */}
                      <View style={{ padding: 14, gap: 6 }}>
                        <Text
                          style={{
                            fontFamily: "Inter",
                            color: colors.textPrimary,
                            fontSize: 12,
                            lineHeight: 18,
                          }}
                          numberOfLines={3}
                        >
                          {loc.address || "—"}
                        </Text>
                        {loc.latitude && loc.longitude ? (
                          <Text
                            style={{
                              fontFamily: "Inter",
                              color: colors.textDisabled,
                              fontSize: 10,
                            }}
                          >
                            📍 {loc.latitude.toFixed(4)}°,{" "}
                            {loc.longitude.toFixed(4)}°
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: "Inter",
                              color: colors.textDisabled,
                              fontSize: 10,
                            }}
                          >
                            No GPS pin
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : customer.address ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    backgroundColor: colors.bgCard,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: colors.primaryBg,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin color={colors.primary} size={14} />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color: colors.textMuted,
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 19,
                      marginTop: 6,
                    }}
                  >
                    {customer.address}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Appliance Portfolio ── */}
          {applianceStats.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Wrench size={14} color={colors.primary} />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Appliance History
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              >
                {/* "All" chip */}
                <TouchableOpacity
                  onPress={() => setSelectedAppliance(null)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: !selectedAppliance
                      ? colors.primary
                      : colors.border,
                    backgroundColor: !selectedAppliance
                      ? colors.primaryBg
                      : colors.bgCard,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 12,
                      fontWeight: "700",
                      color: !selectedAppliance
                        ? colors.primary
                        : colors.textMuted,
                    }}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {applianceStats.map((item) => {
                  const active = selectedAppliance === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      onPress={() =>
                        setSelectedAppliance(active ? null : item.type)
                      }
                      activeOpacity={0.75}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active
                          ? colors.primaryBg
                          : colors.bgCard,
                      }}
                    >
                      <Wrench
                        color={active ? colors.primary : colors.textMuted}
                        size={11}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 12,
                          fontWeight: "700",
                          color: active ? colors.primary : colors.textMuted,
                        }}
                      >
                        {item.type}
                      </Text>
                      <View
                        style={{
                          backgroundColor: active
                            ? colors.primary
                            : colors.bgSurface,
                          borderRadius: 8,
                          paddingHorizontal: 5,
                          paddingVertical: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 10,
                            fontWeight: "700",
                            color: active ? "#fff" : colors.textDisabled,
                          }}
                        >
                          {item.count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Job History header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Briefcase size={14} color={colors.primary} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                {selectedAppliance
                  ? `${selectedAppliance} Jobs`
                  : "Job History"}
              </Text>
              {filteredJobs.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.primaryBg,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {filteredJobs.length}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(RouteNames.TABS, {
                  screen: RouteNames.JOB_HISTORY,
                  params: { customerId },
                })
              }
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                View All
              </Text>
              <ChevronRight color={colors.primary} size={13} />
            </TouchableOpacity>
          </View>

          {/* Empty states (only shown when jobs list itself is empty) */}
          {isLoading && jobs.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: 16, marginBottom: 16 }}
            />
          ) : jobs.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 20,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.primaryBorder,
                padding: 32,
                alignItems: "center",
                marginBottom: 40,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.primaryBg,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <CalendarPlus color={colors.primary} size={26} />
              </View>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 16,
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                No Jobs Yet
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.textMuted,
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 19,
                  marginBottom: 20,
                  paddingHorizontal: 10,
                }}
              >
                {"This customer doesn't have any jobs yet. Create the first one!"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(RouteNames.ADD_JOB, { customer })
                }
                activeOpacity={0.75}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 4,
                }}
              >
                <CalendarPlus color="#fff" size={15} />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Create First Job
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <AlertCircle color={colors.textDisabled} size={20} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                No jobs for {selectedAppliance}. Tap the chip above to reset.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top"]}
    >
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListHeaderComponent={renderHeader}
        onScrollBeginDrag={() => {
          hasScrolledRef.current = true;
        }}
        onEndReached={() => {
          if (hasScrolledRef.current && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loadingJobsApi && !isFetchingNextPage && !!jobsData}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item: job }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <JobRow
              job={job}
              colors={colors}
              onPress={() =>
                navigation.navigate(RouteNames.JOB_DETAILS, { job })
              }
            />
          </View>
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
      />

      {/* ── Floating Add Job button ── */}
      {jobs.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 28,
            left: 16,
            right: 16,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(RouteNames.ADD_JOB, { customer })
            }
            activeOpacity={0.85}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 15,
              }}
            >
              <CalendarPlus color="#fff" size={18} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                Schedule New Job
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
