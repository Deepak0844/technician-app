import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Check,
  CheckCircle2,
  XCircle,
  LayoutList,
  CalendarDays,
} from "lucide-react-native";
import { useGetJobsPagedInfiniteQuery } from "@services/api/jobApi";
import Avatar from "@components/Avatar";
import useTheme from "@hooks/useTheme";
import { JobCardSkeleton } from "@components/SkeletonLoaders";
import useDebounce from "@hooks/useDebounce";
import { ApplianceOptions as APPLIANCE_OPTIONS } from "@constants/appConstants";
import JobCard from "@components/JobCard";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { HStack } from "@components/ui/hstack";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const PAYMENT_OPTIONS = [
  { id: undefined, label: "All", Icon: LayoutList },
  { id: true, label: "Paid", Icon: CheckCircle2 },
  { id: false, label: "Unpaid", Icon: XCircle },
];

export default function JobHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [isPaidFilter, setIsPaidFilter] = useState(undefined); // undefined, true, false
  const [applianceFilter, setApplianceFilter] = useState(undefined);
  const [todayOnly, setTodayOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasScrolledRef = useRef(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayStart = useMemo(() => todayStr + "T00:00:00.000Z", [todayStr]);
  const todayEnd = useMemo(() => todayStr + "T23:59:59.999Z", [todayStr]);

  const {
    data: jobsData,
    isLoading: loadingJobs,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetJobsPagedInfiniteQuery({
    search: debouncedSearch,
    customerId: route.params?.customerId,
    isPaid: isPaidFilter,
    applianceType: applianceFilter,
    startDate: todayOnly ? todayStart : undefined,
    endDate: todayOnly ? todayEnd : undefined,
  });

  // Reset scroll guard when filters or search change so a fresh
  // page-1 result never auto-loads page 2 before the user scrolls.
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [debouncedSearch, isPaidFilter, applianceFilter, todayOnly]);

  const onRefresh = React.useCallback(() => {
    hasScrolledRef.current = false;
    refetch();
  }, [refetch]);

  const jobs = useMemo(
    () => jobsData?.pages.flatMap((p) => p.data) ?? [],
    [jobsData],
  );

  function getStatusBorderColor(status) {
    if (status === "completed") return colors.secondary;
    if (status === "cancelled") return colors.danger;
    if (status === "pending") return colors.warning;
    if (status === "in_progress") return colors.primary;
    return colors.border;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top"]}
    >
      <Box style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
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
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 8, marginRight: 8 }}
              activeOpacity={0.7}
            >
              <ArrowLeft color={colors.indigo} size={20} />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                fontWeight: "700",
                color: colors.indigo,
              }}
            >
              {route.params?.customerId ? "Customer History" : "Job History"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.7}
          >
            <Avatar name={user?.name} uri={user?.avatar} size={32} />
          </TouchableOpacity>
        </LinearGradient>

        <Box style={{ flex: 1, padding: 16, paddingBottom: 0 }}>
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 24,
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {route.params?.customerId ? "Service History" : "History"}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                height: 48,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.bgInput,
              }}
            >
              <Search
                color={colors.textSecondary}
                size={18}
                style={{ marginRight: 10 }}
              />
              <Input variant="unstyled" style={{ flex: 1, height: "100%" }}>
                <InputField
                  placeholder="Search jobs..."
                  placeholderTextColor={colors.placeholderText}
                  value={search}
                  onChangeText={setSearch}
                  style={{
                    fontFamily: "Inter",
                    fontSize: 13,
                    color: colors.textPrimary,
                    flex: 1,
                    height: "100%",
                    backgroundColor: "transparent",
                  }}
                />
              </Input>
            </View>
            <TouchableOpacity
              onPress={() => setIsFilterOpen(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor:
                  isFilterOpen ||
                    applianceFilter ||
                    isPaidFilter !== undefined ||
                    todayOnly
                    ? colors.primaryBg
                    : colors.bgInput,
                borderWidth: 1.5,
                borderColor:
                  applianceFilter || isPaidFilter !== undefined || todayOnly
                    ? colors.primaryBorder
                    : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter
                color={
                  applianceFilter || isPaidFilter !== undefined || todayOnly
                    ? colors.primary
                    : colors.textSecondary
                }
                size={20}
              />
            </TouchableOpacity>
          </View>

          {/* Active Filter Chips */}
          {(applianceFilter || isPaidFilter !== undefined || todayOnly) && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {todayOnly && (
                <TouchableOpacity
                  onPress={() => setTodayOnly(false)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.primaryBg,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.primaryBorder,
                    gap: 4,
                  }}
                >
                  <CalendarDays size={11} color={colors.primary} />
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    TODAY
                  </Text>
                  <X size={11} color={colors.primary} />
                </TouchableOpacity>
              )}
              {isPaidFilter !== undefined && (
                <TouchableOpacity
                  onPress={() => setIsPaidFilter(undefined)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.successBg,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.successBorder,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fontWeight: "700",
                      color: colors.success,
                      marginRight: 4,
                    }}
                  >
                    {isPaidFilter ? "PAID" : "UNPAID"}
                  </Text>
                  <X size={12} color={colors.success} />
                </TouchableOpacity>
              )}
              {applianceFilter && (
                <TouchableOpacity
                  onPress={() => setApplianceFilter(undefined)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.primaryBg,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.primaryBorder,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fontWeight: "700",
                      color: colors.primary,
                      marginRight: 4,
                    }}
                  >
                    {applianceFilter}
                  </Text>
                  <X size={12} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={jobs}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
            onScrollBeginDrag={() => {
              hasScrolledRef.current = true;
            }}
            onEndReached={() => {
              if (
                hasScrolledRef.current &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isFetchingNextPage && !!jobsData}
                onRefresh={onRefresh}
                tintColor={colors.indigo}
                colors={[colors.indigo]}
              />
            }
            ListHeaderComponent={
              loadingJobs && (
                <View style={{ marginBottom: 16 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </View>
              )
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator color={colors.indigo} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={() =>
                  navigation.navigate("JobDetails", { job: item })
                }
              />
            )}
            ListEmptyComponent={
              !loadingJobs && (
                <View style={{ alignItems: "center", marginTop: 60 }}>
                  <Search
                    size={48}
                    color={colors.border}
                    style={{ marginBottom: 16 }}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color: colors.textMuted,
                      textAlign: "center",
                      fontWeight: "700",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    No jobs found matching your filters
                  </Text>
                </View>
              )
            }
          />
        </Box>

        {/* Filter Modal — plain Modal gives a real measured height so flex:1 works */}
        <Modal
          visible={isFilterOpen}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setIsFilterOpen(false)}
        >
          {/* Dim backdrop — tap to dismiss */}
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}
            activeOpacity={1}
            onPress={() => setIsFilterOpen(false)}
          />

          {/* Panel with explicit height — the key to making layout reliable */}
          <View
            style={{
              height: SCREEN_HEIGHT * 0.78,
              backgroundColor: colors.bgCard,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Drag indicator */}
            <View
              style={{ alignItems: "center", paddingTop: 10, paddingBottom: 2 }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingTop: 14,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Filters
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsPaidFilter(undefined);
                  setApplianceFilter(undefined);
                  setTodayOnly(false);
                  setIsFilterOpen(false);
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.danger,
                  }}
                >
                  RESET ALL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable content — flex:1 fills all space between header and button */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 24, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Today Jobs toggle */}
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: "800",
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setTodayOnly((v) => !v)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: todayOnly ? colors.primary : colors.border,
                  backgroundColor: todayOnly
                    ? colors.primaryBg
                    : colors.bgSurface,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 28,
                  gap: 10,
                }}
              >
                <HStack style={{ alignItems: "center", gap: 10 }}>
                  <CalendarDays
                    size={20}
                    color={todayOnly ? colors.primary : colors.textMuted}
                  />
                  <View>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 13,
                        fontWeight: "700",
                        color: todayOnly
                          ? colors.primary
                          : colors.textSecondary,
                      }}
                    >
                      Today&apos;s Jobs
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 10,
                        color: colors.textDisabled,
                        marginTop: 1,
                      }}
                    >
                      Show only jobs assigned for today
                    </Text>
                  </View>
                </HStack>
                <View
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: todayOnly ? colors.primary : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 3,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#fff",
                      alignSelf: todayOnly ? "flex-end" : "flex-start",
                    }}
                  />
                </View>
              </TouchableOpacity>

              {/* Payment Status — segmented control */}
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: "800",
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Payment Status
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  overflow: "hidden",
                  marginBottom: 28,
                }}
              >
                {PAYMENT_OPTIONS.map((item, idx) => {
                  const isActive = isPaidFilter === item.id;
                  const activeColor =
                    item.id === false
                      ? colors.danger
                      : item.id === true
                        ? colors.success
                        : colors.primary;
                  const activeBg =
                    item.id === false
                      ? colors.dangerBg
                      : item.id === true
                        ? colors.successBg
                        : colors.primaryBg;
                  const { Icon } = item;
                  return (
                    <TouchableOpacity
                      key={String(item.id)}
                      onPress={() => setIsPaidFilter(item.id)}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        backgroundColor: isActive ? activeBg : "transparent",
                        borderRightWidth:
                          idx < PAYMENT_OPTIONS.length - 1 ? 1 : 0,
                        borderRightColor: colors.border,
                      }}
                    >
                      <Icon
                        size={18}
                        color={isActive ? activeColor : colors.textMuted}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 11,
                          fontWeight: "700",
                          color: isActive ? activeColor : colors.textMuted,
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Appliance Type — 2-column emoji grid */}
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: "800",
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Appliance Type
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {APPLIANCE_OPTIONS.map((item) => {
                  const isActive = applianceFilter === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() =>
                        setApplianceFilter(isActive ? undefined : item.value)
                      }
                      style={{
                        width: "47.5%",
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor: isActive
                          ? colors.primaryBg
                          : colors.bgSurface,
                        borderWidth: 1.5,
                        borderColor: isActive ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 12,
                          fontWeight: "700",
                          color: isActive
                            ? colors.primary
                            : colors.textSecondary,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      {isActive && <Check size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Apply button — always visible, sits outside the ScrollView */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 28,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFilterOpen(false)}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.bgPrimary,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Box>
    </SafeAreaView>
  );
}
