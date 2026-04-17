/**
 * API base URL configuration.
 *
 * For production builds, set EXPO_PUBLIC_API_URL in mobile/.env
 *
 * For dev, EXPO_PUBLIC_DEV_HOST is auto-written to mobile/.env by
 * scripts/set-dev-host.js (runs via npm prestart/preandroid/preios hooks)
 * using the machine's current LAN IP, so the app always connects to the
 * correct server regardless of network/machine changes.
 * You can override the port via EXPO_PUBLIC_DEV_PORT (defaults to 9000).
 *
 * Example mobile/.env:
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
  // EXPO_PUBLIC_DEV_HOST is set automatically to the machine's current LAN IP
  // by scripts/set-dev-host.js before every start/android/ios npm run.
  const host = process.env.EXPO_PUBLIC_DEV_HOST ?? "localhost";
  return `http://${host}:${DEV_SERVER_PORT}/api/v1`;
};

const API_BASE_URL = __DEV__ ? getDevBaseUrl() : PROD_BASE_URL;
export { API_BASE_URL };
