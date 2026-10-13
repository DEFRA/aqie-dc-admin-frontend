import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the raw appliance record from the backend API.
 *
 * This helper intentionally only communicates with the backend endpoint and does
 * not apply UI labels or view-model formatting. Those concerns belong in the
 * controller layer.
 *
 * @param {string} applianceId - The appliance ID to retrieve (will be URL-encoded)
 * @returns {Promise<Object>} Success response with the backend payload or error object
 */
export async function getApplianceRecord(applianceId) {
  const response = await fetchJson(
    `/api/admin/appliances/${encodeURIComponent(applianceId)}`
  )

  if (!response.success) {
    return {
      success: false,
      message: response.message || 'Failed to load appliance record'
    }
  }

  return {
    success: true,
    data: response.data
  }
}
