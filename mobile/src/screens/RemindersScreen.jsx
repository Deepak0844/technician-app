import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  BellOff,
  Trash2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  Info,
} from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@hooks/useTheme";

export default function RemindersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScheduled = async function () {
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      const sorted = list.sort((a, b) => {
        const timeA =
          a.trigger.type === "calendar"
            ? new Date(a.trigger.nextTriggerDate).getTime()
            : a.trigger.value;
        const timeB =
          b.trigger.type === "calendar"
            ? new Date(b.trigger.nextTriggerDate).getTime()
            : b.trigger.value;
        return timeA - timeB;
      });
      setScheduledNotifications(sorted);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  const onRefresh = useCallback(async function () {
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

  const hasPermission = permissionStatus === "granted";

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: colors.bgPrimary }]}
      edges={["top", "bottom"]}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.textPrimary} size={20} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Reminders
        </Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Permission Banner ────────────────────────── */}
        <View
          style={[
            s.permBanner,
            {
              backgroundColor: hasPermission
                ? colors.successBg
                : colors.dangerBg,
              borderColor: hasPermission
                ? colors.successBorder
                : colors.dangerBorder,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              {hasPermission ? (
                <ShieldCheck size={18} color={colors.success} />
              ) : (
                <ShieldX size={18} color={colors.danger} />
              )}
              <Text
                style={[
                  s.permBannerText,
                  { color: hasPermission ? colors.success : colors.danger },
                ]}
              >
                {hasPermission
                  ? "Notifications are enabled"
                  : "Notifications disabled — enable in device Settings"}
              </Text>
            </>
          )}
        </View>

        <View style={s.body}>
          {/* ── Count + Cancel All ───────────────────────── */}
          <View style={s.countRow}>
            <View
              style={[
                s.countPill,
                {
                  backgroundColor: colors.primaryBg,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Bell size={12} color={colors.primary} />
              <Text style={[s.countPillText, { color: colors.primary }]}>
                {scheduledNotifications.length} scheduled
              </Text>
            </View>
            {scheduledNotifications.length > 0 && (
              <TouchableOpacity
                onPress={handleCancelAll}
                style={[
                  s.cancelAllBtn,
                  {
                    backgroundColor: colors.dangerBg,
                    borderColor: colors.dangerBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <BellOff size={12} color={colors.danger} />
                <Text style={[s.cancelAllText, { color: colors.danger }]}>
                  Cancel all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Scheduled List ──────────────────────────── */}
          {scheduledNotifications.length > 0 ? (
            <View
              style={[
                s.card,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              {scheduledNotifications.map((notif, idx) => {
                const triggerTime =
                  notif.trigger.type === "calendar"
                    ? notif.trigger.nextTriggerDate
                    : notif.trigger.value;
                const dateObj = new Date(triggerTime);
                const isLast = idx === scheduledNotifications.length - 1;
                return (
                  <View
                    key={notif.identifier}
                    style={[
                      s.notifRow,
                      !isLast && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border + "66",
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.notifIconBox,
                        {
                          backgroundColor: colors.primaryBg,
                          borderColor: colors.primaryBorder,
                        },
                      ]}
                    >
                      <Bell size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[s.notifTitle, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {notif.content.title}
                      </Text>
                      <Text
                        style={[s.notifBody, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {notif.content.body}
                      </Text>
                      <View style={s.notifTimeRow}>
                        <Clock size={11} color={colors.secondary} />
                        <Text
                          style={[s.notifTime, { color: colors.secondary }]}
                        >
                          {dateObj.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ·{" "}
                          {dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCancelOne(notif.identifier)}
                      style={[
                        s.deleteBtn,
                        { backgroundColor: colors.dangerBg },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View
              style={[
                s.emptyCard,
                {
                  backgroundColor: colors.bgCardAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <BellOff size={36} color={colors.textDisabled} />
              <Text style={[s.emptyTitle, { color: colors.textMuted }]}>
                No reminders scheduled
              </Text>
              <Text style={[s.emptySubtitle, { color: colors.textDisabled }]}>
                New jobs will appear here automatically.
              </Text>
            </View>
          )}

          {/* ── Schedule Strategy ────────────────────────── */}
          <View
            style={[
              s.card,
              {
                backgroundColor: colors.bgCardAlt,
                borderColor: colors.borderLight,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <Text style={[s.cardLabel, { color: colors.primary }]}>
              Schedule Strategy
            </Text>
            <View style={s.strategyRow}>
              {["60 min", "30 min", "15 min"].map((t) => (
                <View
                  key={t}
                  style={[
                    s.strategyPill,
                    {
                      backgroundColor: colors.primaryBg,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Clock size={11} color={colors.primary} />
                  <Text style={[s.strategyPillText, { color: colors.primary }]}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[s.cardBody, { color: colors.textMuted }]}>
              Three alerts fire before each job — directly on your device, even
              when offline.
            </Text>
          </View>

          {/* ── How It Works ─────────────────────────────── */}
          <View
            style={[
              s.card,
              {
                backgroundColor: colors.bgCardAlt,
                borderColor: colors.borderLight,
                borderLeftWidth: 4,
                borderLeftColor: colors.secondary,
              },
            ]}
          >
            <View style={s.cardLabelRow}>
              <Info size={13} color={colors.secondary} />
              <Text style={[s.cardLabel, { color: colors.secondary }]}>
                How It Works
              </Text>
            </View>
            {[
              "Save or update a job with a service date",
              "App calculates 60, 30 & 15 min reminder times",
              "Reminders are registered in the OS notification tray",
              "Device alerts you at the exact time — no internet needed",
            ].map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View
                  style={[s.stepDot, { backgroundColor: colors.secondary }]}
                />
                <Text style={[s.stepText, { color: colors.textMuted }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 10, width: 44 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  permBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  permBannerText: {
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: "600",
    flex: 1,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  countPillText: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  cancelAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelAllText: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 10,
  },
  notifIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: 13,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 11,
    fontFamily: "Inter",
    marginBottom: 5,
  },
  notifTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: "Inter",
    fontWeight: "600",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: "Inter",
    textAlign: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: "Space Grotesk",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: "Inter",
    lineHeight: 20,
    marginTop: 10,
  },
  strategyRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  strategyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  strategyPillText: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 13,
    fontFamily: "Inter",
    lineHeight: 20,
    flex: 1,
  },
});
