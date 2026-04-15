import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Activity,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import useTheme from "@hooks/useTheme";

const TimelineSection = ({
  serviceDate,
  selectedTime,
  status,
  nextReminderDate,
  onDatePress,
  onTimePress,
  onStatusPress,
  onReminderPress,
  onClearReminder,
  isPaid,
  setIsPaid,
  paymentMethod,
  setPaymentMethod,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginBottom: 32,
        overflow: "hidden",
        borderRadius: 16,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: colors.bgCard,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 10,
            fontWeight: "700",
            color: colors.secondary,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Schedule & Status
        </Text>
        <Activity size={12} color={colors.secondary} />
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ gap: 12 }}>
          {/* Service Date Row */}
          <TouchableOpacity
            onPress={onDatePress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.bgCard,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.secondaryBorder,
                }}
              >
                <CalendarIcon size={18} color={colors.secondary} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 8,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 3,
                    marginBottom: 4,
                  }}
                >
                  Service Date
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {serviceDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textDisabled} />
          </TouchableOpacity>

          {/* Service Time Row */}
          <TouchableOpacity
            onPress={onTimePress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.bgCard,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.primaryBorder,
                }}
              >
                <Clock size={18} color={colors.primary} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 8,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 3,
                    marginBottom: 4,
                  }}
                >
                  Service Time
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedTime}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textDisabled} />
          </TouchableOpacity>

          {/* Current Status Row */}
          <TouchableOpacity
            onPress={onStatusPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.bgCard,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor:
                    status === "pending"
                      ? colors.warningBg
                      : status === "in_progress"
                        ? colors.secondaryBg
                        : status === "completed"
                          ? colors.successBg
                          : colors.dangerBg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor:
                    status === "pending"
                      ? colors.warningBorder
                      : status === "in_progress"
                        ? colors.secondaryBorder
                        : status === "completed"
                          ? colors.successBorder
                          : colors.dangerBorder,
                }}
              >
                <Activity
                  size={18}
                  color={
                    status === "pending"
                      ? colors.warningIcon
                      : status === "in_progress"
                        ? colors.secondary
                        : status === "completed"
                          ? colors.success
                          : colors.danger
                  }
                />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 8,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 3,
                    marginBottom: 4,
                  }}
                >
                  Current Status
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textDisabled} />
          </TouchableOpacity>

          {/* Next Service Reminder Row */}
          <TouchableOpacity
            onPress={onReminderPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.bgCard,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: nextReminderDate
                ? colors.primaryBorder
                : colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: nextReminderDate
                    ? colors.primaryBg
                    : colors.bgInput,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: nextReminderDate
                    ? colors.primaryBorder
                    : colors.border,
                }}
              >
                <CalendarIcon
                  size={18}
                  color={
                    nextReminderDate ? colors.primary : colors.textDisabled
                  }
                />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 8,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 3,
                    marginBottom: 4,
                  }}
                >
                  Next Service Reminder
                </Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: nextReminderDate
                      ? colors.textPrimary
                      : colors.textMuted,
                    fontSize: 13,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {nextReminderDate
                    ? nextReminderDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "NOT SET"}
                </Text>
              </View>
            </View>
            {nextReminderDate ? (
              <TouchableOpacity onPress={onClearReminder}>
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  CLEAR
                </Text>
              </TouchableOpacity>
            ) : (
              <ChevronRight size={16} color={colors.textDisabled} />
            )}
          </TouchableOpacity>

          <View style={{ height: 8 }} />

          {/* Payment Section */}
          <View
            style={{
              padding: 16,
              borderRadius: 16,
              backgroundColor: isPaid
                ? colors.successBg + "30"
                : colors.bgInput,
              borderWidth: 1,
              borderColor: isPaid ? colors.successBorder : colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <CreditCard
                size={14}
                color={isPaid ? colors.success : colors.textMuted}
              />
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Payment Status
              </Text>
            </View>
            {/* Segmented Control */}
            <View
              style={{
                flexDirection: "row",
                borderRadius: 10,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: isPaid ? 16 : 0,
              }}
            >
              <TouchableOpacity
                onPress={() => setIsPaid(false)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: !isPaid ? colors.dangerBg : colors.bgCard,
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}
              >
                <XCircle
                  size={12}
                  color={!isPaid ? colors.danger : colors.textMuted}
                />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "800",
                    color: !isPaid ? colors.danger : colors.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  Unpaid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsPaid(true)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: isPaid ? colors.successBg : colors.bgCard,
                }}
              >
                <CheckCircle2
                  size={12}
                  color={isPaid ? colors.success : colors.textMuted}
                />
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    fontWeight: "800",
                    color: isPaid ? colors.success : colors.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  Paid
                </Text>
              </TouchableOpacity>
            </View>

            {isPaid && (
              <View>
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: colors.textDisabled,
                    fontSize: 8,
                    textTransform: "uppercase",
                    fontWeight: "700",
                    letterSpacing: 3,
                    marginBottom: 10,
                    marginLeft: 2,
                  }}
                >
                  Payment Method
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    { key: "cash", emoji: "💵", label: "Cash" },
                    { key: "upi", emoji: "📱", label: "UPI" },
                    { key: "online", emoji: "🌐", label: "Online" },
                    { key: "cheque", emoji: "📄", label: "Cheque" },
                  ].map(({ key, emoji, label }) => {
                    const isSelected = paymentMethod === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setPaymentMethod(key)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: isSelected
                            ? colors.primaryBg
                            : colors.bgCard,
                          borderWidth: 1.5,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{emoji}</Text>
                        <Text
                          style={{
                            fontFamily: "Inter",
                            fontSize: 10,
                            fontWeight: "700",
                            textTransform: "uppercase",
                            color: isSelected
                              ? colors.primary
                              : colors.textMuted,
                          }}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TimelineSection;
