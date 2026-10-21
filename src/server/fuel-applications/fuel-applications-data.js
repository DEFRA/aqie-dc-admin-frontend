import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetches fuel application summaries split by review status.
 * The backend contract is guaranteed and returns empty arrays when there are no
 * applications.
 */
export async function getFuelApplications() {
  return fetchJson('/applications/summary-by-status?type=fuel')
}

/**
 * Marks a fuel application as in progress once a reviewer has started reviewing it.
 * @param {string} applicationId - The application ID.
 * @param {object} reviewedBy - The signed-in reviewer object.
 * @returns {Promise<object>} The backend response.
 */
export async function startFuelApplicationReview(applicationId, reviewedBy) {
  return patchJson(
    `/applications/${encodeURIComponent(applicationId)}/in-progress`,
    { reviewedBy }
  )
}
