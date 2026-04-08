import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

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

const StorageUtils = {
  saveToken,
  getToken,
  clearToken,
};

export default StorageUtils;
