import * as SecureStore from "expo-secure-store";

/**
 * A redux-persist storage adapter backed by expo-secure-store.
 *
 * SecureStore values are hardware-backed and encrypted at rest on both iOS
 * (Secure Enclave / Keychain) and Android (Keystore). iOS enforces a ~2048-byte
 * limit per entry, so values larger than that are automatically split into
 * 1800-byte chunks and reassembled on read.
 *
 * Drop-in replacement for AsyncStorage in redux-persist configs when the
 * data being persisted is sensitive (e.g. draft jobs with PII).
 */

const CHUNK_SIZE = 1800; // safely under iOS 2048-byte per-entry ceiling
const CHUNK_SUFFIX = "__ck__"; // chunk data suffix
const COUNT_SUFFIX = "__cn__"; // chunk count suffix

function splitIntoChunks(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks.length ? chunks : [""];
}

async function setItem(key, value) {
  try {
    const chunks = splitIntoChunks(value, CHUNK_SIZE);
    // Store the chunk count first so getItem knows how many to fetch
    await SecureStore.setItemAsync(`${key}${COUNT_SUFFIX}`, String(chunks.length));
    await Promise.all(
      chunks.map((c, i) => SecureStore.setItemAsync(`${key}${CHUNK_SUFFIX}${i}`, c)),
    );
  } catch (err) {
    console.warn("[SecureStorage] setItem failed:", err?.message);
  }
}

async function getItem(key) {
  try {
    const countStr = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
    if (!countStr) return null;
    const count = parseInt(countStr, 10);
    if (!count || count < 1) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(`${key}${CHUNK_SUFFIX}${i}`),
      ),
    );
    if (chunks.some((c) => c === null)) return null;
    return chunks.join("");
  } catch {
    return null;
  }
}

async function removeItem(key) {
  try {
    const countStr = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    await Promise.all([
      SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`),
      ...Array.from({ length: count }, (_, i) =>
        SecureStore.deleteItemAsync(`${key}${CHUNK_SUFFIX}${i}`),
      ),
    ]);
  } catch (err) {
    console.warn("[SecureStorage] removeItem failed:", err?.message);
  }
}

const SecureStorageAdapter = { setItem, getItem, removeItem };

export default SecureStorageAdapter;
