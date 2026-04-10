import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery, useLogoutMutation, useUpdateMeMutation } from "@services/api/authApi";
import { clearCredentials, updateUser } from "@store/slices/authSlice";
import StorageUtils from "@utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, ArrowLeft, Bell, Receipt } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import useTheme from "@hooks/useTheme";
import ThemeToggle from "@components/ThemeToggle";
import { Check, X, Edit2 } from "lucide-react-native";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const cachedUser = useSelector((state) => state.auth.user);
  const { data: meResponse, isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const user = meResponse?.data ?? cachedUser ?? {};

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [editedCompanyName, setEditedCompanyName] = React.useState("");
  const [editedEmail, setEditedEmail] = React.useState("");
  const [editedAddress, setEditedAddress] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setEditedName(user.name || "");
      setEditedCompanyName(user.companyName || "");
      setEditedEmail(user.email || "");
      setEditedAddress(user.address || "");
    }
  }, [user, isEditing]);

  async function handleSave() {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      const resp = await updateMe({
        name: editedName.trim(),
        companyName: editedCompanyName.trim(),
        email: editedEmail.trim(),
        address: editedAddress.trim(),
      }).unwrap();
      if (resp?.data) {
        dispatch(updateUser(resp.data));
      }
      setIsEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setEditedName(user.name || "");
    setEditedCompanyName(user.companyName || "");
    setEditedEmail(user.email || "");
    setEditedAddress(user.address || "");
  }

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
        <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", color: colors.secondary, flex: 1 }}>
          Profile Settings
        </Text>
        <TouchableOpacity
          onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          style={{ padding: 8 }}
          activeOpacity={0.7}
        >
          {isEditing ? (
            <X color={colors.danger} size={20} />
          ) : (
            <Edit2 color={colors.secondary} size={20} />
          )}
        </TouchableOpacity>
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
              marginBottom: 12,
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
              {(isEditing ? editedName : user.name || user.phone || "T")[0]?.toUpperCase() || "T"}
            </Text>
          </View>
          
          {isEditing ? (
            <View style={{ height: 28, justifyContent: "center" }}>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Your Name"
                placeholderTextColor={colors.textDisabled}
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: "800",
                  textAlign: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.primary,
                  padding: 0,
                  minWidth: 150,
                  height: 28,
                }}
                autoFocus
              />
            </View>
          ) : (
            <View style={{ height: 28, justifyContent: "center" }}>
              <Text
                style={{
                  fontFamily: "Space Grotesk",
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {user.name || "Technician"}
              </Text>
            </View>
          )}
          <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 11, letterSpacing: 1, marginTop: 4 }}>
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
          <ProfileRow 
            label="Company Name" 
            value={user.companyName} 
            colors={colors} 
            isEditing={isEditing}
            editedValue={editedCompanyName}
            onValueChange={setEditedCompanyName}
            placeholder="e.g. Acme Repair"
          />
          <ProfileRow label="Mobile Number" value={user.phone} colors={colors} />
          <ProfileRow
            label="Member Since"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            colors={colors}
          />

          <View style={{ height: isEditing ? 64 : 0, overflow: "hidden", marginTop: isEditing ? 10 : 0 }}>
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isUpdating}
                activeOpacity={0.8}
                style={{ backgroundColor: colors.primary, borderRadius: 8, height: 44, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontFamily: "Space Grotesk", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginRight: 8 }}>Save Changes</Text>
                    <Check color="#FFFFFF" size={16} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Invoice Details Card */}
        <View style={{ backgroundColor: colors.bgCardAlt, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight, borderLeftWidth: 4, borderLeftColor: colors.secondary }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Receipt size={14} color={colors.secondary} />
            <Text style={{ fontFamily: "Space Grotesk", color: colors.secondary, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 }}>Invoice Details</Text>
          </View>
          <Text style={{ fontFamily: "Inter", color: colors.textDisabled, fontSize: 10, marginBottom: 14, lineHeight: 15 }}>
            These details appear on your PDF invoices sent to customers.
          </Text>
          <ProfileRow label="Email" value={user.email} colors={colors} isEditing={isEditing} editedValue={editedEmail} onValueChange={setEditedEmail} placeholder="you@example.com" keyboardType="email-address" />
          <ProfileRow label="Address" value={user.address} colors={colors} isEditing={isEditing} editedValue={editedAddress} onValueChange={setEditedAddress} placeholder="Shop / business address" multiline />
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

function ProfileRow({ label, value, colors, isEditing, editedValue, onValueChange, placeholder, keyboardType, multiline, autoCapitalize }) {
  const isMultiline = multiline && isEditing;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: isMultiline ? "flex-start" : "center", minHeight: 32, marginBottom: 12 }}>
      <Text style={{ fontFamily: "Inter", color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, flex: 0.4, marginTop: isMultiline ? 6 : 0 }}>
        {label}
      </Text>
      <View style={{ flex: 0.6, minHeight: 32, justifyContent: "center" }}>
        {isEditing ? (
          <TextInput
            value={editedValue}
            onChangeText={onValueChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textDisabled}
            keyboardType={keyboardType || "default"}
            multiline={multiline}
            autoCapitalize={autoCapitalize || "sentences"}
            style={{
              fontFamily: "Space Grotesk",
              color: colors.textPrimary,
              fontWeight: "700",
              fontSize: 12,
              textAlign: "right",
              borderBottomWidth: 1,
              borderBottomColor: colors.primaryBorder,
              padding: 0,
              minHeight: multiline ? 48 : 32,
              textAlignVertical: multiline ? "top" : "center",
            }}
          />
        ) : (
          <Text style={{ fontFamily: "Space Grotesk", color: colors.textPrimary, fontWeight: "700", fontSize: 12, textAlign: "right" }} numberOfLines={multiline ? 3 : 1}>
            {value || "—"}
          </Text>
        )}
      </View>
    </View>
  );
}
