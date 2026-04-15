import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

/**
 * Open the database synchronously so Drizzle is ready before any async
 * thunk fires. expo-sqlite's openDatabaseSync is the correct API for
 * the Drizzle expo-sqlite adapter.
 */
const expoDb = SQLite.openDatabaseSync("technician-app.db");

/**
 * Create all tables on first run (and harmlessly skip on subsequent runs).
 * WAL mode gives better concurrent read performance for a mobile workload.
 * This runs synchronously at module-import time, so the DB is always ready.
 */
expoDb.execSync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS drafts (
    id             TEXT PRIMARY KEY NOT NULL,
    customer_name  TEXT NOT NULL DEFAULT '',
    appliance_type TEXT NOT NULL DEFAULT '',
    data           TEXT NOT NULL,
    last_saved     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`);

/** Drizzle client — use this for all DB queries across the app. */
export const db = drizzle(expoDb, { schema });
