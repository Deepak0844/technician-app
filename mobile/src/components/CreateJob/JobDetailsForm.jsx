import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Settings, Check } from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import { ApplianceOptions } from "@constants/appConstants";

const JobDetailsForm = ({
  appliance,
  setAppliance,
  issue,
  setIssue,
  serviceDone,
  setServiceDone,
  diagnosticFee,
  setDiagnosticFee,
  amount,
  setAmount,
  priority,
  setPriority,
  internalNotes,
  setInternalNotes,
}) => {
  const { colors } = useTheme();
  const [isFocusedIssue, setIsFocusedIssue] = useState(false);
  const [isFocusedFee, setIsFocusedFee] = useState(false);
  const [isFocusedAmount, setIsFocusedAmount] = useState(false);
  const [isFocusedResolution, setIsFocusedResolution] = useState(false);
  const [isFocusedInternal, setIsFocusedInternal] = useState(false);

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
            color: colors.primary,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Job Details
        </Text>
        <Settings size={12} color={colors.primary} />
      </View>

      <View style={{ padding: 20 }}>
        {/* Priority Selection — shown first as it's the most critical triage info */}
        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Job Priority
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {["normal", "urgent"].map((p) => {
            const isSelected = priority === p;
            const isUrgent = p === "urgent";
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  backgroundColor: isSelected
                    ? isUrgent
                      ? "#fef2f2"
                      : colors.primaryBg
                    : colors.bgCard,
                  borderColor: isSelected
                    ? isUrgent
                      ? "#ef4444"
                      : colors.primary
                    : colors.border,
                }}
              >
                <Text style={{ fontSize: 16 }}>{isUrgent ? "⚡" : "🟢"}</Text>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 11,
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: isSelected
                      ? isUrgent
                        ? "#b91c1c"
                        : colors.primary
                      : colors.textDisabled,
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Appliance Selector — 2-column emoji grid */}
        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Device Type
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {ApplianceOptions.map((item) => {
            const isSelected = appliance === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setAppliance(item.value)}
                style={{
                  width: "47.5%",
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: isSelected
                    ? colors.primaryBg
                    : colors.bgCard,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "700",
                    color: isSelected ? colors.primary : colors.textSecondary,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {isSelected && <Check size={14} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Issue Reported
        </Text>
        <View
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: isFocusedIssue ? colors.secondary : colors.border,
          }}
        >
          <TextInput
            placeholder="Briefly describe the problem..."
            placeholderTextColor={colors.placeholderText}
            value={issue}
            onFocus={() => setIsFocusedIssue(true)}
            onBlur={() => setIsFocusedIssue(false)}
            onChangeText={setIssue}
            style={{
              fontFamily: "Inter",
              color: colors.textPrimary,
              fontSize: 12,
              lineHeight: 20,
              textAlignVertical: "top",
            }}
            multiline
            numberOfLines={3}
          />
        </View>

        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Resolution / Work Done
        </Text>
        <View
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: isFocusedResolution ? colors.success : colors.border,
          }}
        >
          <TextInput
            placeholder="Describe what was done to fix the issue..."
            placeholderTextColor={colors.placeholderText}
            value={serviceDone}
            onFocus={() => setIsFocusedResolution(true)}
            onBlur={() => setIsFocusedResolution(false)}
            onChangeText={setServiceDone}
            style={{
              fontFamily: "Inter",
              color: colors.textPrimary,
              fontSize: 12,
              lineHeight: 20,
              textAlignVertical: "top",
            }}
            multiline
            numberOfLines={3}
          />
        </View>

        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Diagnostic / Visiting Fee
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: isFocusedFee ? colors.primary : colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textMuted,
              fontSize: 20,
              marginRight: 4,
              fontWeight: "700",
            }}
          >
            ₹
          </Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={colors.placeholderText}
            value={diagnosticFee}
            onFocus={() => setIsFocusedFee(true)}
            onBlur={() => setIsFocusedFee(false)}
            onChangeText={setDiagnosticFee}
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              flex: 1,
            }}
          />
          <Text
            style={{
              color: colors.primary,
              fontSize: 10,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            INR
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 10,
            marginTop: 8,
            marginLeft: 4,
          }}
        >
          * Optional upfront charge to cover your visit.
        </Text>

        <View style={{ height: 24 }} />

        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 8,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Service Charge / Base Amount
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: isFocusedAmount ? colors.primary : colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textMuted,
              fontSize: 20,
              marginRight: 4,
              fontWeight: "700",
            }}
          >
            ₹
          </Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={colors.placeholderText}
            value={amount}
            onFocus={() => setIsFocusedAmount(true)}
            onBlur={() => setIsFocusedAmount(false)}
            onChangeText={setAmount}
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              flex: 1,
            }}
          />
          <Text
            style={{
              color: colors.primary,
              fontSize: 10,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            INR
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Inter",
            color: colors.textDisabled,
            fontSize: 10,
            marginTop: 8,
            marginLeft: 4,
          }}
        >
          * The actual cost of repair/service rendered.
        </Text>

        <View style={{ height: 32 }} />

        {/* Internal Notes */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter",
              color: colors.textDisabled,
              fontSize: 8,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            Technician Workspace
          </Text>
          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
              backgroundColor: colors.secondaryBg,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 7,
                fontWeight: "800",
                color: colors.secondary,
                textTransform: "uppercase",
              }}
            >
              Private
            </Text>
          </View>
        </View>
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.bgInput,
            borderWidth: 1,
            borderColor: isFocusedInternal ? colors.secondary : colors.border,
            borderStyle: "dashed",
          }}
        >
          <TextInput
            placeholder="Internal technical notes, gate codes, or customer nuances (Hidden from Invoice)..."
            placeholderTextColor={colors.placeholderText}
            value={internalNotes}
            onFocus={() => setIsFocusedInternal(true)}
            onBlur={() => setIsFocusedInternal(false)}
            onChangeText={setInternalNotes}
            style={{
              fontFamily: "Inter",
              color: colors.textPrimary,
              fontSize: 12,
              lineHeight: 20,
              textAlignVertical: "top",
            }}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );
};

export default JobDetailsForm;
