import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery, useLogoutMutation } from "../services/api/authApi";
import { clearCredentials } from "../store/slices/authSlice";
import StorageUtils from "../utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, ArrowLeft, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#81ecff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <LinearGradient 
        colors={['rgba(0,0,0,0.95)', 'rgba(14,14,14,0.95)']} 
        className="w-full flex-row items-center px-4 h-14 z-50 border-b border-white/5"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 active:scale-95" activeOpacity={0.7}>
          <ArrowLeft color="#81ecff" size={20} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter' }} className="text-sm font-bold tracking-tighter text-[#81ecff]">Profile Settings</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Avatar Section */}
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: "rgba(26,25,25,0.4)",
            borderWidth: 2, borderColor: "#81ecff",
            alignItems: "center", justifyContent: "center",
            marginBottom: 8,
            shadowColor: "#81ecff", shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }
          }}>
            <Text style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: "800", color: "#ffffff" }}>
              {(user.name || user.phone || "T")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontFamily: "Space Grotesk", color: "#81ecff", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            Technician
          </Text>
          <Text style={{ fontFamily: "Space Grotesk", color: "#ffffff", fontSize: 18, fontWeight: "800", marginBottom: 2 }}>
            {user.name || "Technician"}
          </Text>
          <Text style={{ fontFamily: "Inter", color: "#a3a3a3", fontSize: 11, letterSpacing: 1 }}>
            {user.phone}
          </Text>
        </View>

        {/* Info Card */}
        <View style={{
          backgroundColor: "rgba(26,25,25,0.4)",
          borderRadius: 12, padding: 14,
          marginBottom: 16,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
          borderLeftWidth: 4, borderLeftColor: "#c899ff"
        }}>
          <Text style={{ fontFamily: "Space Grotesk", color: "#c899ff", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
            Profile Information
          </Text>
          <Row label="Mobile Number" value={user.phone} />
          <Row label="Member Since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} />
          <Row label="Role" value="Field Technician" />
        </View>

        {/* Settings Section */}
        <View style={{
          backgroundColor: "rgba(26,25,25,0.4)",
          borderRadius: 12, padding: 18,
          marginBottom: 16,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
        }}>
          <Text style={{ fontFamily: "Space Grotesk", color: "#81ecff", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
            App Settings
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Reminders")}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(129,236,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(129,236,255,0.2)" }}>
                <Bell color="#81ecff" size={16} />
              </View>
              <View>
                <Text style={{ fontFamily: "Inter", color: "#ffffff", fontSize: 13, fontWeight: "600" }}>Notification Reminders</Text>
                <Text style={{ fontFamily: "Inter", color: "#737373", fontSize: 10 }}>Check system status</Text>
              </View>
            </View>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#a3a3a3", fontSize: 10 }}>➔</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleLogout} disabled={isLoggingOut}>
          <LinearGradient
            colors={["rgba(255,69,58,0.85)", "rgba(176,0,32,0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 46, borderRadius: 12,
              flexDirection: "row", alignItems: "center", justifyContent: "center",
            }}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={{ fontFamily: "Space Grotesk", color: "#ffffff", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3, marginRight: 8 }}>
                  Log Out
                </Text>
                <LogOut color="#ffffff" size={15} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ fontFamily: "Inter", color: "#a3a3a3", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</Text>
      <Text style={{ fontFamily: "Space Grotesk", color: "#ffffff", fontWeight: "700", fontSize: 12 }}>{value ?? "—"}</Text>
    </View>
  );
}
