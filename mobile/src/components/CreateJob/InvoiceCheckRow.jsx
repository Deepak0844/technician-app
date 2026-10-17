import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import useTheme from "@hooks/useTheme";

const InvoiceCheckRow = ({ label, hint, checked, onToggle }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Check size={14} color="#fff" />}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: 14,
            color: colors.textPrimary,
          }}
        >
          {label}
        </Text>
        {!!hint && (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Inter",
              fontSize: 11,
              color: colors.textMuted,
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceCheckRow;
