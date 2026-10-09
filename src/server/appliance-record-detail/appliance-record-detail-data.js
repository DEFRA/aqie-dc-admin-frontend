import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the full appliance detail record by ID.
 * Uses GET /appliances/{id} which returns the mapped appliance detail shape
 * including isLegacyRecord, certifications, and all technical fields.
 */
export async function getApplianceDetail(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}
