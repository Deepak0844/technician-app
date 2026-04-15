import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
import { Provider, useDispatch, useSelector } from "react-redux";
import { registerRootComponent } from "expo";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Disable the strict mode warning for Reanimated reading from shared values during render
// (often triggered by third-party UI libraries like BottomSheet or Gluestack)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import "./global.css";
import { GluestackUIProvider } from "./src/components/ui/gluestack-ui-provider";

// Store
import store from "./src/store/index";
import { initializeAuth } from "./src/store/slices/authSlice";
import { initializeTheme } from "./src/store/slices/themeSlice";

// ... (skipping some imports for brevity in TargetContent matching)

// Navigation
import AppNavigator from "./src/navigation/AppNavigator";
import NotificationUtils from "./src/utils/notificationUtils";

// Components
import ErrorBoundary from "./src/components/ErrorBoundary";

// Api slices (side-effect imports to register endpoints with the store)
import "./src/services/api/authApi";
import "./src/services/api/customerApi";
import "./src/services/api/jobApi";
import "./src/services/api/dashboardApi";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * AppBootstrap — runs before any screen renders:
 * 1. Checks stored JWT → validates with server → restores session
 * 2. Shows splash spinner until tokenLoaded = true (no login flash)
 * 3. On auth: requests OS notification permission for local reminders
 */
function AppBootstrap() {
  const dispatch = useDispatch();
  const tokenLoaded = useSelector((state) => state.auth.tokenLoaded);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(
    function bootstrap() {
      dispatch(initializeAuth());
      dispatch(initializeTheme());
    },
    [dispatch],
  );

  // Once authenticated, request OS notification permission (needed for local notifications on iOS)
  useEffect(
    function requestNotificationPermission() {
      if (!isAuthenticated) return;
      NotificationUtils.requestPermissions();
    },
    [isAuthenticated],
  );

  // Request Location Permissions on App Start
  useEffect(function requestLocationPermission() {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied at startup");
        }
      } catch (err) {
        console.warn("Failed to request location permission at startup:", err);
      }
    })();
  }, []);

  const isThemeInitialized = useSelector((state) => state.theme.isInitialized);

  if (!tokenLoaded || !isThemeInitialized) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <AppNavigator />;
}

function RootApp() {
  const mode = useSelector((state) => state.theme.mode);
  return (
    <GluestackUIProvider mode={mode}>
      <AppBootstrap />
    </GluestackUIProvider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Provider store={store}>
          <RootApp />
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
});

registerRootComponent(App);

export default App;
