import { ApplianceTypes, ApplianceLimits } from "#constants/generalConstants.js";

const PRESETS = Object.values(ApplianceTypes);
const PRESET_BY_LOWER = new Map(PRESETS.map((name) => [name.toLowerCase(), name]));

/**
 * Cleans a list of appliance entries: trims names, uses the preset spelling
 * for preset names ("ac" -> "AC"), drops blanks and case-insensitive
 * duplicates, and flags names that are not presets as custom.
 *
 * @param {Array<{ type?: string, brand?: string }> | undefined} list
 * @returns {Array<{ type: string, isCustom: boolean, brand?: string }>}
 */
export function normalizeAppliances(list) {
  const seen = new Set();
  const result = [];
  for (const entry of list || []) {
    const name = String(entry?.type ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const preset = PRESET_BY_LOWER.get(key);
    const item = { type: preset ?? name, isCustom: !preset };
    const brand = String(entry?.brand ?? "").trim();
    if (brand) item.brand = brand;
    result.push(item);
  }
  return result.slice(0, ApplianceLimits.MAX_PER_JOB);
}

/** "AC, Refrigerator": kept in `applianceType` so older readers keep working. */
export function summarizeAppliances(appliances) {
  return (appliances || []).map((a) => a.type).join(", ");
}

/**
 * The appliances of a job. Jobs saved before multi-appliance support only
 * have `applianceType`, which is read as a single appliance.
 */
export function getJobAppliances(job) {
  // LEGACY: remove the applianceType branch after the data migration
  if (job?.appliances?.length) return job.appliances;
  return normalizeAppliances(
    job?.applianceType ? [{ type: job.applianceType }] : [],
  );
}
