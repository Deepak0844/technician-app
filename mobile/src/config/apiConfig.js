/**
 * API base URL configuration.
 *
 * For production builds, set EXPO_PUBLIC_API_URL in mobile/.env
 *
 * For dev, the host is resolved from the Expo dev server (Constants.expoConfig.hostUri)
 * so the correct IP is used automatically on any network/machine.
 * You can override the API port via EXPO_PUBLIC_DEV_PORT (defaults to 9000).
 * If the Expo host cannot be determined, set EXPO_PUBLIC_DEV_HOST as a fallback.
 *
 * Example mobile/.env:
 *   EXPO_PUBLIC_DEV_PORT=3000
 *   EXPO_PUBLIC_API_URL=https://your-server.com/api/v1
 */
import Constants from "expo-constants";

const DEV_SERVER_PORT = process.env.EXPO_PUBLIC_DEV_PORT ?? 9000;
const PROD_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!__DEV__ && !PROD_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Add it to mobile/.env before building for production.",
  );
}

const getDevBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri
    ? hostUri.split(":")[0]
    : (process.env.EXPO_PUBLIC_DEV_HOST ?? "localhost");
  return `http://${host}:${DEV_SERVER_PORT}/api/v1`;
};

const API_BASE_URL = __DEV__ ? getDevBaseUrl() : PROD_BASE_URL;
export { API_BASE_URL };
