import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { HStack } from "@components/ui/hstack";
import { Text } from "@components/ui/text";
import {
  formatCurrency,
  formatDate,
  getApplianceLabel,
} from "@utils/formatUtils";
import useTheme from "@hooks/useTheme";

const TODAY_STR = new Date().toISOString().split("T")[0];

function getStatusColor(colors, status) {
  if (status === "completed") return colors.secondary;
  if (status === "pending") return colors.warning;
  if (status === "cancelled") return colors.danger;
  return colors.primary;
}

function getStatusBorderColor(colors, status) {
  if (status === "completed") return colors.secondary;
  if (status === "cancelled") return colors.danger;
  if (status === "pending") return colors.warning;
  if (status === "in_progress") return colors.primary;
  return colors.border;
}

export default function JobCard({ job, onPress }) {
  const { colors } = useTheme();

  const isToday = useMemo(
    () =>
      job.serviceDate &&
      new Date(job.serviceDate).toISOString().split("T")[0] === TODAY_STR,
    [job.serviceDate],
  );

  const dateLabel = useMemo(() => {
    if (!job.serviceDate) return null;
    return isToday ? "Today" : formatDate(job.serviceDate);
  }, [job.serviceDate, isToday]);

  const grandTotal =
    (job.amount || 0) +
    (job.diagnosticFee || 0) +
    (job.partsUsed || []).reduce(
      (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
      0,
    );

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View
        style={{
          backgroundColor: colors.bgCardAlt,
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.borderStrong,
          borderLeftWidth: 4,
          borderLeftColor: getStatusBorderColor(colors, job.status),
        }}
      >
        {/* Row 1 — Customer name + Urgent badge | Status (+ Unpaid) */}
        <HStack
          style={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 2,
            gap: 8,
          }}
        >
          {/* Left: name + urgent badge */}
          <HStack
            style={{
              alignItems: "center",
              gap: 6,
              flex: 1,
              flexShrink: 1,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                fontWeight: "700",
                color: colors.textPrimary,
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {job.customerId?.name || job.customerName || "Customer"}
            </Text>
            {job.priority === "urgent" && (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 5,
                  paddingVertical: 2,
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

          {/* Right: Status (+ Unpaid) */}
          <HStack style={{ alignItems: "center", gap: 4, flexShrink: 0 }}>
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: getStatusColor(colors, job.status),
              }}
            >
              {job.status?.replace("_", " ")}
            </Text>
            {job.status === "completed" && !job.isPaid && (
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: colors.danger,
                }}
              >
                · Unpaid
              </Text>
            )}
          </HStack>
        </HStack>

        {/* Row 2 — Appliance · Issue (truncated) */}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 13,
            color: colors.primary,
            fontWeight: "700",
            letterSpacing: 0.5,
            marginBottom: 10,
          }}
        >
          {getApplianceLabel(job, { max: 2 })}
          {job.issue ? (
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: colors.textMuted,
                fontWeight: "500",
                letterSpacing: 0,
              }}
            >
              {" • "}
              {job.issue}
            </Text>
          ) : null}
        </Text>

        {/* Row 3 — Amount (left) | Date (right) */}
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
            {formatCurrency(grandTotal)}
          </Text>
          {dateLabel && (
            <HStack style={{ alignItems: "center", gap: 3 }}>
              <CalendarDays
                size={10}
                color={isToday ? colors.primary : colors.textDisabled}
              />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fontWeight: isToday ? "700" : "400",
                  color: isToday ? colors.primary : colors.textDisabled,
                }}
              >
                {dateLabel}
              </Text>
            </HStack>
          )}
        </HStack>
      </View>
    </TouchableOpacity>
  );
}
