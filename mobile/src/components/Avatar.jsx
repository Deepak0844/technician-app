import React from "react";
import { View, Text, Image } from "react-native";
import useTheme from "@hooks/useTheme";

const Avatar = ({ name = "T", uri, size = 32, style }) => {
  const { colors } = useTheme();
  
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "T";

  if (uri && uri.startsWith("http")) {
    return (
      <View
        style={[{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: colors.primaryBorder,
          backgroundColor: colors.bgCard,
          overflow: "hidden",
        }, style]}
      >
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
      </View>
    );
  }

  return (
    <View
      style={[{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.bgCardAlt,
        borderWidth: 1,
        borderColor: colors.borderLight,
        alignItems: "center",
        justifyContent: "center",
      }, style]}
    >
      <Text
        style={{
          fontFamily: "Space Grotesk",
          fontSize: size * 0.4,
          fontWeight: "700",
          color: colors.primary,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

export default Avatar;
