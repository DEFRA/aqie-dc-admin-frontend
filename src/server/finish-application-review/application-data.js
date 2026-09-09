import { fetchJson } from '../common/api/api.js'

/**
 * Fetches application with linked items grouped by technical review status.
 * @param {string} applicationId - The application ID
 * @returns {Promise<object>} Application data including linked items (grouped by status)
 */
export async function getApplicationWithTechStatus(applicationId) {
  const data = await fetchJson(
    `/applications/${encodeURIComponent(applicationId)}?groupBy=techReviewStatus`
  )
  return data
}
