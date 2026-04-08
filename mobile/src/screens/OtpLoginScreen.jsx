import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import { Alert, KeyboardAvoidingView, Platform, View, Animated, Easing, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useSendOtpMutation, useVerifyOtpMutation } from "../services/api/authApi";
import { setCredentials } from "../store/slices/authSlice";
import StorageUtils from "../utils/storageUtils";
import { LinearGradient } from "expo-linear-gradient";


// Gluestack Primitives
import { VStack } from "../components/ui/vstack";
import { Box } from "../components/ui/box";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { Input, InputField } from "../components/ui/input";
import { ButtonSpinner } from "../components/ui/button";

// Icons
import { Terminal, ShieldCheck, Smartphone, ArrowRight, Fingerprint, Lock, KeyRound } from "lucide-react-native";

export default function OtpLoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState("phone");
  const dispatch = useDispatch();
  const [sessionInfo, setSessionInfo] = useState(null);
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
    } catch (error) {
      const errorMsg = error?.data?.message || error?.data || error?.message || "OTP verification failed";
      Alert.alert("Error", String(errorMsg));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#000000' }} behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 overflow-hidden">

        {/* Background Decoration Image */}
        <Image
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkN6DFsmnByBHAUsGPnn8oEfZ1tY0dMy4dp4Jivlz8fNKvaKo0btrAJ92NTTHRFXb7Z5rW3RDT5QBA-Ody6NVHyWssTxG661idIQUxt8AQxigwanc8Ee2QMD6AvJO9kJ-fmj-2eX7fbM31YRMrhFLAMKJ26m-0fzJCU3XslnlGTN6am_sWKRX3nN4pcMmXjzcxRE931XI4mmEIgF64eEqsCkIcktb05ANggOPldbgB9rhN0nvFHMXakr8IcOO5EcYowsWRthOaIu11" }}
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          style={{ tintColor: 'gray' }}
        />

        {/* Aesthetic Background Elements */}
        <View className="absolute inset-0 pointer-events-none overflow-hidden">
          <View className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#6d31a3] opacity-20 rounded-full" style={{ transform: [{ scale: 1.5 }], shadowColor: '#6d31a3', shadowOffset: { width: 0, height: 0 }, shadowRadius: 100, shadowOpacity: 1 }} />
          <View className="absolute -bottom-[5%] -right-[5%] w-[30%] h-[30%] bg-[#81ecff] opacity-10 rounded-full" style={{ shadowColor: '#81ecff', shadowOffset: { width: 0, height: 0 }, shadowRadius: 100, shadowOpacity: 1 }} />
        </View>

        {/* TopAppBar */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          className="absolute top-0 w-full z-50 flex-row items-center justify-between px-4 pt-10 pb-6"
        >
          <TouchableOpacity className="flex-row items-center gap-2 active:scale-95 transition-transform" activeOpacity={0.7}>
            <Terminal color="#8B5CF6" size={20} />
            <Text className="font-heading uppercase tracking-widest text-sm text-[#a3a3a3]">Technician App</Text>
          </TouchableOpacity>
          <Text className="text-sm font-heading font-extrabold tracking-tighter text-[#8B5CF6]">LOGIN</Text>
        </LinearGradient>

        {/* Main Content Canvas */}
        <View className="flex-1 items-center justify-center px-4 relative z-10 w-full">

          {/* Login Container */}
          <View className="w-full max-w-md z-10 mt-10">

            {/* Branding/Icon Section */}
            <View className="flex-col items-center mb-12">
              <View className="relative w-20 h-20 mb-4 flex items-center justify-center rounded-2xl bg-[#1a1919] border border-[#737373]/30 overflow-hidden">
                <ShieldCheck color="#c899ff" size={40} />

                {/* Scanner Line */}
                <Animated.View
                  style={{ transform: [{ translateY }] }}
                  className="absolute w-full h-[2px]"
                >
                  <LinearGradient
                    colors={['transparent', '#c899ff', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full"
                  />
                </Animated.View>
              </View>
              <Heading size="3xl" className="font-heading font-bold tracking-tight text-[#ffffff] text-center mb-2">Technician Portal</Heading>
              <Text className="text-[#e5e5e5] text-sm font-label tracking-wide text-center" style={{ fontFamily: 'Inter' }}>Please verify your identity</Text>
            </View>

            {/* Input Form */}
            <VStack space="xl">
              {step === "phone" ? (
                <Box>
                  <Text className="text-xs font-label uppercase tracking-widest text-[#e5e5e5] mb-2 ml-1" style={{ fontFamily: 'Inter' }}>Phone Number</Text>
                  <View className="flex-row items-center px-4 h-14 rounded-xl border-2 border-[rgba(255,255,255,0.1)] bg-[#131313] focus-within:border-[#81ecff] transition-colors duration-300">
                    <Smartphone color="#e5e5e5" size={24} className="mr-3" />
                    <Input variant="unstyled" className="flex-1 h-full">
                      <InputField
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        className="text-sm font-heading tracking-[0.1em] text-[#ffffff] pb-1 w-full h-full bg-transparent border-0"
                      />
                    </Input>
                  </View>
                </Box>
              ) : (
                <Box>
                  <Text className="text-xs font-label uppercase tracking-widest text-[#81ecff] mb-2 ml-1" style={{ fontFamily: 'Inter' }}>Enter the code sent to your phone</Text>
                  <View className="flex-row items-center px-4 h-14 rounded-xl border-2 border-[#81ecff]/70 bg-[#131313]">
                    <KeyRound color="#81ecff" size={24} className="mr-3" />
                    <Input variant="unstyled" className="flex-1 h-full">
                      <InputField
                        placeholder="000 000"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={6}
                        className="text-sm font-heading font-bold tracking-[0.5em] text-[#ffffff] pb-1 w-full h-full bg-transparent border-0"
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
                className="w-full h-14 rounded-xl overflow-hidden mt-2"
                style={{ shadowColor: '#c899ff', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } }}
              >
                <LinearGradient
                  colors={['#c899ff', '#9c3dff']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  className="w-full h-full flex-row items-center justify-center gap-2"
                >
                  {isSending || isVerifying ? (
                    <ButtonSpinner color="#000000" />
                  ) : (
                    <>
                      <Text className="font-heading font-bold uppercase tracking-widest text-[#ffffff]">{step === "phone" ? "Send OTP" : "Verify & Login"}</Text>
                      <ArrowRight color="#000000" size={20} className="ml-1" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Help/Trouble links */}
              <View className="flex-row justify-between items-center px-1 mt-2">
                <TouchableOpacity onPress={() => { Alert.alert("Help", "Contact IT Service Desk"); }}>
                  <Text className="text-[10px] uppercase tracking-tighter text-[#e5e5e5]" style={{ fontFamily: 'Inter' }}>Help Center</Text>
                </TouchableOpacity>
                {step === "otp" ? (
                  <TouchableOpacity onPress={() => setStep("phone")}>
                    <Text className="text-[10px] uppercase tracking-tighter text-[#e5e5e5]" style={{ fontFamily: 'Inter' }}>Change Method</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => { Alert.alert("Change Method", "Login method options"); }}>
                    <Text className="text-[10px] uppercase tracking-tighter text-[#e5e5e5]" style={{ fontFamily: 'Inter' }}>Change Method</Text>
                  </TouchableOpacity>
                )}
              </View>
            </VStack>

            {/* Visual Divider */}
            <View className="mt-16 flex-row items-center gap-4">
              <LinearGradient colors={['transparent', 'rgba(73, 72, 71, 0.4)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 h-[1px]" />
              <Text className="text-[10px] font-label uppercase tracking-[0.2em] text-[#a3a3a3]" style={{ fontFamily: 'Inter' }}>Secure Login</Text>
              <LinearGradient colors={['transparent', 'rgba(73, 72, 71, 0.4)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 h-[1px]" />
            </View>

            {/* Bottom Action */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-[#e5e5e5] text-sm" style={{ fontFamily: 'Inter' }}>Don&apos;t have an account?</Text>
              <TouchableOpacity className="ml-1" onPress={() => Alert.alert("Sign Up", "Contact administrator to provision a new technician account.")}>
                <Text className="text-[#c899ff] font-bold text-sm" style={{ fontFamily: 'Inter' }}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* Decorative Bottom Shell */}
        <View className="absolute bottom-0 left-0 w-full z-50 flex-row justify-between items-center px-6 pb-6 pt-4 pointer-events-none opacity-60">
          <Text className="text-[10px] font-label uppercase tracking-widest text-[#52525b]" style={{ fontFamily: 'Inter' }}>Secure Session</Text>
          <View className="flex-row gap-4">
            <Fingerprint color="#52525b" size={16} />
            <Lock color="#52525b" size={16} />
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
