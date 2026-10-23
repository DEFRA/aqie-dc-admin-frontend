import { fetchJson } from '../common/api/api.js'

/**
 * Calls the backend appliance record endpoint and returns the API response as-is.
 * The API layer handles non-2xx status handling; transformation stays in the helper layer.
 *
 * @param {string} applianceId - The appliance ID to retrieve
 * @returns {Promise<Object>} The raw backend response payload
 */
export async function getApplianceRecord(applianceId) {
  return fetchJson(`/admin/appliances/${encodeURIComponent(applianceId)}`)
}
