import * as SecureStore from "expo-secure-store";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { settings } from "@db/schema";

const TOKEN_KEY = "auth_token";
const THEME_SETTING_KEY = "theme";

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
 * Theme preference — stored in the SQLite `settings` table.
 * The DB is initialized synchronously at module load (src/db/index.js),
 * so these async calls are always safe.
 */
async function saveTheme(mode) {
  await db
    .insert(settings)
    .values({ key: THEME_SETTING_KEY, value: mode })
    .onConflictDoUpdate({ target: settings.key, set: { value: mode } });
}

async function getTheme() {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, THEME_SETTING_KEY));
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
