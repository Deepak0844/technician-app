import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, BellOff, Trash2, Clock } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import useTheme from "@hooks/useTheme";

export default function RemindersScreen() {
  const { colors } = useTheme();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScheduled = async function() {
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      // Sort by date ascending
      const sorted = list.sort((a, b) => {
        const timeA = a.trigger.type === 'calendar' ? new Date(a.trigger.nextTriggerDate).getTime() : a.trigger.value;
        const timeB = b.trigger.type === 'calendar' ? new Date(b.trigger.nextTriggerDate).getTime() : b.trigger.value;
        return timeA - timeB;
      });
      setScheduledNotifications(sorted);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  const onRefresh = useCallback(async function() {
    setIsRefreshing(true);
    await fetchScheduled();
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      await fetchScheduled();
      setLoading(false);
    }
    init();
  }, []);

  const handleCancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await fetchScheduled();
  };

  const handleCancelOne = async (id) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    await fetchScheduled();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSecondary }} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 6, fontFamily: "Space Grotesk" }}>
            Reminders
          </Text>
          <Text style={{ fontSize: 13, color: colors.textDisabled, lineHeight: 18, fontFamily: "Inter" }}>
            Scheduled locally on your device for maximum reliability and privacy.
          </Text>
        </View>

        {/* Action Bar */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ backgroundColor: colors.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "800", textTransform: "uppercase" }}>
                {scheduledNotifications.length} Scheduled
              </Text>
            </View>
          </View>
          {scheduledNotifications.length > 0 && (
            <TouchableOpacity onPress={handleCancelAll} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <BellOff size={12} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 11, fontWeight: "700" }}>CANCEL ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scheduled List */}
        {scheduledNotifications.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            {scheduledNotifications.map((notif) => {
              const triggerTime = notif.trigger.type === 'calendar' ? notif.trigger.nextTriggerDate : notif.trigger.value;
              const dateObj = new Date(triggerTime);
              return (
                <View 
                  key={notif.identifier}
                  style={{ 
                    backgroundColor: colors.bgCard, 
                    borderRadius: 20, 
                    padding: 18, 
                    marginBottom: 12, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    shadowColor: colors.primaryMuted,
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Bell size={12} color={colors.primary} />
                      <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "700", fontFamily: "Space Grotesk" }}>
                        {notif.content.title}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "Inter", marginBottom: 10 }} numberOfLines={1}>
                      {notif.content.body}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ backgroundColor: colors.bgSurface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Clock size={10} color={colors.secondary} />
                        <Text style={{ color: colors.secondary, fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
                          {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleCancelOne(notif.identifier)} 
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.danger + "10", alignItems: "center", justifyContent: "center" }}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: colors.border, borderStyle: 'dotted' }}>
            <BellOff size={40} color={colors.textDisabled} style={{ marginBottom: 16, opacity: 0.5 }} />
            <Text style={{ color: colors.textDisabled, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', fontWeight: "600" }}>No upcoming reminders scheduled.</Text>
            <Text style={{ color: colors.textFaint, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', marginTop: 4 }}>New jobs will appear here automatically.</Text>
          </View>
        )}

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
