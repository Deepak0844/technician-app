import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { FlatList, View, TouchableOpacity, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ArrowLeft, Search, Filter, X, Check } from "lucide-react-native";
import { useGetJobsQuery } from "@services/api/jobApi";
import Avatar from "@components/Avatar";
import { formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";
import { JobCardSkeleton } from "@components/SkeletonLoaders";
import { ApplianceTypes } from "@constants/appConstants";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { HStack } from "@components/ui/hstack";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";

export default function JobHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState(undefined); // undefined, true, false
  const [applianceFilter, setApplianceFilter] = useState(undefined);
  const bottomSheetRef = React.useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: jobsResponse,
    isLoading: loadingJobs,
    refetch,
  } = useGetJobsQuery({
    search: debouncedSearch,
    customerId: route.params?.customerId,
    isPaid: isPaidFilter,
    applianceType: applianceFilter,
  });

  const onRefresh = React.useCallback(async () => {
    refetch();
  }, [refetch]);

  const allJobs = jobsResponse?.data || [];

  function getStatusColor(status) {
    if (status === "completed") return colors.secondary;
    if (status === "pending") return colors.warning;
    if (status === "cancelled") return colors.danger;
    return colors.primary;
  }

  function getStatusBorderColor(status) {
    if (status === "completed") return colors.secondary;
    if (status === "cancelled") return colors.danger;
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
            height: 56,
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
              onPress={() => bottomSheetRef.current?.expand()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor:
                  isFilterOpen || applianceFilter || isPaidFilter !== undefined
                    ? colors.primaryBg
                    : colors.bgInput,
                borderWidth: 1.5,
                borderColor:
                  applianceFilter || isPaidFilter !== undefined
                    ? colors.primaryBorder
                    : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter
                color={
                  applianceFilter || isPaidFilter !== undefined
                    ? colors.primary
                    : colors.textSecondary
                }
                size={20}
              />
            </TouchableOpacity>
          </View>

          {/* Active Filter Chips */}
          {(applianceFilter || isPaidFilter !== undefined) && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
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
            data={allJobs}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
            refreshControl={
              <RefreshControl
                refreshing={false}
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
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("JobDetails", { job: item })}
              >
                <View
                  style={{
                    backgroundColor: colors.bgCardAlt,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusBorderColor(item.status),
                  }}
                >
                  <HStack
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <HStack style={{ alignItems: "center", gap: 8 }}>
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {item.customerId?.name ||
                          item.customerName ||
                          "Customer"}
                      </Text>
                      {item.priority === "urgent" && (
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
                    </HStack>
                    <HStack space="sm" style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontFamily: "Space Grotesk",
                          fontSize: 10,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          color: getStatusColor(item.status),
                        }}
                      >
                        {item.status?.replace("_", " ")}
                      </Text>
                    </HStack>
                  </HStack>

                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 14,
                      color: colors.primary,
                      fontWeight: "700",
                      letterSpacing: 1,
                      marginBottom: 16,
                    }}
                  >
                    {item.applianceType}
                    {item.issue ? (
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 12,
                          color: colors.textMuted,
                          fontWeight: "500",
                        }}
                      >
                        {" "}
                        • {item.issue}
                      </Text>
                    ) : null}
                  </Text>

                  <HStack
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Space Grotesk",
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 10,
                        color: colors.textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                      }}
                    >
                      #{item._id.substring(0, 6).toUpperCase()}
                    </Text>
                  </HStack>
                </View>
              </TouchableOpacity>
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

        {/* Filter Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["60%", "85%"]}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: colors.bgCard }}
          handleIndicatorStyle={{ backgroundColor: colors.border }}
          onChange={(index) => setIsFilterOpen(index >= 0)}
        >
          <BottomSheetView style={{ padding: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 20,
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
                  bottomSheetRef.current?.close();
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

            {/* Payment Filter */}
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
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 32 }}>
              {[
                { id: undefined, label: "All" },
                { id: true, label: "Paid" },
                { id: false, label: "Unpaid" },
              ].map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  onPress={() => setIsPaidFilter(item.id)}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      isPaidFilter === item.id
                        ? colors.successBg
                        : colors.bgSurface,
                    borderWidth: 1.5,
                    borderColor:
                      isPaidFilter === item.id ? colors.success : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 12,
                      fontWeight: "700",
                      color:
                        isPaidFilter === item.id
                          ? colors.success
                          : colors.textPrimary,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Appliance Filter */}
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
              {ApplianceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    setApplianceFilter(
                      applianceFilter === type ? undefined : type,
                    )
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor:
                      applianceFilter === type
                        ? colors.primaryBg
                        : colors.bgSurface,
                    borderWidth: 1.5,
                    borderColor:
                      applianceFilter === type ? colors.primary : colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 12,
                      fontWeight: "700",
                      color:
                        applianceFilter === type
                          ? colors.primary
                          : colors.textPrimary,
                    }}
                  >
                    {type}
                  </Text>
                  {applianceFilter === type && (
                    <Check size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => bottomSheetRef.current?.close()}
              style={{
                width: "100%",
                height: 56,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 40,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.bgPrimary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Apply Filters
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </Box>
    </SafeAreaView>
  );
}
