import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const THEME_KEY = "app_theme_mode";

/**
 * Save JWT token to hardware-backed encrypted storage (Keychain / Keystore).
 */
async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieve stored JWT token. Returns null if not found.
 */
async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Delete stored JWT token (on logout).
 */
async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Theme preference — not sensitive, plain AsyncStorage is appropriate.
 * Avoids consuming SecureStore's limited capacity on non-credentials.
 */
async function saveTheme(mode) {
  await AsyncStorage.setItem(THEME_KEY, mode);
}

async function getTheme() {
  try {
    return await AsyncStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

const StorageUtils = {
  saveToken,
  getToken,
  clearToken,
  saveTheme,
  getTheme,
};

export default StorageUtils;
