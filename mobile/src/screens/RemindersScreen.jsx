import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import useTheme from "@hooks/useTheme";

export default function RemindersScreen() {
  const { colors } = useTheme();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function checkPermissions() {
    async function fetch() {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSecondary, padding: 20 }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 6, fontFamily: "Space Grotesk" }}>
            Reminders
          </Text>
          <Text style={{ fontSize: 13, color: colors.textDisabled, lineHeight: 18, fontFamily: "Inter" }}>
            Scheduled locally on your device for maximum reliability and privacy.
          </Text>
        </View>

        {/* Schedule Strategy Card */}
        <View
          style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textDisabled, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "Inter" }}>
            Schedule Strategy
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 8, fontFamily: "Space Grotesk" }}>
            60 min · 30 min · 15 min
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 20, fontFamily: "Inter" }}>
            The app schedules three high-priority alerts directly on your device when a job is created or updated. These fire even if you are offline.
          </Text>
        </View>

        {/* System Permissions Card */}
        <View
          style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textDisabled, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "Inter" }}>
            System Permissions
          </Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" style={{ marginTop: 8 }} />
          ) : permissionStatus === "granted" ? (
            <View
              style={{
                backgroundColor: colors.secondaryBg,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: "700", fontFamily: "Inter" }}>
                ✓ Notifications Active
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.dangerBg,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            >
              <Text style={{ color: colors.danger, fontSize: 11, fontWeight: "700", fontFamily: "Inter" }}>
                ✗ Permission Denied — Enable in Settings
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 8, fontFamily: "Inter" }}>
            Reminders require &quot;Allow Notifications&quot; permission to wake your screen and play sounds.
          </Text>
        </View>

        {/* How It Works Card */}
        <View
          style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textDisabled, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "Inter" }}>
            How It Works
          </Text>
          {[
            "① Save a new job or update an existing appointment",
            "② App calculates reminder times (60, 30, 15m before)",
            "③ Reminders are registered into the OS notification tray",
            "④ Device wakes up and alerts you at the exact time",
            "⑤ No internet or server connection needed to fire",
          ].map((step, i) => (
            <Text key={i} style={{ fontSize: 12, color: colors.textMuted, lineHeight: 22, fontFamily: "Inter" }}>
              {step}
            </Text>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
