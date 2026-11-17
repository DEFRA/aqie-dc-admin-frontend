import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches the appliance record by ID.
 * Used to retrieve legacy.comments field.
 */
export async function getLegacyComments(applianceId) {
  return fetchJson(`/admin/appliances/${encodeURIComponent(applianceId)}`)
}
