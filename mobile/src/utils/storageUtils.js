import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const THEME_KEY = "app_theme_mode";
const PALETTE_KEY = "app_theme_palette";

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
 * Refresh token, used to obtain a new access token when it expires.
 */
async function saveRefreshToken(token) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Delete stored access + refresh tokens (on logout / failed refresh).
 */
async function clearToken() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Theme preference stored in SecureStore.
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

async function savePalette(palette) {
  await SecureStore.setItemAsync(PALETTE_KEY, palette);
}

async function getPalette() {
  try {
    return await SecureStore.getItemAsync(PALETTE_KEY);
  } catch {
    return null;
  }
}

const StorageUtils = {
  saveToken,
  getToken,
  saveRefreshToken,
  getRefreshToken,
  clearToken,
  saveTheme,
  getTheme,
  savePalette,
  getPalette,
};

export default StorageUtils;
