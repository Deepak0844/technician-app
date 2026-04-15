import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { syncQueue } from "@db/schema";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@services/api/jobApi";
import api from "@services/api";
import useNetworkStatus from "@hooks/useNetworkStatus";
import NotificationUtils from "@utils/notificationUtils";
import { setSyncQueueCount, setSyncing } from "@store/slices/syncSlice";

/**
 * SyncManager — headless component mounted once in AppBootstrap.
 *
 * Responsibilities:
 * - On mount: load initial queue count into Redux.
 * - When device comes online: drain sync_queue by replaying queued API calls.
 * - On each successful sync: invalidate RTK Query "Jobs" / "Dashboard" tags
 *   so lists refresh automatically.
 *
 * Retries: failed entries have their retry counter incremented and stay in the
 * queue for the next online event. After 5 failures the entry is abandoned to
 * avoid infinite loops.
 */
const MAX_RETRIES = 5;

export default function SyncManager() {
  const dispatch = useDispatch();
  const { isConnected } = useNetworkStatus();
  const [createJob] = useCreateJobMutation();
  const [updateJob] = useUpdateJobMutation();

  /** Recount queue rows and push to Redux state. */
  const refreshCount = useCallback(async () => {
    try {
      const rows = await db.select({ id: syncQueue.id }).from(syncQueue);
      dispatch(setSyncQueueCount(rows.length));
    } catch {
      // DB not ready yet — ignore
    }
  }, [dispatch]);

  /** Drain all queued operations now that we are online. */
  const drain = useCallback(async () => {
    let rows;
    try {
      rows = await db.select().from(syncQueue).orderBy(syncQueue.createdAt);
    } catch {
      return;
    }
    if (rows.length === 0) return;

    dispatch(setSyncing(true));
    let synced = 0;

    for (const entry of rows) {
      // Abandon entries that have already failed too many times
      if (entry.retries >= MAX_RETRIES) {
        await db.delete(syncQueue).where(eq(syncQueue.id, entry.id));
        continue;
      }

      try {
        const payload = JSON.parse(entry.payload);

        if (entry.operation === "CREATE_JOB") {
          const result = await createJob(payload).unwrap();
          if (result?.data?._id) {
            await NotificationUtils.scheduleJobReminders(result.data);
          }
        } else if (entry.operation === "UPDATE_JOB") {
          await updateJob({ id: entry.resourceId, ...payload }).unwrap();
        }

        await db.delete(syncQueue).where(eq(syncQueue.id, entry.id));
        synced++;
      } catch {
        await db
          .update(syncQueue)
          .set({ retries: entry.retries + 1 })
          .where(eq(syncQueue.id, entry.id));
      }
    }

    if (synced > 0) {
      // Refresh all cached job/dashboard data in RTK Query
      dispatch(api.util.invalidateTags(["Jobs", "Dashboard"]));
    }

    dispatch(setSyncing(false));
    await refreshCount();
  }, [createJob, updateJob, dispatch, refreshCount]);

  // Load count once on mount
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Auto-drain whenever the device comes back online
  useEffect(() => {
    if (isConnected === true) {
      drain();
    }
  }, [isConnected, drain]);

  return null;
}
