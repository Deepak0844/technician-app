import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { registerRootComponent } from "expo";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as Contacts from "expo-contacts";
import { LogBox } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { GluestackUIProvider } from "./src/components/ui/gluestack-ui-provider";

// Store
import { createAppStore } from "./src/store/index";
import {
  clearCredentials,
  setBootstrapToken,
} from "./src/store/slices/authSlice";
import StorageUtils from "./src/utils/storageUtils";

// Navigation
import AppNavigator from "./src/navigation/AppNavigator";
import NotificationUtils from "./src/utils/notificationUtils";
import { navigateToJobDetails } from "./src/navigation/navigationRef";

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

// NativeWind (react-native-css-interop) touches RN's deprecated ImageBackground
// on import; the app doesn't use it. Dev-only toast, remove once NativeWind fixes it.
LogBox.ignoreLogs(["ImageBackground is deprecated"]);

// Keep the native splash visible until bootstrap (auth + theme) completes
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
  const isReady = tokenLoaded;

  useEffect(
    function bootstrap() {
      StorageUtils.getToken().then((token) => {
        if (!token) {
          dispatch(clearCredentials()); // no token → tokenLoaded = true immediately
          return;
        }
        // Stash raw token in Redux so offline fallback in getMe.matchRejected can use it
        dispatch(setBootstrapToken(token));
        // Validate with server; authSlice.extraReducers handles the result
        dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
        );
      });
    },
    [dispatch],
  );

  // Request all required permissions once after the user is authenticated
  useEffect(
    function requestAllPermissions() {
      if (!isAuthenticated || !isReady) return;

      const timer = setTimeout(async () => {
        try {
          // 1. Notifications
          await NotificationUtils.requestPermissions();

          // 2. Location (foreground)
          const { status: locStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (locStatus !== "granted") {
            console.log("[Permissions] Location permission denied.");
          }

          // 3. Contacts
          const { status: contactsStatus } =
            await Contacts.requestPermissionsAsync();
          if (contactsStatus !== "granted") {
            console.log("[Permissions] Contacts permission denied.");
          }
        } catch (err) {
          console.warn("[Permissions] Error requesting permissions:", err);
        }
      }, 800);

      return () => clearTimeout(timer);
    },
    [isAuthenticated, isReady],
  );

  // Handle notification taps (foreground / background) — navigate to Job Details
  useEffect(function handleNotificationTap() {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const jobId = response.notification.request.content.data?.jobId;
        if (jobId) navigateToJobDetails(jobId);
      },
    );
    return () => subscription.remove();
  }, []);

  // Cold launch: app was fully quit when the user tapped the notification.
  // useLastNotificationResponse is the non-deprecated replacement for getLastNotificationResponseAsync.
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(
    function handleColdLaunchNotificationTap() {
      if (!lastNotificationResponse) return;
      if (
        lastNotificationResponse.actionIdentifier !==
        Notifications.DEFAULT_ACTION_IDENTIFIER
      )
        return;
      const jobId =
        lastNotificationResponse.notification.request.content.data?.jobId;
      if (jobId) {
        navigateToJobDetails(jobId);
        Notifications.clearLastNotificationResponse();
      }
    },
    [lastNotificationResponse],
  );

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
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AppBootstrap />
    </GluestackUIProvider>
  );
}

function App() {
  const [store, setStore] = React.useState(null);

  React.useEffect(() => {
    createAppStore().then(setStore);
  }, []);

  // Native splash is still visible while store initialises (~5-15ms)
  if (!store) return null;

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
