import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Image, RefreshControl, Alert, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@hooks/useTheme";

// Services
import { useGetCustomerByIdQuery, useDeleteCustomerMutation } from "@services/api/customerApi";
import { useGetJobsByCustomerQuery } from "@services/api/jobApi";

// Gluestack Primitives
import { Text } from "@components/ui/text";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  CalendarPlus,
  CheckCircle2,
  Wrench,
  User,
  Navigation as NavIcon,
  MapPin
} from "lucide-react-native";

import { openDirections } from "@utils/locationUtils";
import Avatar from "@components/Avatar";
import { formatDate } from "@utils/formatUtils";

export default function CustomerDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { customerId } = route.params;

  // RTK Query
  const { data: custResponse, isLoading: loadingCustomerApi, refetch: refetchCustomer } = useGetCustomerByIdQuery(customerId, { skip: !customerId });
  const { data: jobsResponse, isLoading: loadingJobsApi, refetch: refetchJobs } = useGetJobsByCustomerQuery(customerId, { skip: !customerId });
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const [selectedAppliance, setSelectedAppliance] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const rawJobs = jobsResponse?.data;
  const jobs = React.useMemo(() => {
    if (Array.isArray(rawJobs)) return rawJobs;
    if (rawJobs && Array.isArray(rawJobs.data)) return rawJobs.data;
    return [];
  }, [rawJobs]);

  const filteredJobs = React.useMemo(() => {
    if (!selectedAppliance) return jobs;
    return jobs.filter(j => (j.applianceType || "General") === selectedAppliance);
  }, [jobs, selectedAppliance]);

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

  const isLoading = loadingCustomerApi || loadingJobsApi || isDeleting;

  // Calculate Appliance Portfolio
  const applianceStats = React.useMemo(() => {
    const stats = {};
    jobs.forEach(job => {
      const type = job.applianceType || "General";
      if (!stats[type]) {
        stats[type] = { count: 0, lastDate: null, totalSpent: 0 };
      }
      stats[type].count += 1;
      const date = new Date(job.serviceDate);
      if (!stats[type].lastDate || date > new Date(stats[type].lastDate)) {
        stats[type].lastDate = job.serviceDate;
      }
      stats[type].totalSpent += (parseFloat(job.amount) || 0);
    });
    return Object.entries(stats).map(([type, data]) => ({ type, ...data }));
  }, [jobs]);

  if (isLoading && !customer?.name) {
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
                <Avatar 
                  name={customer?.name} 
                  uri={customer?.avatar || customer?.imageUrl} 
                  size={80} 
                  style={{ 
                    borderWidth: 2, 
                    borderColor: colors.secondary,
                    shadowColor: colors.secondary,
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 0 }
                  }} 
                />
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
                <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "800", color: colors.textPrimary, marginBottom: 4, textAlign: "center" }}>
                  {customer.name || "Unknown Customer"}
                </Text>

                <TouchableOpacity
                  onPress={() => customer.phone && Linking.openURL(`tel:${customer.phone}`)}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, width: "100%" }}
                >
                  <Phone color={colors.secondary} size={14} />
                  <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 13 }}>
                    {customer.phone || "No phone provided"}
                  </Text>
                </TouchableOpacity>

                {/* Appliance Ledger Statistics */}
                <View style={{ width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
                  {applianceStats.length === 0 ? (
                    <Text style={{ fontFamily: "Inter", fontSize: 11, color: colors.textDisabled }}>No appliance history yet.</Text>
                  ) : applianceStats.map((stat) => (
                    <View 
                      key={stat.type} 
                      style={{ 
                        backgroundColor: colors.bgSurface, 
                        paddingHorizontal: 10, 
                        paddingVertical: 6, 
                        borderRadius: 12, 
                        borderWidth: 1, 
                        borderColor: colors.borderLight,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Text style={{ fontFamily: "Inter", fontSize: 10, fontWeight: "700", color: colors.textPrimary }}>{stat.type}</Text>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.secondary, opacity: 0.5 }} />
                      <Text style={{ fontFamily: "Inter", fontSize: 9, fontWeight: "600", color: colors.primary }}>{stat.count}x</Text>
                    </View>
                  ))}
                </View>

          </View>
        </View>
      </View>
    </View>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MapPin size={13} color={colors.textDisabled} />
              <Text style={{
                fontFamily: "Inter",
                fontSize: 9,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 4,
                color: colors.textDisabled,
              }}>
                Service Locations
              </Text>
            </View>
            {Array.isArray(customer.locations) && customer.locations.length > 1 && (
              <Text style={{ fontFamily: "Inter", fontSize: 9, color: colors.textDisabled }}>
                {customer.locations.length} locations  •  swipe →
              </Text>
            )}
          </View>

          {Array.isArray(customer.locations) && customer.locations.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              decelerationRate="fast"
              snapToInterval={230}
              snapToAlignment="start"
            >
              {customer.locations.map((loc) => (
                <View
                  key={loc._id || Math.random().toString()}
                  style={{
                    width: 220,
                    backgroundColor: colors.bgCard,
                    borderRadius: 18,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 10,
                  }}
                >
                  {/* Top row: pin icon + label + navigate button */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin color={colors.primary} size={16} />
                    </View>
                    <Text style={{ fontFamily: "Inter", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3, color: colors.secondary, flex: 1 }}>
                      {loc.label || "Primary"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openDirections(loc.latitude, loc.longitude, loc.address)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 5,
                      }}
                    >
                      <NavIcon color="#fff" size={15} />
                    </TouchableOpacity>
                  </View>

                  {/* Address */}
                  <Text style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 12, lineHeight: 18 }} numberOfLines={3}>
                    {loc.address || "—"}
                  </Text>

                  {/* Coordinates */}
                  {loc.latitude && loc.longitude ? (
                    <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 9, marginTop: -4 }}>
                      {loc.latitude.toFixed(4)}° N · {loc.longitude.toFixed(4)}° E
                    </Text>
                  ) : (
                    <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 9, marginTop: -4 }}>No GPS pin</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : customer.address ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.bgCard, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border }}>
              <MapPin color={colors.textMuted} size={16} />
              <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 13, flex: 1, lineHeight: 19 }}>
                {customer.address}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Appliance Portfolio Section */}
        {applianceStats.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingHorizontal: 4 }}>
              <Wrench size={13} color={colors.textDisabled} />
              <Text style={{
                fontFamily: "Inter",
                fontSize: 9,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 4,
                color: colors.textDisabled,
              }}>
                Appliance History
              </Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
              {applianceStats.map((item) => (
                <TouchableOpacity 
                  key={item.type}
                  onPress={() => setSelectedAppliance(selectedAppliance === item.type ? null : item.type)}
                  activeOpacity={0.7}
                  style={{ 
                    width: 160, 
                    backgroundColor: selectedAppliance === item.type ? colors.primaryBg : colors.bgSurface, 
                    borderRadius: 20, 
                    padding: 16, 
                    borderWidth: 1, 
                    borderColor: selectedAppliance === item.type ? colors.primary : colors.border,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: selectedAppliance === item.type ? colors.bgPrimary : colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Wrench color={selectedAppliance === item.type ? colors.primary : colors.primary} size={16} />
                  </View>
                  <Text style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: '700', color: selectedAppliance === item.type ? colors.primary : colors.textPrimary, marginBottom: 4 }}>{item.type}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, color: selectedAppliance === item.type ? colors.primary : colors.textMuted, marginBottom: 12 }}>{item.count} service{item.count > 1 ? 's' : ''}</Text>
                  
                  <View style={{ borderTopWidth: 1, borderTopColor: selectedAppliance === item.type ? colors.primaryBorder : colors.border, paddingTop: 10 }}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 8, color: selectedAppliance === item.type ? colors.primary : colors.textDisabled, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Last Service</Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: selectedAppliance === item.type ? colors.primary : colors.secondary }}>{formatDate(item.lastDate).split(',')[0]}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddJob", { customer })}
            activeOpacity={0.8}
            style={{
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: colors.primary,
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 }}
            >
              <CalendarPlus color="#fff" size={18} />
              <Text style={{ fontFamily: "Space Grotesk", color: "#fff", fontWeight: "700", textTransform: "uppercase", letterSpacing: 3, fontSize: 13 }}>
                Add Job
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 40, width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary, textTransform: "uppercase", letterSpacing: 2 }}>
                {selectedAppliance ? `${selectedAppliance} History` : "Job History"}
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
              {filteredJobs.map((job) => {
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
