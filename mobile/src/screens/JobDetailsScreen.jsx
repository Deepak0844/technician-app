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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
  RotateCcw,
  CalendarClock,
  XCircle,
  RotateCw,
  CreditCard,
  History,
  ChevronDown,
} from "lucide-react-native";
import {
  useGetJobByIdQuery,
  useDeleteJobMutation,
  useRepeatJobMutation,
  useUpdateJobMutation,
  useReopenJobMutation,
  useChangeServiceDateMutation,
} from "@services/api/jobApi";
import {
  JobStatuses,
  PaymentMethods,
  PriorityLevels,
} from "@constants/appConstants";
import { RouteNames } from "@constants/routeNames";
import { formatCurrency } from "@utils/formatUtils";
import ChangeServiceDateModal from "@components/ChangeServiceDateModal";
import useTheme from "@hooks/useTheme";

export default function JobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
  const [reopenJob, { isLoading: isReopening }] = useReopenJobMutation();
  const [changeServiceDate, { isLoading: isChangingDate }] =
    useChangeServiceDateMutation();
  const [showChangeDate, setShowChangeDate] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  const isSyncing =
    isDeleting || isRepeating || isUpdating || isReopening || isChangingDate;

  const job = jobResponse?.data ?? initialJob;

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

  // A completed+paid job is a terminal state — requires explicit Reopen to change
  const isLockedFinal =
    job.status === JobStatuses.COMPLETED && job.isPaid === true;

  // A cancelled job is locked from normal editing — use Reactivate instead
  const isCancelledJob = job.status === JobStatuses.CANCELLED;

  // Job is scheduled for a future date
  const isFutureJob = new Date(job.serviceDate) > new Date();

  // Completed + paid jobs are locked; this changes only the date and time
  // (no reopen, status and payment untouched).
  const handleChangeDate = async (serviceDate) => {
    try {
      await changeServiceDate({ id: job._id, serviceDate }).unwrap();
      setShowChangeDate(false);
      Alert.alert("Date changed", "The job date has been updated.");
    } catch (err) {
      Alert.alert("Error", err?.data?.message || "Failed to change the date.");
    }
  };

  const handleReopen = () => {
    Alert.alert(
      "Reopen Job?",
      "This job will be set back to In Progress and marked as Unpaid. It will be removed from your earnings until completed and paid again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reopen",
          style: "destructive",
          onPress: async () => {
            try {
              await reopenJob(job._id).unwrap();
              Alert.alert(
                "Reopened",
                "Job is now In Progress and marked as Unpaid.",
              );
            } catch (err) {
              Alert.alert(
                "Error",
                err?.data?.message || "Failed to reopen job.",
              );
            }
          },
        },
      ],
    );
  };
  const handleReactivate = () => {
    Alert.alert(
      "Reactivate Job?",
      "This will set the job back to Pending so you can reschedule and update it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reactivate",
          onPress: async () => {
            try {
              await updateJob({
                id: job._id,
                status: JobStatuses.PENDING,
              }).unwrap();
              Alert.alert("Reactivated", "Job is now Pending.");
            } catch (err) {
              Alert.alert(
                "Error",
                err?.data?.message || "Failed to reactivate job.",
              );
            }
          },
        },
      ],
    );
  };

  const doMarkPaid = (paymentMethod) => {
    const isNonCompleted = job.status !== JobStatuses.COMPLETED;
    const message = isNonCompleted
      ? `This job is still ${job.status.replace("_", " ").toUpperCase()}. Marking it as paid will also mark it as Completed. Continue?`
      : "Confirm marking this job as paid?";
    Alert.alert("Mark as Paid?", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Mark as Paid",
        onPress: async () => {
          try {
            const isFuture = new Date(job.serviceDate) > new Date();
            await updateJob({
              id: job._id,
              isPaid: true,
              paymentMethod,
              status: JobStatuses.COMPLETED,
              ...(isFuture && { serviceDate: new Date().toISOString() }),
            }).unwrap();
            Alert.alert(
              "Success",
              isNonCompleted
                ? "Job marked as Completed and Paid."
                : "Job marked as Paid.",
            );
          } catch (_err) {
            Alert.alert("Error", "Failed to update payment status.");
          }
        },
      },
    ]);
  };

  const handleJobActions = () => {
    Alert.alert("Job Actions", "Manage this job record and lifecycle.", [
      { text: "Cancel", style: "cancel" },
      ...(!isLockedFinal && !isCancelledJob
        ? [
          {
            text: "Edit Job",
            onPress: () => navigation.navigate(RouteNames.ADD_JOB, { job }),
          },
        ]
        : []),
      {
        text: "Repeat Job",
        onPress: async () => {
          try {
            const res = await repeatJob(job._id).unwrap();
            Alert.alert(
              "Job Repeated",
              "A copy has been created. Please update the service date and any other details before saving.",
            );
            navigation.navigate(RouteNames.ADD_JOB, { job: res.data });
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

  const handleUpdateStatus = (newStatus) => {
    const performUpdate = async (extraPayload = {}) => {
      try {
        // If completing a job that was scheduled for the future,
        // move serviceDate to today so Calendar shows it correctly.
        const completingFuture =
          newStatus === JobStatuses.COMPLETED &&
          new Date(job.serviceDate) > new Date();
        await updateJob({
          id: job._id,
          status: newStatus,
          ...(completingFuture && { serviceDate: new Date().toISOString() }),
          ...extraPayload,
        }).unwrap();
        Alert.alert(
          "Success",
          extraPayload.isPaid
            ? "Job marked as Completed and Paid."
            : `Status updated to ${newStatus.replace("_", " ")}.`,
        );
      } catch (_err) {
        Alert.alert("Error", "Failed to update status.");
      }
    };

    const doUpdate = () => {
      if (newStatus === JobStatuses.COMPLETED && !job.isPaid) {
        Alert.alert(
          "Complete Job",
          "Would you also like to collect payment now?",
          [
            {
              text: "Complete Only",
              onPress: () => performUpdate(),
            },
            {
              text: "Complete & Mark Paid",
              onPress: () =>
                Alert.alert("Payment Method", "How was the payment received?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Cash",
                    onPress: () =>
                      performUpdate({
                        isPaid: true,
                        paymentMethod: PaymentMethods.CASH,
                      }),
                  },
                  {
                    text: "UPI",
                    onPress: () =>
                      performUpdate({
                        isPaid: true,
                        paymentMethod: PaymentMethods.UPI,
                      }),
                  },
                  {
                    text: "Online",
                    onPress: () =>
                      performUpdate({
                        isPaid: true,
                        paymentMethod: PaymentMethods.ONLINE,
                      }),
                  },
                  {
                    text: "Cheque",
                    onPress: () =>
                      performUpdate({
                        isPaid: true,
                        paymentMethod: PaymentMethods.CHEQUE,
                      }),
                  },
                ]),
            },
          ],
        );
      } else {
        performUpdate();
      }
    };

    if (isFutureJob && newStatus !== JobStatuses.CANCELLED) {
      const dateStr = new Date(job.serviceDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      Alert.alert(
        "Job Scheduled for Future",
        `This job is scheduled for ${dateStr}. Mark it as ${newStatus.replace("_", " ")} today?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes, Continue", onPress: doUpdate },
        ],
      );
    } else {
      doUpdate();
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
          height: 64,
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
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
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

          {/* Job ID row + status badges */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flexShrink: 1,
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

          {/* Appliance name — full width below the header row */}
          <Text
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 24,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 8,
            }}
          >
            {job?.applianceType || "General Service"}
          </Text>

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
              {(() => {
                const jobPartsTotal = (job?.partsUsed || []).reduce(
                  (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
                  0,
                );
                const grandTotal =
                  (job?.amount || 0) +
                  (job?.diagnosticFee || 0) +
                  jobPartsTotal;
                return (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Space Grotesk",
                          fontSize: 28,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {formatCurrency(grandTotal)}
                      </Text>
                    </View>
                    <View style={{ marginTop: 8, gap: 2 }}>
                      {(job?.amount || 0) > 0 && (
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 10,
                            color: colors.textSecondary,
                          }}
                        >
                          Service: {formatCurrency(job.amount)}
                        </Text>
                      )}
                      {(job?.diagnosticFee || 0) > 0 && (
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 10,
                            color: colors.textSecondary,
                          }}
                        >
                          Diagnostic Fee: {formatCurrency(job.diagnosticFee)}
                        </Text>
                      )}
                      {jobPartsTotal > 0 && (
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 10,
                            color: colors.textSecondary,
                          }}
                        >
                          Spares: {formatCurrency(jobPartsTotal)}
                        </Text>
                      )}
                    </View>
                  </>
                );
              })()}
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

        {/* Job Activity Timeline — collapsible accordion */}
        {job?.events?.length > 0 &&
          (() => {
            const ACTION_LABEL = {
              created: "Job Created",
              status_changed: "Status Changed",
              marked_paid: "Marked as Paid",
              marked_unpaid: "Marked as Unpaid",
              reopened: "Job Reopened",
              edited: "Job Edited",
            };
            const DOT_COLOR = {
              created: colors.primary,
              status_changed: colors.secondary,
              marked_paid: colors.secondary,
              marked_unpaid: colors.warning,
              reopened: colors.warning,
              edited: colors.textSecondary,
            };
            const events = [...job.events].reverse();

            return (
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: colors.bgSurface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {/* Accordion header — always visible */}
                <TouchableOpacity
                  onPress={() => setActivityOpen((v) => !v)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: colors.bgCard,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottomWidth: activityOpen ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <History size={12} color={colors.secondary} />
                    <Text
                      style={{
                        fontFamily: "Space Grotesk",
                        fontSize: 10,
                        fontWeight: "700",
                        color: colors.secondary,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Activity Log
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.primaryBg,
                        borderRadius: 99,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {job.events.length}
                      </Text>
                    </View>
                  </View>
                  {/* Latest event pill when collapsed */}
                  {!activityOpen && <View style={{ flex: 1 }} />}
                  <ChevronDown
                    size={14}
                    color={colors.textSecondary}
                    style={{
                      marginLeft: 8,
                      transform: [{ rotate: activityOpen ? "180deg" : "0deg" }],
                    }}
                  />
                </TouchableOpacity>

                {/* Expanded timeline */}
                {activityOpen && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingTop: 12,
                      paddingBottom: 4,
                    }}
                  >
                    {events.map((event, idx) => {
                      const isLast = idx === events.length - 1;
                      const label = ACTION_LABEL[event.action] ?? event.action;
                      const dotColor =
                        DOT_COLOR[event.action] ?? colors.textSecondary;
                      const eventDate = event.at ? new Date(event.at) : null;
                      const dateStr = eventDate
                        ? eventDate.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        }) +
                        " · " +
                        eventDate.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "";

                      // Build a single human-readable subtitle
                      let subtitle = "";
                      if (event.from && event.to) {
                        const fmt = (s) =>
                          s
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                        subtitle = `${fmt(event.from)} → ${fmt(event.to)}`;
                      } else if (event.to) {
                        const fmt = (s) =>
                          s
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                        subtitle = fmt(event.to);
                      }

                      return (
                        <View
                          key={idx}
                          style={{ flexDirection: "row", gap: 10 }}
                        >
                          {/* Spine */}
                          <View style={{ alignItems: "center", width: 14 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: dotColor,
                                marginTop: 5,
                              }}
                            />
                            {!isLast && (
                              <View
                                style={{
                                  width: 1.5,
                                  flex: 1,
                                  backgroundColor: colors.border,
                                  marginTop: 3,
                                  minHeight: 16,
                                }}
                              />
                            )}
                          </View>
                          {/* Content — single compact row */}
                          <View
                            style={{
                              flex: 1,
                              paddingBottom: isLast ? 12 : 14,
                              flexDirection: "row",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: 12,
                                  fontWeight: "600",
                                  color: colors.textPrimary,
                                }}
                              >
                                {label}
                              </Text>
                              {!!subtitle && (
                                <Text
                                  style={{
                                    fontFamily: "Inter",
                                    fontSize: 11,
                                    color: colors.textSecondary,
                                    marginTop: 1,
                                  }}
                                >
                                  {subtitle}
                                </Text>
                              )}
                            </View>
                            {!!dateStr && (
                              <Text
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: 10,
                                  color: colors.textDisabled,
                                  marginTop: 2,
                                  textAlign: "right",
                                }}
                              >
                                {dateStr}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })()}

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

          {!isLockedFinal && !isCancelledJob && (
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
          )}
        </View>

        {/* Quick Status Change Actions */}
        {isLockedFinal ? (
          <>
          <TouchableOpacity
            onPress={() => setShowChangeDate(true)}
            disabled={isSyncing}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
              height: 56,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: colors.bgCard,
            }}
          >
            <CalendarClock color={colors.secondary} size={18} />
            <Text
              style={{
                fontFamily: "Space Grotesk",
                color: colors.secondary,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontSize: 11,
              }}
            >
              Change Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReopen}
            disabled={isSyncing}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
              height: 56,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.warningBorder,
              backgroundColor: colors.warningBg,
            }}
          >
            <RotateCcw color={colors.warningIcon} size={18} />
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
              Reopen Job
            </Text>
          </TouchableOpacity>
          <ChangeServiceDateModal
            visible={showChangeDate}
            onClose={() => setShowChangeDate(false)}
            serviceDate={job.serviceDate}
            isCompleted={isCompleted}
            saving={isChangingDate}
            onSave={handleChangeDate}
          />
          </>
        ) : (
          <>
            {job.status === JobStatuses.COMPLETED && !job.isPaid && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Payment Method",
                    "How was the payment received?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Cash",
                        onPress: () => doMarkPaid(PaymentMethods.CASH),
                      },
                      {
                        text: "UPI",
                        onPress: () => doMarkPaid(PaymentMethods.UPI),
                      },
                      {
                        text: "Online",
                        onPress: () => doMarkPaid(PaymentMethods.ONLINE),
                      },
                      {
                        text: "Cheque",
                        onPress: () => doMarkPaid(PaymentMethods.CHEQUE),
                      },
                    ],
                  )
                }
                disabled={isSyncing}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                  height: 56,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: colors.successBorder,
                  backgroundColor: colors.successBg,
                }}
              >
                <CheckCircle2 color={colors.success} size={18} />
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
                  Mark as Paid
                </Text>
              </TouchableOpacity>
            )}
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
                      flex: 1,
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

            {/* Collect Payment shortcut for active jobs */}
            {(job.status === JobStatuses.PENDING ||
              job.status === JobStatuses.IN_PROGRESS) && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Collect Payment",
                      "How was the payment received? This will also mark the job as Completed.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Cash",
                          onPress: () => doMarkPaid(PaymentMethods.CASH),
                        },
                        {
                          text: "UPI",
                          onPress: () => doMarkPaid(PaymentMethods.UPI),
                        },
                        {
                          text: "Online",
                          onPress: () => doMarkPaid(PaymentMethods.ONLINE),
                        },
                        {
                          text: "Cheque",
                          onPress: () => doMarkPaid(PaymentMethods.CHEQUE),
                        },
                      ],
                    )
                  }
                  disabled={isSyncing}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 12,
                    height: 52,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: colors.primaryBorder,
                    backgroundColor: colors.primaryBg,
                  }}
                >
                  <CreditCard color={colors.primary} size={18} />
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      color: colors.primary,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontSize: 11,
                    }}
                  >
                    Collect Payment & Complete
                  </Text>
                </TouchableOpacity>
              )}

            {/* Cancel Job for active jobs */}
            {(job.status === JobStatuses.PENDING ||
              job.status === JobStatuses.IN_PROGRESS) && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Cancel Job?",
                      "Are you sure you want to cancel this job? You can reactivate it later.",
                      [
                        { text: "No, Keep It", style: "cancel" },
                        {
                          text: "Yes, Cancel Job",
                          style: "destructive",
                          onPress: () =>
                            handleUpdateStatus(JobStatuses.CANCELLED),
                        },
                      ],
                    )
                  }
                  disabled={isSyncing}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 12,
                    height: 52,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.dangerBorder ?? colors.danger,
                    backgroundColor: colors.dangerBg ?? "transparent",
                  }}
                >
                  <XCircle color={colors.danger} size={18} />
                  <Text
                    style={{
                      fontFamily: "Space Grotesk",
                      color: colors.danger,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontSize: 11,
                    }}
                  >
                    Cancel Job
                  </Text>
                </TouchableOpacity>
              )}

            {/* Reactivate for cancelled jobs */}
            {isCancelledJob && (
              <TouchableOpacity
                onPress={handleReactivate}
                disabled={isSyncing}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                  height: 56,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: colors.warningBorder,
                  backgroundColor: colors.warningBg,
                }}
              >
                <RotateCw color={colors.warningIcon} size={18} />
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
                  Reactivate Job
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
