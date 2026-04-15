import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Offline draft jobs created while the device is offline.
 * `data` is a JSON-stringified job payload — parsed on read.
 */
export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull().default(""),
  applianceType: text("appliance_type").notNull().default(""),
  data: text("data").notNull(),          // JSON job payload
  lastSaved: text("last_saved").notNull(),
});

/**
 * Simple key-value store for user preferences (e.g. theme mode).
 * Uses a primary-key upsert so each key is always a single row.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
