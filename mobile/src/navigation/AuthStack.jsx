import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OtpLoginScreen from "../screens/OtpLoginScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
    </Stack.Navigator>
  );
}
