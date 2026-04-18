import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import useTheme from "@hooks/useTheme";

const WarrantyPresets = [
  "No Warranty",
  "30 Days",
  "90 Days",
  "6 Months",
  "1 Year",
];

const WarrantySection = ({
  warranty,
  setWarranty,
  customWarranty,
  setCustomWarranty,
  showCustomWarranty,
  setShowCustomWarranty,
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
          Service Warranty
        </Text>
        <ShieldCheck size={12} color={colors.secondary} />
      </View>

      <View style={{ padding: 20 }}>
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
          Selection Period
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {WarrantyPresets.map((p) => {
            const isSelected = !showCustomWarranty && warranty === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setWarranty(p);
                  setShowCustomWarranty(false);
                }}
                style={{
                  width: "47.5%",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected
                    ? colors.secondaryBg
                    : colors.bgCard,
                  borderColor: isSelected ? colors.secondary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    color: isSelected ? colors.secondary : colors.textDisabled,
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setShowCustomWarranty(true)}
            style={{
              width: "47.5%",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1.5,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: showCustomWarranty
                ? colors.primaryBg
                : colors.bgCard,
              borderColor: showCustomWarranty ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 11,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: showCustomWarranty
                  ? colors.primary
                  : colors.textDisabled,
              }}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomWarranty && (
          <View
            style={{
              marginTop: 8,
              padding: 16,
              borderRadius: 12,
              backgroundColor: colors.bgCard,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
            }}
          >
            <TextInput
              placeholder="Enter custom warranty terms..."
              placeholderTextColor={colors.placeholderText}
              value={customWarranty}
              onChangeText={setCustomWarranty}
              style={{
                fontFamily: "Inter",
                color: colors.textPrimary,
                fontSize: 12,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default WarrantySection;
