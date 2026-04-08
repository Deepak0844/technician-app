import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Wrench, User } from "lucide-react-native";
import useTheme from "@hooks/useTheme";

import { useUpdateMeMutation } from "@services/api/authApi";
import { completeFirstLoginSetup } from "@store/slices/authSlice";

export default function SetupProfileScreen() {
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  async function handleContinue() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Please enter your name", "Your name helps personalise your experience.");
      return;
    }
    try {
      await updateMe({ name: trimmedName }).unwrap();
      dispatch(completeFirstLoginSetup());
    } catch {
      Alert.alert("Oops!", "Could not save your name. You can update it later from Profile.");
      dispatch(completeFirstLoginSetup());
    }
  }

  function handleSkip() {
    dispatch(completeFirstLoginSetup());
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSecondary }} edges={["top", "bottom"]}>
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

        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>

          {/* Branding */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 48 }}>
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
          <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: "800", fontFamily: "Space Grotesk", marginBottom: 8 }}>
            Welcome! 👋
          </Text>
          <Text style={{ color: colors.textSubtle, fontSize: 15, fontFamily: "Inter", marginBottom: 6 }}>
            You&apos;re all set. Just tell us what to call you.
          </Text>
          <Text style={{ color: colors.textFaint, fontSize: 12, fontFamily: "Inter", marginBottom: 40 }}>
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
              <User color={colors.textSubtle} size={18} style={{ marginRight: 10 }} />
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
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
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
            style={{ alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={{ color: colors.textFaint, fontSize: 13, fontFamily: "Inter" }}>
              Skip for now
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
