import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

const expoDb = SQLite.openDatabaseSync("technician-app.db");

// Enable WAL mode and create tables synchronously on first open.
expoDb.execSync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS sync_queue (
    id          TEXT PRIMARY KEY NOT NULL,
    operation   TEXT NOT NULL,
    resource_id TEXT,
    payload     TEXT NOT NULL,
    retries     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
  );
`);

export const db = drizzle(expoDb, { schema });
