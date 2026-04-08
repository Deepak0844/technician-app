import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { FlatList, View, TouchableOpacity, RefreshControl, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Search } from "lucide-react-native";
import { useGetJobsQuery } from "@services/api/jobApi";
import OfflineBanner from "@components/OfflineBanner";
import { formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { Box } from "@components/ui/box";
import { HStack } from "@components/ui/hstack";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";

export default function JobHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");

  const {
    data: jobsResponse,
    isLoading: loadingJobs,
    refetch,
  } = useGetJobsQuery({
    search,
    customerId: route.params?.customerId,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <Box style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
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
            <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.indigo }}>
              {route.params?.customerId ? "Customer History" : "Job History"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                overflow: "hidden",
                backgroundColor: colors.bgCard,
              }}
            >
              <Image
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9k07pUQ5I8oDft0RhiEuNAOnETFQkZQOF1b4yIswjopEikbSN_q05-g8AZiCuzkefDJEjZLCnu7U1kJnkroXT2Ga-b9zR2MC_bNQz52LkNjRGVdUbFcRQJJNWU8jimcNpH8Dz349aAQ11mymu0xVJZiGA2VZMrsI0O1h1Ckf6rxoeF0nmy6L0-kRt0JucvnoGbsmeCZSVDe2l353SISMovSkNjUUmhOMiCemKzCgccbAq9junYSEYduFz-u5se8_ULqheeUEM-vn" }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <Box style={{ flex: 1, padding: 16, paddingBottom: 0 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 24, fontWeight: "700", color: colors.textPrimary }}>
              {route.params?.customerId ? "Service History" : "History"}
            </Text>
          </View>

          {/* Search Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              height: 56,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.borderInput,
              backgroundColor: colors.bgInput,
              marginBottom: 24,
            }}
          >
            <Search color={colors.textSecondary} size={20} style={{ marginRight: 12 }} />
            <Input variant="unstyled" style={{ flex: 1, height: "100%" }}>
              <InputField
                placeholder="Search specific jobs..."
                placeholderTextColor={colors.placeholderText}
                value={search}
                onChangeText={setSearch}
                style={{ fontFamily: "Inter", fontSize: 14, color: colors.textPrimary, flex: 1, height: "100%", backgroundColor: "transparent" }}
              />
            </Input>
          </View>

          <FlatList
            data={allJobs}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
            refreshControl={
              <RefreshControl
                refreshing={loadingJobs}
                onRefresh={onRefresh}
                tintColor={colors.indigo}
                colors={[colors.indigo]}
              />
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
                  <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.textPrimary }} numberOfLines={1}>
                      {item.customerId?.name || item.customerName || "Customer"}
                    </Text>
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

                  <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, color: colors.primary, fontWeight: "700", letterSpacing: 1, marginBottom: 16 }}>
                    {item.applianceType}
                    {item.issue ? (
                      <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted, fontWeight: "500" }}>
                        {" "}• {item.issue}
                      </Text>
                    ) : null}
                  </Text>

                  <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 2 }}>
                      #{item._id.substring(0, 6).toUpperCase()}
                    </Text>
                  </HStack>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.textMuted,
                  textAlign: "center",
                  fontWeight: "700",
                  marginTop: 40,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
              >
                No jobs found
              </Text>
            }
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
}
