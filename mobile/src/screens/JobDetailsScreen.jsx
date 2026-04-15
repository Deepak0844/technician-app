import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Wrench,
  Clock,
  FileText,
  CheckCircle2,
  MoreVertical,
  Edit2,
  ShieldCheck,
  Info,
} from "lucide-react-native";
import {
  useGetJobByIdQuery,
  useDeleteJobMutation,
  useRepeatJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import { JobStatuses, PriorityLevels } from "@constants/appConstants";
import { RouteNames } from "@constants/routeNames";
import { formatCurrency } from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";

export default function JobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { job: initialJob } = route.params ?? {};

  const {
    data: jobResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetJobByIdQuery(initialJob?._id, {
    skip: !initialJob?._id,
  });

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [repeatJob, { isLoading: isRepeating }] = useRepeatJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const isSyncing = isDeleting || isRepeating || isUpdating;

  const job = jobResponse?.data || initialJob;

  if (!job) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.textPrimary }}>No job data provided.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading && !isFetching) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const isCompleted = job.status === JobStatuses.COMPLETED;

  const handleJobActions = () => {
    const isJobPaid = !!job.isPaid;
    Alert.alert("Job Actions", "Manage this job record and lifecycle.", [
      { text: "Cancel", style: "cancel" },
      {
        text: isJobPaid ? "Mark as UNPAID" : "Mark as PAID",
        onPress: async () => {
          try {
            await updateJob({ id: job._id, isPaid: !isJobPaid }).unwrap();
            Alert.alert(
              "Success",
              `Job marked as ${!isJobPaid ? "PAID" : "UNPAID"}`,
            );
          } catch (_err) {
            Alert.alert("Error", "Failed to update payment status.");
          }
        },
      },
      {
        text: "Repeat Job",
        onPress: async () => {
          try {
            const res = await repeatJob(job._id).unwrap();
            Alert.alert(
              "Success",
              "A new pending job has been created with this job's details.",
            );
            navigation.navigate(RouteNames.JOB_DETAILS, { job: res.data });
          } catch (err) {
            Alert.alert("Error", err?.data?.message || "Failed to repeat job.");
          }
        },
      },
      {
        text: "Delete Job",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to permanently delete this job?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete Permanently",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteJob(job._id).unwrap();
                    Alert.alert("Deleted", "Job deleted successfully.");
                    navigation.goBack();
                  } catch (_err) {
                    Alert.alert("Error", "Failed to delete job.");
                  }
                },
              },
            ],
          );
        },
      },
    ]);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateJob({ id: job._id, status: newStatus }).unwrap();
      Alert.alert(
        "Success",
        `Status updated to ${newStatus.replace("_", " ")}`,
      );
    } catch (_err) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top"]}
    >
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8, marginRight: 8 }}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.primary} size={20} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "700",
            color: colors.primary,
          }}
        >
          Job Details
        </Text>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={handleJobActions}
          activeOpacity={0.7}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MoreVertical color={colors.primary} size={20} />
          )}
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
        {/* Quick Lifecycle Action - Zero-Tap Workflow */}
        {!isCompleted && !isSyncing && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              handleUpdateStatus(
                job.status === JobStatuses.PENDING
                  ? JobStatuses.IN_PROGRESS
                  : JobStatuses.COMPLETED,
              )
            }
            style={{
              marginBottom: 24,
              borderRadius: 12,
              overflow: "hidden",
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={
                job.status === JobStatuses.PENDING
                  ? [colors.primary, colors.secondary]
                  : [colors.secondary, "#10b981"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                gap: 10,
              }}
            >
              {job.status === JobStatuses.PENDING ? (
                <>
                  <Clock color={colors.bgPrimary} size={18} />
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 13,
                      fontWeight: "800",
                      color: colors.bgPrimary,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Resume / Start Job
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle2 color={colors.bgPrimary} size={18} />
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 13,
                      fontWeight: "800",
                      color: colors.bgPrimary,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Mark as Completed
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
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
                  fontSize: 10,
                  fontWeight: "700",
                  color: colors.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Job ID: #{job?._id ? job._id.slice(-6).toUpperCase() : "..."}
              </Text>
              {job?.priority === PriorityLevels.URGENT && (
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
                      fontSize: 8,
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
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 24,
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {job?.applianceType || "General Service"}
            </Text>
            <View style={{ gap: 6, alignItems: "flex-end" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isCompleted
                      ? colors.success
                      : colors.warningIcon,
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

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: job?.isPaid
                      ? colors.success
                      : colors.danger,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 10,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: job?.isPaid ? colors.success : colors.danger,
                  }}
                >
                  {job?.isPaid ? "Paid" : "Unpaid"}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Clock color={colors.textMuted} size={14} />
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {job?.serviceDate
                ? new Date(job.serviceDate).toLocaleString()
                : "Date not set"}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              width: "100%",
              marginVertical: 16,
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
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                Total Job Amount
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 28,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {formatCurrency(job?.amount)}
                </Text>
                {job?.partsUsed?.length > 0 && (
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      color: colors.textMuted,
                    }}
                  >
                    (incl. spares)
                  </Text>
                )}
              </View>
              {job?.partsUsed?.length > 0 && (
                <View style={{ marginTop: 8, gap: 2 }}>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      color: colors.textSecondary,
                    }}
                  >
                    Labor:{" "}
                    {formatCurrency(
                      job?.amount -
                        job.partsUsed.reduce(
                          (acc, p) => acc + p.price * p.quantity,
                          0,
                        ),
                    )}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      color: colors.textSecondary,
                    }}
                  >
                    Spares:{" "}
                    {formatCurrency(
                      job.partsUsed.reduce(
                        (acc, p) => acc + p.price * p.quantity,
                        0,
                      ),
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Parts Section (If any) */}
        {job?.partsUsed?.length > 0 && (
          <View style={{ marginBottom: 24 }}>
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
                Parts & Materials
              </Text>
              <View
                style={{
                  backgroundColor: colors.secondaryBg,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 9,
                    fontWeight: "700",
                    color: colors.secondary,
                  }}
                >
                  {job.partsUsed.length} ITEMS
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.bgCardAlt,
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 12,
              }}
            >
              {job.partsUsed.map((part, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: idx === job.partsUsed.length - 1 ? 0 : 12,
                    borderBottomWidth: idx === job.partsUsed.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      {part.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 10,
                          color: colors.textMuted,
                        }}
                      >
                        Qty: {part.quantity}
                      </Text>
                      {part.warranty && (
                        <>
                          <View
                            style={{
                              width: 2,
                              height: 2,
                              borderRadius: 1,
                              backgroundColor: colors.textMuted,
                            }}
                          />
                          <ShieldCheck size={10} color={colors.secondary} />
                          <Text
                            style={{
                              fontFamily: "Inter",
                              fontSize: 10,
                              color: colors.secondary,
                            }}
                          >
                            {part.warranty}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    {formatCurrency(part.price * part.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Customer Details Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 16,
            }}
          >
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
                if (customerId)
                  navigation.navigate(RouteNames.CUSTOMER_DETAILS, {
                    customerId,
                  });
              }}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
              }}
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
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  {job?.customerId?.name ||
                    job?.customerName ||
                    "Unknown Customer"}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  Click to view profile
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const phone = job?.customerId?.phone || job?.customerPhone;
                if (phone) Linking.openURL(`tel:${phone}`);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Phone color={colors.secondary} size={16} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                {job?.customerId?.phone || job?.customerPhone || "N/A"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const loc = job?.location;
                if (!loc) return;

                if (loc.latitude && loc.longitude) {
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`,
                  );
                } else if (loc.address) {
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`,
                  );
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <MapPin
                color={job?.location ? colors.primary : colors.textMuted}
                size={16}
              />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  color: job?.location ? colors.textPrimary : colors.textMuted,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {job?.location?.address ||
                  "Job Location Details will appear here. No address stored for this job locally."}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Details Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 16,
            }}
          >
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 24,
              }}
            >
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
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  Issue
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                    lineHeight: 24,
                  }}
                >
                  {job?.issue || "None specified"}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 24,
              }}
            >
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
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  Resolution
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                    lineHeight: 24,
                  }}
                >
                  {job?.serviceDone || "No resolution details provided yet."}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
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
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  Warranty
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                    lineHeight: 24,
                  }}
                >
                  {job?.warranty || "No warranty specified."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technician Private Workspace */}
        {job?.internalNotes && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.secondary,
                }}
              >
                Technician Workspace
              </Text>
              <View
                style={{
                  backgroundColor: colors.secondaryBorder,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: "800",
                    color: colors.secondary,
                    textTransform: "uppercase",
                  }}
                >
                  PRIVATE
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.bgCardAlt,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.secondaryBorder,
                borderStyle: "dashed",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <View style={{ marginTop: 2 }}>
                  <Info size={16} color={colors.secondary} />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 14,
                    color: colors.textPrimary,
                    lineHeight: 22,
                    flex: 1,
                  }}
                >
                  {job.internalNotes}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(RouteNames.INVOICE_PREVIEW, { job })
            }
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
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 16,
              }}
            >
              <FileText color={colors.bgPrimary} size={20} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.bgPrimary,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontSize: 12,
                }}
              >
                View Invoice
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate(RouteNames.ADD_JOB, { job })}
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
            <Text
              style={{
                fontFamily: "Space Grotesk",
                color: colors.secondary,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontSize: 12,
              }}
            >
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Status Change Actions */}
        {(job.status === JobStatuses.PENDING ||
          job.status === JobStatuses.IN_PROGRESS) && (
          <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
            {job.status === JobStatuses.PENDING && (
              <TouchableOpacity
                onPress={() => handleUpdateStatus(JobStatuses.IN_PROGRESS)}
                disabled={isSyncing}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: colors.warningBg,
                  borderWidth: 1,
                  borderColor: colors.warningBorder,
                  height: 56,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Clock color={colors.warningIcon} size={20} />
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: colors.warningIcon,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    fontSize: 11,
                  }}
                >
                  Start Job
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleUpdateStatus(JobStatuses.COMPLETED)}
              disabled={isSyncing}
              activeOpacity={0.7}
              style={{
                flex: job.status === JobStatuses.PENDING ? 1 : 1,
                backgroundColor: colors.successBg,
                borderWidth: 1,
                borderColor: colors.successBorder,
                height: 56,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <CheckCircle2 color={colors.success} size={20} />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.success,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontSize: 11,
                }}
              >
                Complete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
