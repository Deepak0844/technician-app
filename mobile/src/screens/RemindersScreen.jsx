import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

// Utils


export default function RemindersScreen() {
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>Scheduled locally on your device for maximum reliability and privacy.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Schedule Strategy</Text>
        <Text style={styles.cardValue}>60 min · 30 min · 15 min</Text>
        <Text style={styles.cardDescription}>
          The app schedules three high-priority alerts directly on your device when a job is created or updated. These fire even if you are offline.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>System Permissions</Text>
        {loading ? (
          <ActivityIndicator color="#c899ff" size="small" style={{ marginTop: 8 }} />
        ) : permissionStatus === "granted" ? (
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenBadgeText}>✓ Notifications Active</Text>
          </View>
        ) : (
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>✗ Permission Denied — Enable in Settings</Text>
          </View>
        )}
        <Text style={[styles.cardDescription, { marginTop: 8 }]}>
          Reminders require &quot;Allow Notifications&quot; permission to wake your screen and play sounds.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>How It Works</Text>
        <Text style={styles.cardStep}>① Save a new job or update an existing appointment</Text>
        <Text style={styles.cardStep}>② App calculates reminder times (60, 30, 15m before)</Text>
        <Text style={styles.cardStep}>③ Reminders are registered into the OS notification tray</Text>
        <Text style={styles.cardStep}>④ Device wakes up and alerts you at the exact time</Text>
        <Text style={styles.cardStep}>⑤ No internet or server connection needed to fire</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e0e", padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#737373", lineHeight: 18 },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: { fontSize: 10, fontWeight: "700", color: "#737373", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: "800", color: "#c899ff", marginBottom: 8 },
  cardDescription: { fontSize: 13, color: "#a3a3a3", lineHeight: 20 },
  tokenBadge: { backgroundColor: "rgba(129,236,255,0.10)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 },
  tokenBadgeText: { color: "#81ecff", fontSize: 11, fontWeight: "700" },
  tokenText: { fontSize: 10, color: "#555", lineHeight: 15 },
  errorBadge: { backgroundColor: "rgba(255,110,132,0.10)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginTop: 6 },
  errorBadgeText: { color: "#ff6e84", fontSize: 11, fontWeight: "700" },
  cardStep: { fontSize: 12, color: "#a3a3a3", lineHeight: 22 },
});
