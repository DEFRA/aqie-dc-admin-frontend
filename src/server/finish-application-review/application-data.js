import { fetchJson, patchJson } from '../common/api/api.js'

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

/**
 * Marks an application as complete once every linked item has been reviewed.
 * @param {string} applicationId - The application ID
 * @param {object} reviewedBy - The signed-in reviewer { name, email }
 * @returns {Promise<object>} The backend response
 */
export async function completeApplication(applicationId, reviewedBy) {
  return patchJson(
    `/applications/${encodeURIComponent(applicationId)}/complete`,
    {
      reviewedBy
    }
  )
}
