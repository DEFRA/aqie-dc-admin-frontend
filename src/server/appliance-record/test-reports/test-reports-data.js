import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches the appliance record by ID to retrieve test reports data.
 * Uses /admin/appliances/{id} to ensure full access to all appliance data.
 */
export async function getTestReports(applianceId) {
  return fetchJson(`/admin/appliances/${encodeURIComponent(applianceId)}`)
}
