import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import { Alert, KeyboardAvoidingView, Platform, View, Animated, Easing, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useSendOtpMutation, useVerifyOtpMutation } from "@services/api/authApi";
import { setCredentials } from "@store/slices/authSlice";
import { RouteNames } from "@constants/routeNames";
import StorageUtils from "@utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@hooks/useTheme";

// Gluestack Primitives
import { VStack } from "@components/ui/vstack";
import { Box } from "@components/ui/box";
import { Heading } from "@components/ui/heading";
import { Text } from "@components/ui/text";
import { Input, InputField } from "@components/ui/input";
import { ButtonSpinner } from "@components/ui/button";

// Icons
import { Terminal, ShieldCheck, Smartphone, ArrowRight, Fingerprint, Lock, KeyRound } from "lucide-react-native";

export default function OtpLoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState("phone");
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  // Scanner Line Animation
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  async function handleSendOtp() {
    if (!phone.trim()) { Alert.alert("Error", "Please enter your phone number"); return; }
    try {
      const res = await sendOtp({ phone: phone.trim() }).unwrap();
      setSessionId(res.data.sessionId);
      setStep("otp");
    } catch (error) {
      const errorMsg = error?.data?.message || error?.data || error?.message || "Failed to send OTP";
      Alert.alert("Error", String(errorMsg));
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) { Alert.alert("Error", "Please enter the OTP"); return; }
    if (!sessionId) { Alert.alert("Error", "Session ID missing. Please resend OTP."); return; }
    try {
      const result = await verifyOtp({ phone: phone.trim(), otp: otp.trim(), sessionId }).unwrap();
      const { token, isFirstLogin, ...user } = result?.data ?? {};
      await StorageUtils.saveToken(token);
      dispatch(setCredentials({ token, user, isFirstLogin: !!isFirstLogin }));
      
      if (isFirstLogin) {
        navigation.navigate(RouteNames.SETUP_PROFILE);
      }
    } catch (error) {
      const errorMsg = error?.data?.message || error?.data || error?.message || "OTP verification failed";
      Alert.alert("Error", String(errorMsg));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Background Decoration Image */}
        <Image
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkN6DFsmnByBHAUsGPnn8oEfZ1tY0dMy4dp4Jivlz8fNKvaKo0btrAJ92NTTHRFXb7Z5rW3RDT5QBA-Ody6NVHyWssTxG661idIQUxt8AQxigwanc8Ee2QMD6AvJO9kJ-fmj-2eX7fbM31YRMrhFLAMKJ26m-0fzJCU3XslnlGTN6am_sWKRX3nN4pcMmXjzcxRE931XI4mmEIgF64eEqsCkIcktb05ANggOPldbgB9rhN0nvFHMXakr8IcOO5EcYowsWRthOaIu11" }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}
        />

        {/* Aesthetic Background Elements */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "40%",
              height: "40%",
              backgroundColor: colors.primaryMuted,
              opacity: 0.2,
              borderRadius: 999,
              transform: [{ scale: 1.5 }],
              shadowColor: colors.primaryMuted,
              shadowRadius: 100,
              shadowOpacity: 1,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: "-5%",
              right: "-5%",
              width: "30%",
              height: "30%",
              backgroundColor: colors.secondary,
              opacity: 0.1,
              borderRadius: 999,
              shadowColor: colors.secondary,
              shadowRadius: 100,
              shadowOpacity: 1,
            }}
          />
        </View>

        {/* TopAppBar */}
        <LinearGradient
          colors={colors.gradientHeaderOverlay}
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            zIndex: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 40,
            paddingBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            activeOpacity={0.7}
          >
            <Terminal color={colors.indigo} size={20} />
            <Text style={{ fontFamily: "Inter", fontSize: 14, textTransform: "uppercase", letterSpacing: 4, color: colors.textMuted }}>
              Technician App
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "800", letterSpacing: -0.5, color: colors.indigo }}>
            LOGIN
          </Text>
        </LinearGradient>

        {/* Main Content */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, zIndex: 10 }}>
          <View style={{ width: "100%", maxWidth: 400, marginTop: 40 }}>

            {/* Branding */}
            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <ShieldCheck color={colors.primary} size={40} />
                <Animated.View
                  style={{ transform: [{ translateY }], position: "absolute", width: "100%", height: 2 }}
                >
                  <LinearGradient
                    colors={["transparent", colors.primary, "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Animated.View>
              </View>
              <Heading
                size="3xl"
                style={{ fontFamily: "Space Grotesk", fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}
              >
                Technician Portal
              </Heading>
              <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
                Please verify your identity
              </Text>
            </View>

            {/* Input Form */}
            <VStack space="xl">
              {step === "phone" ? (
                <Box>
                  <Text
                    style={{ fontFamily: "Inter", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: colors.textSecondary, marginBottom: 8, marginLeft: 4 }}
                  >
                    Phone Number
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      height: 56,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.borderInput,
                      backgroundColor: colors.bgInput,
                    }}
                  >
                    <Smartphone color={colors.textSecondary} size={24} style={{ marginRight: 12 }} />
                    <Input variant="unstyled" style={{ flex: 1, height: "100%" }}>
                      <InputField
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor={colors.placeholderText}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        style={{ fontFamily: "Inter", fontSize: 14, color: colors.textPrimary, flex: 1, height: "100%", backgroundColor: "transparent" }}
                      />
                    </Input>
                  </View>
                </Box>
              ) : (
                <Box>
                  <Text
                    style={{ fontFamily: "Inter", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: colors.secondary, marginBottom: 8, marginLeft: 4 }}
                  >
                    Enter the code sent to your phone
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      height: 56,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.secondaryBorder,
                      backgroundColor: colors.bgInput,
                    }}
                  >
                    <KeyRound color={colors.secondary} size={24} style={{ marginRight: 12 }} />
                    <Input variant="unstyled" style={{ flex: 1, height: "100%" }}>
                      <InputField
                        placeholder="000 000"
                        placeholderTextColor={colors.placeholderText}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={6}
                        style={{ fontFamily: "Inter", fontSize: 14, fontWeight: "700", letterSpacing: 8, color: colors.textPrimary, flex: 1, height: "100%", backgroundColor: "transparent" }}
                      />
                    </Input>
                  </View>
                </Box>
              )}

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={step === "phone" ? handleSendOtp : handleVerifyOtp}
                disabled={isSending || isVerifying}
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 12,
                  overflow: "hidden",
                  marginTop: 8,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 0 },
                }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isSending || isVerifying ? (
                    <ButtonSpinner color={colors.bgPrimary} />
                  ) : (
                    <>
                      <Text style={{ fontFamily: "Space Grotesk", fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, color: colors.bgPrimary }}>
                        {step === "phone" ? "Send OTP" : "Verify & Login"}
                      </Text>
                      <ArrowRight color={colors.bgPrimary} size={20} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Help links */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4, marginTop: 8 }}>
                <TouchableOpacity onPress={() => Alert.alert("Help", "Contact IT Service Desk")}>
                  <Text style={{ fontFamily: "Inter", fontSize: 10, textTransform: "uppercase", letterSpacing: -0.5, color: colors.textSecondary }}>
                    Help Center
                  </Text>
                </TouchableOpacity>
                {step === "otp" ? (
                  <TouchableOpacity onPress={() => setStep("phone")}>
                    <Text style={{ fontFamily: "Inter", fontSize: 10, textTransform: "uppercase", letterSpacing: -0.5, color: colors.textSecondary }}>
                      Change Method
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => Alert.alert("Change Method", "Login method options")}>
                    <Text style={{ fontFamily: "Inter", fontSize: 10, textTransform: "uppercase", letterSpacing: -0.5, color: colors.textSecondary }}>
                      Change Method
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </VStack>

            {/* Divider */}
            <View style={{ marginTop: 64, flexDirection: "row", alignItems: "center", gap: 16 }}>
              <LinearGradient
                colors={colors.gradientDivider}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, height: 1 }}
              />
              <Text style={{ fontFamily: "Inter", fontSize: 10, textTransform: "uppercase", letterSpacing: 4, color: colors.textMuted }}>
                Secure Login
              </Text>
              <LinearGradient
                colors={colors.gradientDivider}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, height: 1 }}
              />
            </View>

            {/* Bottom Action */}
            <View style={{ marginTop: 32, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.textSecondary }}>
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 4 }}
                onPress={() => Alert.alert("Sign Up", "Contact administrator to provision a new technician account.")}
              >
                <Text style={{ fontFamily: "Inter", fontWeight: "700", fontSize: 14, color: colors.primary }}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Decorative Bottom Shell */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 16,
            opacity: 0.6,
          }}
        >
          <Text style={{ fontFamily: "Inter", fontSize: 10, textTransform: "uppercase", letterSpacing: 4, color: colors.textFaint }}>
            Secure Session
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Fingerprint color={colors.textFaint} size={16} />
            <Lock color={colors.textFaint} size={16} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
