import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@services/api/authApi";
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
import {
  Wrench,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  KeyRound,
  ChevronLeft,
} from "lucide-react-native";

export default function OtpLoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState("phone");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  // Icon pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Step slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step]);

  function startCooldown() {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOtp() {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    if (!/^\+?\d{7,15}$/.test(trimmedPhone)) {
      Alert.alert(
        "Error",
        "Please enter a valid phone number (7–15 digits, optional leading +)",
      );
      return;
    }
    try {
      const res = await sendOtp({ phone: trimmedPhone }).unwrap();
      setSessionId(res.data.sessionId);
      slideAnim.setValue(40);
      setStep("otp");
      startCooldown();
    } catch (error) {
      const errorMsg =
        error?.data?.message ||
        error?.data ||
        error?.message ||
        "Failed to send OTP";
      Alert.alert("Error", String(errorMsg));
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || isSending) return;
    try {
      const res = await sendOtp({ phone: phone.trim() }).unwrap();
      setSessionId(res.data.sessionId);
      startCooldown();
    } catch (error) {
      const errorMsg =
        error?.data?.message ||
        error?.data ||
        error?.message ||
        "Failed to resend OTP";
      Alert.alert("Error", String(errorMsg));
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }
    if (!sessionId) {
      Alert.alert("Error", "Session ID missing. Please resend OTP.");
      return;
    }
    try {
      const result = await verifyOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        sessionId,
      }).unwrap();
      const { token, isFirstLogin, ...user } = result?.data ?? {};
      await StorageUtils.saveToken(token);
      dispatch(setCredentials({ token, user, isFirstLogin: !!isFirstLogin }));
      if (isFirstLogin) navigation.navigate(RouteNames.SETUP_PROFILE);
    } catch (error) {
      const errorMsg =
        error?.data?.message ||
        error?.data ||
        error?.message ||
        "OTP verification failed";
      Alert.alert("Error", String(errorMsg));
    }
  }

  function handleBack() {
    slideAnim.setValue(-40);
    setOtp("");
    setStep("phone");
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(0);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Background blobs */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View
            style={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: 999,
              backgroundColor: colors.primaryMuted,
              opacity: 0.13,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -60,
              left: -80,
              width: 220,
              height: 220,
              borderRadius: 999,
              backgroundColor: colors.secondary,
              opacity: 0.09,
            }}
          />
        </View>

        {/* Top bar */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {step === "otp" ? (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingRight: 12,
              }}
            >
              <ChevronLeft color={colors.primary} size={20} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Wrench color={colors.primary} size={18} />
              <Text
                style={{
                  fontFamily: "Inter",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: colors.textMuted,
                }}
              >
                Technician App
              </Text>
            </View>
          )}
        </View>

        {/* Main content */}
        <View
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}
        >
          {/* Logo + Title */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: colors.bgCard,
                borderWidth: 1.5,
                borderColor: colors.borderLight,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                shadowColor: colors.primary,
                shadowOpacity: 0.18,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <ShieldCheck color={colors.primary} size={36} strokeWidth={1.8} />
            </Animated.View>

            <Heading
              size="2xl"
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: "700",
                color: colors.textPrimary,
                textAlign: "center",
                letterSpacing: -0.5,
                marginBottom: 6,
              }}
            >
              {step === "phone" ? "Welcome back" : "Enter your code"}
            </Heading>
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {step === "phone"
                ? "Enter your phone number to receive\na one-time passcode"
                : `We sent a 6-digit code to\n${phone}`}
            </Text>
          </View>

          {/* Input Card */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <VStack space="lg">
              {step === "phone" ? (
                <Box>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      color: colors.textMuted,
                      marginBottom: 8,
                      marginLeft: 2,
                    }}
                  >
                    Phone Number
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      height: 54,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: colors.borderInput,
                      backgroundColor: colors.bgInput,
                    }}
                  >
                    <Smartphone
                      color={colors.textSecondary}
                      size={20}
                      style={{ marginRight: 12 }}
                    />
                    <Input
                      variant="unstyled"
                      style={{ flex: 1, height: "100%" }}
                    >
                      <InputField
                        placeholder="+91 98765 43210"
                        placeholderTextColor={colors.placeholderText}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        returnKeyType="done"
                        onSubmitEditing={handleSendOtp}
                        style={{
                          fontFamily: "Inter",
                          fontSize: 15,
                          color: colors.textPrimary,
                          flex: 1,
                          height: "100%",
                          backgroundColor: "transparent",
                        }}
                      />
                    </Input>
                  </View>
                </Box>
              ) : (
                <Box>
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      color: colors.textMuted,
                      marginBottom: 8,
                      marginLeft: 2,
                    }}
                  >
                    Verification Code
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      height: 54,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: colors.secondaryBorder,
                      backgroundColor: colors.bgInput,
                    }}
                  >
                    <KeyRound
                      color={colors.secondary}
                      size={20}
                      style={{ marginRight: 12 }}
                    />
                    <Input
                      variant="unstyled"
                      style={{ flex: 1, height: "100%" }}
                    >
                      <InputField
                        placeholder="• • • • • •"
                        placeholderTextColor={colors.placeholderText}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={6}
                        returnKeyType="done"
                        onSubmitEditing={handleVerifyOtp}
                        style={{
                          fontFamily: "Inter",
                          fontSize: 22,
                          fontWeight: "700",
                          letterSpacing: 10,
                          color: colors.textPrimary,
                          flex: 1,
                          height: "100%",
                          backgroundColor: "transparent",
                        }}
                      />
                    </Input>
                  </View>
                </Box>
              )}

              {/* Primary CTA */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={step === "phone" ? handleSendOtp : handleVerifyOtp}
                disabled={isSending || isVerifying}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 14,
                  overflow: "hidden",
                  marginTop: 4,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  {isSending || isVerifying ? (
                    <ButtonSpinner color={colors.bgPrimary} />
                  ) : (
                    <>
                      <Text
                        style={{
                          fontFamily: "Space Grotesk",
                          fontWeight: "700",
                          fontSize: 15,
                          letterSpacing: 0.5,
                          color: colors.bgPrimary,
                        }}
                      >
                        {step === "phone" ? "Send Otp" : "Verify & Sign In"}
                      </Text>
                      <ArrowRight
                        color={colors.bgPrimary}
                        size={18}
                        strokeWidth={2.5}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend (OTP step only) */}
              {step === "otp" && (
                <View style={{ alignItems: "center", marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendCooldown > 0 || isSending}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontSize: 13,
                        color:
                          resendCooldown > 0
                            ? colors.textMuted
                            : colors.primary,
                        fontWeight: resendCooldown > 0 ? "400" : "600",
                      }}
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </VStack>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={{ paddingBottom: 28, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 11,
              color: colors.textFaint,
              letterSpacing: 0.5,
            }}
          >
            Authorized personnel only · Secure session
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
