import * as SecureStore from "expo-secure-store";
import { db } from "@db";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

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
 * Theme preference stored in SQLite settings table.
 * Keeps all local persistence in one place — no AsyncStorage dependency.
 */
async function saveTheme(mode) {
  await db
    .insert(settings)
    .values({ key: THEME_KEY, value: mode })
    .onConflictDoUpdate({ target: settings.key, set: { value: mode } });
}

async function getTheme() {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, THEME_KEY))
      .limit(1);
    return rows[0]?.value ?? null;
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
