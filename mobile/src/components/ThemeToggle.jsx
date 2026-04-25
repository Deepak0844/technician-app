import React from "react";
import { View, Switch, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { setTheme } from "@store/slices/themeSlice";
import useTheme from "@hooks/useTheme";
import StorageUtils from "@utils/storageUtils";
import { Moon, Sun } from "lucide-react-native";

/**
 * ThemeToggle — drop this anywhere to let the user switch dark/light mode.
 */
export default function ThemeToggle() {
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  function handleToggle() {
    const newMode = isDark ? "light" : "dark";
    StorageUtils.saveTheme(newMode); // fire-and-forget
    dispatch(setTheme(newMode));
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            backgroundColor: colors.primaryBg,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
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
