import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

// Screens
import OtpLoginScreen from "@screens/OtpLoginScreen";
import SetupProfileScreen from "@screens/SetupProfileScreen";

// Constants
import { RouteNames } from "@constants/routeNames";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const isFirstLogin = useSelector((state) => state.auth.isFirstLogin);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={
        isFirstLogin ? RouteNames.SETUP_PROFILE : RouteNames.OTP_LOGIN
      }
    >
      <Stack.Screen name={RouteNames.OTP_LOGIN} component={OtpLoginScreen} />
      <Stack.Screen
        name={RouteNames.SETUP_PROFILE}
        component={SetupProfileScreen}
      />
    </Stack.Navigator>
  );
}
