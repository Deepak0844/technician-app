import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery, useLogoutMutation } from "@services/api/authApi";
import { clearCredentials } from "@store/slices/authSlice";
import StorageUtils from "@utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, ArrowLeft, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import useTheme from "@hooks/useTheme";
import ThemeToggle from "@components/ThemeToggle";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const cachedUser = useSelector((state) => state.auth.user);
  const { data: meResponse, isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const user = meResponse?.data ?? cachedUser ?? {};

  async function handleLogout() {
    await logout().catch(() => {});
    await StorageUtils.clearToken();
    dispatch(clearCredentials());
  }

  if (isLoading && !cachedUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <LinearGradient
        colors={colors.gradientHeader}
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
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
          <ArrowLeft color={colors.secondary} size={20} />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.secondary }}>
          Profile Settings
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.bgCardAlt,
              borderWidth: 2,
              borderColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              shadowColor: colors.secondary,
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Text
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 22,
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              {(user.name || user.phone || "T")[0].toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.secondary,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Technician
          </Text>
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 2,
            }}
          >
            {user.name || "Technician"}
          </Text>
          <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
            {user.phone}
          </Text>
        </View>

        {/* Profile Information Card */}
        <View
          style={{
            backgroundColor: colors.bgCardAlt,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}
        >
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.primary,
              fontSize: 10,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 14,
            }}
          >
            Profile Information
          </Text>
          <ProfileRow label="Mobile Number" value={user.phone} colors={colors} />
          <ProfileRow
            label="Member Since"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            colors={colors}
          />
          <ProfileRow label="Role" value="Field Technician" colors={colors} />
        </View>

        {/* App Settings Card */}
        <View
          style={{
            backgroundColor: colors.bgCardAlt,
            borderRadius: 12,
            padding: 18,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        >
          <Text
            style={{
              fontFamily: "Space Grotesk",
              color: colors.secondary,
              fontSize: 9,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            App Settings
          </Text>

          {/* Notification Reminders Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Reminders")}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.secondaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: colors.secondaryBorder,
                }}
              >
                <Bell color={colors.secondary} size={16} />
              </View>
              <View>
                <Text style={{ fontFamily: "Inter", color: colors.textPrimary, fontSize: 13, fontWeight: "600" }}>
                  Notification Reminders
                </Text>
                <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 10 }}>
                  Check system status
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.bgSurface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>➔</Text>
            </View>
          </TouchableOpacity>

          {/* Theme Toggle Row */}
          <ThemeToggle />
        </View>

        {/* Logout Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleLogout} disabled={isLoggingOut}>
          <LinearGradient
            colors={[colors.dangerGradientStart, colors.dangerGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 46,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <>
                <Text
                  style={{
                    fontFamily: "Space Grotesk",
                    color: colors.textPrimary,
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                    marginRight: 8,
                  }}
                >
                  Log Out
                </Text>
                <LogOut color={colors.textPrimary} size={15} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ label, value, colors }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontWeight: "700", fontSize: 12 }}>
        {value ?? "—"}
      </Text>
    </View>
  );
}
