import { useEffect, useRef } from "react";
import { useGetJobsQuery } from "../services/api/jobApi";
import NotificationUtils from "../utils/notificationUtils";

/**
 * Reschedules local reminders for all active jobs once on app start.
 *
 * Strategy:
 *  - Fetches the first page of jobs (large limit) on mount.
 *  - Runs rescheduleAllReminders exactly once when data arrives.
 *  - Skips if the query is still loading or has errored.
 *
 * This recovers from the Android reboot scenario where all scheduled
 * OS alarms are wiped. iOS is unaffected but the call is a no-op there
 * since all triggers are already in the past or still valid.
 */
export default function useRescheduleRemindersOnAppStart() {
  const hasRescheduled = useRef(false);

  // Fetch a broad list of jobs — only pending & in_progress ones matter,
  // but filtering on the server is optional; rescheduleAllReminders
  // skips terminal jobs itself.
  const { data, isSuccess } = useGetJobsQuery({ limit: 100, page: 1 });

  useEffect(() => {
    // Guard: only run once, and only when we have real data
    if (hasRescheduled.current || !isSuccess) return;

    const jobs = data?.data ?? data?.jobs ?? [];
    if (jobs.length === 0) return;

    hasRescheduled.current = true;

    NotificationUtils.rescheduleAllReminders(jobs).catch((err) => {
      if (__DEV__)
        console.warn("[useRescheduleRemindersOnAppStart] Error:", err);
    });
  }, [isSuccess, data]);
}
