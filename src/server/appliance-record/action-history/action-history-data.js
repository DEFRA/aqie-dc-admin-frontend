import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches an appliance's action history, newest first.
 *
 * @param {string} applianceId
 * @returns {Promise<{ success: boolean, data: { id: string, name: string, actions: Array<{ id: string, description: string, completedBy: string, completedAt: string }> } }>}
 */
export async function getApplianceActionHistory(applianceId) {
  return fetchJson(
    `/api/admin/appliances/${encodeURIComponent(applianceId)}/action-history`
  )
}
