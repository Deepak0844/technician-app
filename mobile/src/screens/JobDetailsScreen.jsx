import React from "react";
import { ScrollView, View, TouchableOpacity, Text, ActivityIndicator, Linking, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft, User, Phone, MapPin, Wrench, Clock, FileText,
  CheckCircle2, MoreVertical, Edit2, ShieldCheck,
} from "lucide-react-native";
import { useGetJobByIdQuery } from "@services/api/jobApi";
import OfflineBanner from "@components/OfflineBanner";
import { formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";

export default function JobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { job: initialJob } = route.params ?? {};

  const { data: jobResponse, isLoading, refetch, isFetching } = useGetJobByIdQuery(initialJob?._id, {
    skip: !initialJob?._id,
  });

  const job = jobResponse?.data || initialJob;

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.textPrimary }}>No job data provided.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading && !isFetching) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const isCompleted = job.status === "completed";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <OfflineBanner />

      {/* Top Header */}
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }} activeOpacity={0.7}>
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.primary }}>
          Job Details
        </Text>
        <TouchableOpacity style={{ padding: 8 }} activeOpacity={0.7}>
          <MoreVertical color={colors.primary} size={20} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isFetching && !isLoading} 
            onRefresh={refetch} 
            tintColor={colors.primary} 
            colors={[colors.primary]}
          />
        }
      >

        {/* Job Header Card */}
        <View
          style={{
            backgroundColor: colors.bgCardAlt,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.borderLight,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -48,
              right: -48,
              width: 128,
              height: 128,
              backgroundColor: colors.primaryBg,
              borderRadius: 64,
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <View>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 10, fontWeight: "700", color: colors.secondary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                Job ID: #{job?._id ? job._id.slice(-6).toUpperCase() : "..."}
              </Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 24, fontWeight: "700", color: colors.textPrimary }}>
                {job?.applianceType || "General Service"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isCompleted ? colors.success : colors.warningIcon,
                }}
              />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: isCompleted ? colors.success : colors.warningIcon,
                }}
              >
                {job?.status || "Pending"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock color={colors.textMuted} size={14} />
            <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted }}>
              {job?.serviceDate ? new Date(job.serviceDate).toLocaleString() : "Date not set"}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, width: "100%", marginVertical: 16 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                Amount
              </Text>
              <Text style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "700", color: colors.primary }}>
                {formatCurrency(job?.amount)}
              </Text>
              {job?.amount === 0 && !!job?.diagnosticFee && (
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                  (Diag. Fee: {formatCurrency(job?.diagnosticFee)})
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Customer Details Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 16 }}>
            Customer Details
          </Text>
          <View
            style={{
              backgroundColor: colors.bgCardAlt,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity 
              onPress={() => {
                const customerId = job?.customerId?._id || job?.customerId;
                if (customerId) navigation.navigate("CustomerDetails", { customerId });
              }}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.primaryBorder,
                }}
              >
                <User color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.textPrimary }}>
                  {job?.customerId?.name || job?.customerName || "Unknown Customer"}
                </Text>
                <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.textMuted }}>Click to view profile</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                const phone = job?.customerId?.phone || job?.customerPhone;
                if (phone) Linking.openURL(`tel:${phone}`);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}
            >
              <Phone color={colors.secondary} size={16} />
              <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textSecondary }}>
                {job?.customerId?.phone || job?.customerPhone || "N/A"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                const loc = job?.location;
                if (!loc) return;
                
                if (loc.latitude && loc.longitude) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`);
                } else if (loc.address) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`);
                }
              }}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
            >
              <MapPin color={job?.location ? colors.primary : colors.textMuted} size={16} />
              <Text style={{ fontFamily: "Inter", fontSize: 14, color: job?.location ? colors.textPrimary : colors.textMuted, flex: 1, lineHeight: 20 }}>
                {job?.location?.address || "Job Location Details will appear here. No address stored for this job locally."}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Details Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 16 }}>
            Job Details
          </Text>
          <View
            style={{
              backgroundColor: colors.bgCardAlt,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.secondaryBorder,
                }}
              >
                <Wrench color={colors.secondary} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                  Issue
                </Text>
                <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textPrimary, lineHeight: 24 }}>
                  {job?.issue || "None specified"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.successBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.successBorder,
                }}
              >
                <CheckCircle2 color={colors.success} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                  Resolution
                </Text>
                <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textPrimary, lineHeight: 24 }}>
                  {job?.serviceDone || "No resolution details provided yet."}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.secondaryBorder,
                }}
              >
                <ShieldCheck color={colors.secondary} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                  Warranty
                </Text>
                <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textPrimary, lineHeight: 24 }}>
                  {job?.warranty || "No warranty specified."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("InvoicePreview", { job })}
            activeOpacity={0.8}
            style={{
              flex: 1,
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 }}
            >
              <FileText color={colors.bgPrimary} size={20} />
              <Text style={{ fontFamily: "Space Grotesk", color: colors.bgPrimary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, fontSize: 12 }}>
                View Invoice
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("AddJob", { job })}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.bgCard,
              borderWidth: 1,
              borderColor: colors.borderLight,
              height: 56,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Edit2 color={colors.secondary} size={20} />
            <Text style={{ fontFamily: "Space Grotesk", color: colors.secondary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, fontSize: 12 }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
