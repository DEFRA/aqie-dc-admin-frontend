import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches one page (10 entries) of an appliance's action history, newest first.
 *
 * @param {string} applianceId
 * @param {number} [page]
 * @returns {Promise<{ success: boolean, data: { id: string, name: string, actions: Array<{ id: string, description: string, completedBy: string, completedAt: string }> }, pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
export async function getApplianceActionHistory(applianceId, page = 1) {
  return fetchJson(
    `/api/admin/appliances/${encodeURIComponent(applianceId)}/action-history?page=${encodeURIComponent(page)}`
  )
}
