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

import { useUpdateMeMutation } from "../services/api/authApi";
import { completeFirstLoginSetup } from "../store/slices/authSlice";

export default function SetupProfileScreen() {
  const [name, setName] = useState("");
  const dispatch = useDispatch();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e0e0e" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Ambient glow background decorations */}
        <View style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "#7945b6", opacity: 0.15 }} />
        <View style={{ position: "absolute", bottom: 40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: "#46f5e0", opacity: 0.07 }} />

        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>

          {/* Branding */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 48 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: "#1f1f1f",
              alignItems: "center", justifyContent: "center",
              marginRight: 10,
              borderWidth: 1, borderColor: "rgba(218,185,255,0.2)",
            }}>
              <Wrench color="#dab9ff" size={20} />
            </View>
            <Text style={{ color: "#9d8b9b", fontSize: 11, fontWeight: "700", letterSpacing: 3, textTransform: "uppercase", fontFamily: "Space Grotesk" }}>
              Technician App
            </Text>
          </View>

          {/* Header */}
          <Text style={{ color: "#e2e2e2", fontSize: 32, fontWeight: "800", fontFamily: "Space Grotesk", marginBottom: 8 }}>
            Welcome! 👋
          </Text>
          <Text style={{ color: "#9d8b9b", fontSize: 15, fontFamily: "Manrope", marginBottom: 6 }}>
            You&apos;re all set. Just tell us what to call you.
          </Text>
          <Text style={{ color: "#514250", fontSize: 12, fontFamily: "Manrope", marginBottom: 40 }}>
            This helps personalise your experience.
          </Text>

          {/* Name Input Card */}
          <View style={{
            backgroundColor: "#1f1f1f",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}>
            <Text style={{ color: "#9d8b9b", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, fontFamily: "Manrope", marginBottom: 12 }}>
              Your Name
            </Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#353535",
              borderRadius: 10,
              paddingHorizontal: 14,
              height: 52,
              borderWidth: 1,
              borderColor: name.trim() ? "rgba(218,185,255,0.4)" : "transparent",
            }}>
              <User color="#9d8b9b" size={18} style={{ marginRight: 10 }} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rahul Kumar"
                placeholderTextColor="#514250"
                style={{
                  flex: 1,
                  color: "#e2e2e2",
                  fontSize: 15,
                  fontFamily: "Manrope",
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
              colors={["#dab9ff", "#7945b6"]}
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
                <ActivityIndicator color="#2a0053" />
              ) : (
                <Text style={{ color: "#2a0053", fontSize: 14, fontWeight: "800", fontFamily: "Space Grotesk", letterSpacing: 1, textTransform: "uppercase" }}>
                  Continue
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: "#514250", fontSize: 13, fontFamily: "Manrope" }}>
              Skip for now
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
