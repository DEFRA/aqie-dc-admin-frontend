import { fetchJson, patchJson } from '../common/api/api.js'
import { normaliseApplicationsSummary } from './fuel-applications-helpers.js'

/**
 * Fetches fuel application summaries split by review status.
 * @returns {Promise<object>} Fuel application summary payload.
 */
export async function getFuelApplications() {
  const response =
    (await fetchJson('/applications/summary-by-status?type=fuel')) ?? {}

  return {
    ...response,
    data: normaliseApplicationsSummary(response)
  }
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
