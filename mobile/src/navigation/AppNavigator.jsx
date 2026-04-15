import React from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import AuthStack from "@navigation/AuthStack";
import MainTabs from "@navigation/MainTabs";
import { DarkColors, LightColors } from "@constants/colors";
import { StackNames } from "@constants/routeNames";

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const mode = useSelector((state) => state.theme.mode);
  const colors = mode === "dark" ? DarkColors : LightColors;
  const BaseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  const AppTheme = {
    ...BaseTheme,
    colors: {
      ...BaseTheme.colors,
      background: colors.navBackground,
      card: colors.navCard,
      border: colors.navBorder,
      primary: colors.primary,
      text: colors.textPrimary,
    },
  };

  return (
    <NavigationContainer theme={AppTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name={StackNames.MAIN} component={MainTabs} />
        ) : (
          <RootStack.Screen name={StackNames.AUTH} component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
