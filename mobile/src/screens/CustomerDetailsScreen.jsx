import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@hooks/useTheme";

// Services
import { useGetCustomerByIdQuery } from "@services/api/customerApi";
import { useGetJobsByCustomerQuery } from "@services/api/jobApi";

// Gluestack Primitives
import { Text } from "@components/ui/text";

// Icons
import { ArrowLeft, Edit, Trash2, Phone, CalendarPlus, CheckCircle2, MapPin, Wrench, User } from "lucide-react-native";
import { Alert } from "react-native";
import { useDeleteCustomerMutation } from "@services/api/customerApi";

export default function CustomerDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { customerId } = route.params;

  // RTK Query
  const { data: custResponse, isLoading: loadingCustomerApi, refetch: refetchCustomer } = useGetCustomerByIdQuery(customerId, { skip: !customerId });
  const { data: jobsResponse, isLoading: loadingJobsApi, refetch: refetchJobs } = useGetJobsByCustomerQuery(customerId, { skip: !customerId });
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCustomer(), refetchJobs()]);
    setRefreshing(false);
  }, [refetchCustomer, refetchJobs]);

  const rawCustomer = custResponse?.data;
  const customer = rawCustomer?.data ? rawCustomer.data : (rawCustomer || {});

  async function handleDelete() {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomer(customerId).unwrap();
              Alert.alert("Success", "Customer deleted successfully.");
              navigation.navigate("Tabs", { screen: "Customers" });
            } catch (err) {
              Alert.alert("Error", err?.data?.message || "Failed to delete customer.");
            }
          }
        }
      ]
    );
  }

  const rawJobs = jobsResponse?.data;
  let jobs = [];
  if (Array.isArray(rawJobs)) {
    jobs = rawJobs;
  } else if (rawJobs && Array.isArray(rawJobs.data)) {
    jobs = rawJobs.data;
  }

  const isLoading = loadingCustomerApi || loadingJobsApi || isDeleting;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (isLoading && !customer.name) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      {/* TopAppBar */}
      <View
        style={{
          width: "100%",
          zIndex: 50,
          backgroundColor: colors.bgSecondary,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          height: 56,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }} activeOpacity={0.7}>
            <ArrowLeft color={colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Space Grotesk", fontWeight: "700", fontSize: 14, color: colors.textPrimary, textTransform: "uppercase" }}>
            Customer Profile
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("CreateCustomer", { customer })} 
            style={{ padding: 8 }} 
            activeOpacity={0.7}
          >
            <Edit color={colors.primary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={{ padding: 8 }} 
            activeOpacity={0.7}
          >
            <Trash2 color={colors.danger} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Profile Section */}
        <View style={{ position: "relative", marginBottom: 32, width: "100%" }}>
          <View
            style={{
              backgroundColor: colors.bgCard,
              padding: 20,
              borderRadius: 24,
              overflow: "hidden",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              shadowColor: colors.primaryMuted,
              shadowOpacity: 0.08,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 20 },
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Background Accents */}
            <View
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 192,
                height: 192,
                backgroundColor: colors.primaryBg,
                borderRadius: 96,
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -80,
                left: -80,
                width: 192,
                height: 192,
                backgroundColor: colors.primaryMuted,
                opacity: 0.2,
                borderRadius: 96,
              }}
            />

            <View style={{ flexDirection: "column", alignItems: "center", gap: 16, zIndex: 10, width: "100%" }}>
              {/* Profile Orb */}
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.primaryBorder,
                    padding: 2,
                    backgroundColor: colors.bgInput,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {customer.imageUrl ? (
                    <Image source={{ uri: customer.imageUrl }} style={{ width: "100%", height: "100%", borderRadius: 40 }} />
                  ) : (
                    <View style={{ width: "100%", height: "100%", backgroundColor: colors.bgCard, borderRadius: 40, alignItems: "center", justifyContent: "center" }}>
                      <User color={colors.primary} size={32} />
                    </View>
                  )}
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: colors.secondary,
                    padding: 6,
                    borderRadius: 999,
                    shadowColor: colors.secondary,
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <CheckCircle2 color={colors.bgPrimary} size={12} />
                </View>
              </View>

              {/* Customer Info */}
              <View style={{ flex: 1, alignItems: "center", width: "100%" }}>
                <Text style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 4, textAlign: "center" }}>
                  {customer.name || "Unknown Customer"}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, width: "100%" }}>
                  <Phone color={colors.secondary} size={14} />
                  <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 14 }}>
                    {customer.phone || "No phone provided"}
                  </Text>
                </View>

                {!!customer.address && (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, width: "100%", paddingHorizontal: 8 }}>
                    <MapPin color={colors.textMuted} size={14} />
                    <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 12, textAlign: "center", lineHeight: 18 }}>
                      {customer.address}
                    </Text>
                  </View>
                )}

                {/* Jobs Badge */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, width: "100%" }}>
                  <View style={{ backgroundColor: colors.primaryBg, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontFamily: "Space Grotesk", fontWeight: "700", color: colors.primary, fontSize: 14 }}>
                      {jobs.length}
                    </Text>
                    <Text style={{ fontFamily: "Inter", fontSize: 9, textTransform: "uppercase", fontWeight: "700", letterSpacing: 4, color: colors.primary, opacity: 0.7 }}>
                      Jobs
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Add Job Button */}
            <View style={{ marginTop: 8, flexDirection: "row", width: "100%", zIndex: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddJob", { customer })}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  overflow: "hidden",
                  shadowColor: colors.primary,
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16 }}
                >
                  <CalendarPlus color={colors.bgPrimary} size={18} />
                  <Text style={{ fontFamily: "Space Grotesk", color: colors.bgPrimary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, fontSize: 12 }}>
                    Add Job
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Job History */}
        <View style={{ marginBottom: 40, width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary, textTransform: "uppercase", letterSpacing: 2 }}>
                Job History
              </Text>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.secondary,
                  shadowColor: colors.secondary,
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Tabs", { screen: "JobHistory", params: { customerId } })}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: "Inter", color: colors.primary, letterSpacing: 2, fontWeight: "700", textTransform: "uppercase", fontSize: 10 }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && jobs.length === 0 ? (
            <ActivityIndicator size="small" color={colors.secondary} style={{ marginTop: 16 }} />
          ) : jobs.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.bgInput,
                padding: 32,
                borderRadius: 24,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.primaryBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ width: 64, height: 64, backgroundColor: colors.primaryBg, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CalendarPlus color={colors.primary} size={32} />
              </View>
              <Text style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontWeight: "700", fontSize: 18, marginBottom: 8, textAlign: "center" }}>
                No Jobs Found
              </Text>
              <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: 24, paddingHorizontal: 16 }}>
                This customer does not have any jobs yet.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddJob", { customer })}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.primaryBg,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.primaryBorder,
                }}
              >
                <Text style={{ fontFamily: "Space Grotesk", color: colors.primary, fontWeight: "700", fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>
                  Create First Job
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "column", width: "100%" }}>
              {jobs.map((job) => {
                const isCompleted = job.status === "completed";
                const accentColor = isCompleted ? colors.primary : colors.secondary;
                const accentBg = isCompleted ? colors.primaryBg : colors.secondaryBg;

                return (
                  <TouchableOpacity
                    key={job._id || Math.random().toString()}
                    onPress={() => navigation.navigate("JobDetails", { job })}
                    activeOpacity={0.7}
                    style={{
                      padding: 16,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: colors.bgInput,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: isCompleted ? 0.8 : 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, flex: 1 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: accentBg }}>
                        <Wrench color={accentColor} size={20} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "Space Grotesk", fontWeight: "700", color: colors.textPrimary, fontSize: 16 }} numberOfLines={1}>
                          {job?.applianceType || "General Service"}
                        </Text>
                        <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
                          {formatDate(job?.serviceDate)} • #{job?._id ? job._id.substring(0, 6).toUpperCase() : "..."}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end", gap: 6, marginLeft: 8 }}>
                      <Text style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}>
                        ₹{job.amount || "0.00"}
                      </Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.border, backgroundColor: accentBg }}>
                        <Text style={{ fontFamily: "Inter", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, color: accentColor }}>
                          {job.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
