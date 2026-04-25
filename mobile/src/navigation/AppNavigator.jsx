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
import { StackNames } from "@constants/routeNames";
import { navigationRef } from "@navigation/navigationRef";
import useTheme from "@hooks/useTheme";

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { colors, mode } = useTheme();
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
    <NavigationContainer ref={navigationRef} theme={AppTheme}>
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
