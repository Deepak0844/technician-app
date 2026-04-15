import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Offline sync queue — stores job create/update operations made while offline.
 * SyncManager drains this table automatically when the device comes back online.
 */
export const syncQueue = sqliteTable("sync_queue", {
  id: text("id").primaryKey(),
  operation: text("operation").notNull(), // 'CREATE_JOB' | 'UPDATE_JOB'
  resourceId: text("resource_id"),        // null for CREATE, job._id for UPDATE
  payload: text("payload").notNull(),     // JSON stringified job payload
  retries: integer("retries").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
