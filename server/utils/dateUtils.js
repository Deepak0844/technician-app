/**
 * Timezone-aware date boundary utilities.
 *
 * All functions accept an IANA timezone string (e.g. "Asia/Kolkata") and
 * return plain Date objects that represent UTC instants corresponding to
 * the boundaries of today / this week / this month in that timezone.
 *
 * Falls back to the server's local timezone if the supplied value is
 * missing or invalid.
 */

const FALLBACK_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Given an IANA timezone name, return the UTC Date that corresponds to
 * midnight (00:00:00.000) of "today" in that timezone.
 */
function startOfTodayUTC(timezone) {
  const tz = timezone || FALLBACK_TZ;
  try {
    // Step 1 – get the local date string ("YYYY-MM-DD") in the target timezone
    const localDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
    }).format(new Date());

    const [year, month, day] = localDateStr.split("-").map(Number);

    // Step 2 – find the UTC offset at noon of that local date (using noon
    //           avoids DST boundary issues around midnight)
    const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(utcNoon);

    const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12");
    const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
    // offsetMinutes = local_noon_hour_min - 720  (positive = ahead of UTC)
    const offsetMinutes = h * 60 + m - 720;

    // Step 3 – midnight UTC = "local midnight" shifted back by the offset
    return new Date(
      Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMinutes * 60_000,
    );
  } catch {
    // Fallback: server-local midnight
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

/**
 * Returns an object with all commonly needed UTC date-range boundaries
 * computed in the given IANA timezone.
 *
 * @param {string} [timezone] IANA timezone (e.g. "Asia/Kolkata")
 * @returns {{
 *   todayStart: Date,
 *   todayEnd:   Date,
 *   weekStart:  Date,
 *   weekEnd:    Date,
 *   monthStart: Date,
 *   monthEnd:   Date,
 *   prevMonthStart: Date,
 *   prevMonthEnd:   Date,
 * }}
 */
function getDateBoundsInTZ(timezone) {
  const todayStart = startOfTodayUTC(timezone);

  // todayEnd = todayStart + 1 day
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Week boundaries (Monday–Sunday)
  // dayOfWeek in target timezone
  const tz = timezone || FALLBACK_TZ;
  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
  }).format(new Date());
  const localWeekdayStr = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(new Date());

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dow = weekdayMap[localWeekdayStr] ?? new Date().getDay();
  // Days since Monday (treat Sunday as 7 so it belongs to current week end)
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const weekStart = new Date(
    todayStart.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000,
  );
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Month boundaries in the target timezone
  const [year, month] = localDateStr.split("-").map(Number);

  // First day of current month in that timezone → convert to UTC
  const monthStartLocal = new Date(
    Date.UTC(year, month - 1, 1, 0, 0, 0) -
      (() => {
        try {
          const utcNoon = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
          const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          }).formatToParts(utcNoon);
          const h = parseInt(
            parts.find((p) => p.type === "hour")?.value ?? "12",
          );
          const m = parseInt(
            parts.find((p) => p.type === "minute")?.value ?? "0",
          );
          return (h * 60 + m - 720) * 60_000;
        } catch {
          return 0;
        }
      })(),
  );

  // First day of NEXT month → that is monthEnd
  const monthEndLocal = new Date(
    Date.UTC(year, month, 1, 0, 0, 0) -
      (() => {
        try {
          const utcNoon = new Date(Date.UTC(year, month, 1, 12, 0, 0));
          const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          }).formatToParts(utcNoon);
          const h = parseInt(
            parts.find((p) => p.type === "hour")?.value ?? "12",
          );
          const m = parseInt(
            parts.find((p) => p.type === "minute")?.value ?? "0",
          );
          return (h * 60 + m - 720) * 60_000;
        } catch {
          return 0;
        }
      })(),
  );

  // Previous month
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  const prevMonthStartLocal = new Date(
    Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0) -
      (() => {
        try {
          const utcNoon = new Date(
            Date.UTC(prevYear, prevMonth - 1, 1, 12, 0, 0),
          );
          const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          }).formatToParts(utcNoon);
          const h = parseInt(
            parts.find((p) => p.type === "hour")?.value ?? "12",
          );
          const m = parseInt(
            parts.find((p) => p.type === "minute")?.value ?? "0",
          );
          return (h * 60 + m - 720) * 60_000;
        } catch {
          return 0;
        }
      })(),
  );

  return {
    todayStart,
    todayEnd,
    weekStart,
    weekEnd,
    monthStart: monthStartLocal,
    monthEnd: monthEndLocal,
    prevMonthStart: prevMonthStartLocal,
    prevMonthEnd: monthStartLocal, // prev month ends where current month starts
  };
}

export { startOfTodayUTC, getDateBoundsInTZ };
