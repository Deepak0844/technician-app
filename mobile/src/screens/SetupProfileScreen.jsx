import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wrench,
  User,
  Briefcase,
  Phone,
  Moon,
  Sun,
  Check,
  Palette,
} from "lucide-react-native";
import useTheme from "@hooks/useTheme";
import { setTheme, setPalette } from "@store/slices/themeSlice";
import StorageUtils from "@utils/storageUtils";
import { PALETTE_META } from "@constants/colors";

import { useUpdateMeMutation, useGetMeQuery } from "@services/api/authApi";
import { completeFirstLoginSetup, updateUser } from "@store/slices/authSlice";

export default function SetupProfileScreen() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const dispatch = useDispatch();
  const { colors, mode, palette } = useTheme();
  const isDark = mode === "dark";

  function handleSelectPalette(key) {
    StorageUtils.savePalette(key); // fire-and-forget
    dispatch(setPalette(key));
  }

  function handleToggleMode() {
    const newMode = isDark ? "light" : "dark";
    StorageUtils.saveTheme(newMode); // fire-and-forget
    dispatch(setTheme(newMode));
  }

  const { data: meResponse } = useGetMeQuery();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  useEffect(() => {
    if (meResponse?.data) {
      if (meResponse.data.name) setName(meResponse.data.name);
      if (meResponse.data.companyName)
        setCompanyName(meResponse.data.companyName);
      if (meResponse.data.phone) setPhone(meResponse.data.phone);
    }
  }, [meResponse]);

  async function handleContinue() {
    const trimmedName = name.trim();
    const trimmedCompanyName = companyName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert(
        "Please enter your name",
        "Your name helps personalise your experience.",
      );
      return;
    }

    try {
      const response = await updateMe({
        name: trimmedName,
        companyName: trimmedCompanyName,
        phone: trimmedPhone,
      }).unwrap();

      // Update local state with latest user data
      if (response?.data) {
        dispatch(updateUser(response.data));
      }

      dispatch(completeFirstLoginSetup());
    } catch (err) {
      console.error("Update profile error:", err);
      Alert.alert(
        "Oops!",
        "Could not save your details. You can update them later from Profile.",
      );
      dispatch(completeFirstLoginSetup());
    }
  }

  function handleSkip() {
    dispatch(completeFirstLoginSetup());
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgSecondary }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Ambient glow decorations */}
        <View
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: colors.primaryMuted,
            opacity: 0.15,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: colors.secondary,
            opacity: 0.07,
          }}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 48,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: colors.primaryBorder,
              }}
            >
              <Wrench color={colors.primary} size={20} />
            </View>
            <Text
              style={{
                color: colors.textSubtle,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontFamily: "Space Grotesk",
              }}
            >
              Technician App
            </Text>
          </View>

          {/* Header */}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 32,
              fontWeight: "800",
              fontFamily: "Space Grotesk",
              marginBottom: 8,
            }}
          >
            Welcome! 👋
          </Text>
          <Text
            style={{
              color: colors.textSubtle,
              fontSize: 15,
              fontFamily: "Inter",
              marginBottom: 6,
            }}
          >
            You&apos;re all set. Just tell us what to call you.
          </Text>
          <Text
            style={{
              color: colors.textFaint,
              fontSize: 12,
              fontFamily: "Inter",
              marginBottom: 40,
            }}
          >
            This helps personalise your experience.
          </Text>

          {/* Name Input Card */}
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.textSubtle,
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontFamily: "Inter",
                marginBottom: 12,
              }}
            >
              Your Name
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bgInputDeep,
                borderRadius: 10,
                paddingHorizontal: 14,
                height: 52,
                borderWidth: 1,
                borderColor: name.trim() ? colors.primaryBorder : "transparent",
              }}
            >
              <User
                color={colors.textSubtle}
                size={18}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rahul Kumar"
                placeholderTextColor={colors.textFaint}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontFamily: "Inter",
                }}
                autoFocus
                returnKeyType="next"
              />
            </View>

            <Text
              style={{
                color: colors.textSubtle,
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontFamily: "Inter",
                marginTop: 20,
                marginBottom: 12,
              }}
            >
              Company Name (Optional)
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bgInputDeep,
                borderRadius: 10,
                paddingHorizontal: 14,
                height: 52,
                borderWidth: 1,
                borderColor: companyName.trim()
                  ? colors.primaryBorder
                  : "transparent",
              }}
            >
              <Briefcase
                color={colors.textSubtle}
                size={18}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="e.g. Acme Appliances"
                placeholderTextColor={colors.textFaint}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontSize: 15,
                  fontFamily: "Inter",
                }}
                returnKeyType="next"
              />
            </View>

            <Text
              style={{
                color: colors.textSubtle,
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontFamily: "Inter",
                marginTop: 20,
                marginBottom: 12,
              }}
            >
              Mobile Number
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bgInputDeep,
                borderRadius: 10,
                paddingHorizontal: 14,
                height: 52,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: 0.7,
              }}
            >
              <Phone
                color={colors.textSubtle}
                size={18}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={phone}
                editable={false}
                placeholder="e.g. +91 9876543210"
                placeholderTextColor={colors.textFaint}
                style={{
                  flex: 1,
                  color: colors.textMuted,
                  fontSize: 15,
                  fontFamily: "Inter",
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 11,
                color: colors.textMuted,
                marginTop: 5,
                marginLeft: 2,
              }}
            >
              Verified via OTP — cannot be changed here
            </Text>
          </View>

          {/* ── Theme Picker ── */}
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Palette header row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Palette color={colors.primary} size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: "700",
                    fontFamily: "Inter",
                  }}
                >
                  Color Theme
                </Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 11,
                    fontFamily: "Inter",
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {PALETTE_META.find((p) => p.key === palette)?.label ??
                    palette}
                </Text>
              </View>
            </View>

            {/* Palette swatch row */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {PALETTE_META.map((p) => {
                const isSelected = palette === p.key;
                const grad1 = isDark ? p.darkColor : p.lightColor;
                const grad2 = isDark ? p.darkColor2 : p.lightColor2;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => handleSelectPalette(p.key)}
                    activeOpacity={0.75}
                    style={{ flex: 1, alignItems: "center", gap: 5 }}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        borderWidth: 2.5,
                        borderColor: isSelected ? grad1 : "transparent",
                        padding: 3,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LinearGradient
                        colors={[grad1, grad2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 22,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <Check color="#fff" size={18} strokeWidth={3} />
                        )}
                      </LinearGradient>
                    </View>
                    <Text
                      style={{
                        color: isSelected ? grad1 : colors.textMuted,
                        fontSize: 10,
                        fontWeight: isSelected ? "700" : "400",
                        fontFamily: "Inter",
                        textAlign: "center",
                      }}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dark / Light toggle */}
            <Text
              style={{
                color: colors.textSubtle,
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontFamily: "Inter",
                marginBottom: 10,
              }}
            >
              Appearance
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {["dark", "light"].map((m) => {
                const isActive = mode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => {
                      if (!isActive) handleToggleMode();
                    }}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 12,
                      borderRadius: 10,
                      backgroundColor: isActive
                        ? colors.primaryBg
                        : colors.bgInputDeep,
                      borderWidth: 1.5,
                      borderColor: isActive
                        ? colors.primaryBorderStrong
                        : "transparent",
                    }}
                  >
                    {m === "dark" ? (
                      <Moon
                        color={isActive ? colors.primary : colors.textMuted}
                        size={15}
                      />
                    ) : (
                      <Sun
                        color={isActive ? colors.primary : colors.textMuted}
                        size={15}
                      />
                    )}
                    <Text
                      style={{
                        color: isActive ? colors.primary : colors.textMuted,
                        fontSize: 13,
                        fontWeight: isActive ? "700" : "400",
                        fontFamily: "Inter",
                        textTransform: "capitalize",
                      }}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 54,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.bgPrimary} />
              ) : (
                <Text
                  style={{
                    color: colors.bgPrimary,
                    fontSize: 14,
                    fontWeight: "800",
                    fontFamily: "Space Grotesk",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Continue
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={{
              alignItems: "center",
              paddingVertical: 8,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 13,
                fontFamily: "Inter",
              }}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
