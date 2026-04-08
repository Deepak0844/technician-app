import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const THEME_KEY = "app_theme_mode";

/**
 * Save JWT token to hardware-backed encrypted storage.
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
 * Theme persistence
 */
async function saveTheme(mode) {
  await SecureStore.setItemAsync(THEME_KEY, mode);
}

async function getTheme() {
  try {
    return await SecureStore.getItemAsync(THEME_KEY);
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
