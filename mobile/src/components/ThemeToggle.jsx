import React from "react";
import { View, Switch, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@store/slices/themeSlice";
import useTheme from "@hooks/useTheme";
import { Moon, Sun } from "lucide-react-native";

/**
 * ThemeToggle — drop this anywhere to let the user switch dark/light mode.
 * Dispatches toggleTheme() which updates Redux state and re-renders all themed screens.
 */
export default function ThemeToggle() {
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  function handleToggle() {
    dispatch(toggleTheme());
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark
              ? "rgba(200,153,255,0.10)"
              : "rgba(124,58,237,0.10)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(200,153,255,0.2)"
              : "rgba(124,58,237,0.2)",
          }}
        >
          {isDark ? (
            <Moon color={colors.primary} size={16} />
          ) : (
            <Sun color={colors.primary} size={16} />
          )}
        </View>
        <View>
          <Text
            style={{
              fontFamily: "Inter",
              color: colors.textPrimary,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              color: colors.textDisabled,
              fontSize: 10,
            }}
          >
            Tap to switch theme
          </Text>
        </View>
      </View>

      <Switch
        value={isDark}
        onValueChange={handleToggle}
        trackColor={{
          false: colors.bgSurface,
          true: colors.primaryBg,
        }}
        thumbColor={isDark ? colors.primary : colors.textMuted}
        ios_backgroundColor={colors.borderLight}
      />
    </TouchableOpacity>
  );
}
