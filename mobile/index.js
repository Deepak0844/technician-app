import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { registerRootComponent } from "expo";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";
import { GluestackUIProvider } from "./src/components/ui/gluestack-ui-provider";

// Store
import store from "./src/store/index";
import { clearCredentials } from "./src/store/slices/authSlice";
import StorageUtils from "./src/utils/storageUtils";
import { initializeTheme } from "./src/store/slices/themeSlice";

// Navigation
import AppNavigator from "./src/navigation/AppNavigator";
import NotificationUtils from "./src/utils/notificationUtils";

// Components
import ErrorBoundary from "./src/components/ErrorBoundary";

// Api slices (side-effect imports to register endpoints with the store)
import { authApi } from "./src/services/api/authApi";
import "./src/services/api/customerApi";
import "./src/services/api/jobApi";
import "./src/services/api/dashboardApi";

// Disable the strict mode warning for Reanimated reading from shared values during render
// (often triggered by third-party UI libraries like BottomSheet or Gluestack)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Keep the native splash visible until bootstrap (auth + theme) completes
SplashScreen.preventAutoHideAsync();

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
      dispatch(initializeTheme());
      StorageUtils.getToken().then((token) => {
        if (!token) {
          dispatch(clearCredentials()); // no token → tokenLoaded = true immediately
          return;
        }
        // Token exists → validate with server; authSlice.extraReducers handles the result
        dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
        );
      });
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
  const isReady = tokenLoaded && isThemeInitialized;

  useEffect(
    function hideSplashWhenReady() {
      if (isReady) SplashScreen.hideAsync();
    },
    [isReady],
  );

  if (!isReady) return null; // native splash is still covering the screen

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

registerRootComponent(App);

export default App;
