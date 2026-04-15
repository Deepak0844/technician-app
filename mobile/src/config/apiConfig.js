import Constants from "expo-constants";

/**
 * API base URL — dynamically resolves the dev server IP from Expo,
 * so you never need to hardcode your machine's IP again.
 *
 * For production builds, set EXPO_PUBLIC_API_URL in mobile/.env
 * For dev, set EXPO_PUBLIC_DEV_PORT (defaults to 9000 if unset)
 * Example:
 *   EXPO_PUBLIC_DEV_PORT=3000
 *   EXPO_PUBLIC_API_URL=https://your-server.com/api/v1
 */
const DEV_SERVER_PORT = process.env.EXPO_PUBLIC_DEV_PORT ?? 9000;
const PROD_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!__DEV__ && !PROD_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Add it to mobile/.env before building for production.",
  );
}

const getDevBaseUrl = () => {
  const host =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest?.debuggerHost ??
    "localhost";
  const ip = host.split(":")[0];
  return `http://${ip}:${DEV_SERVER_PORT}/api/v1`;
};

const API_BASE_URL = __DEV__ ? getDevBaseUrl() : PROD_BASE_URL;

export { API_BASE_URL };
