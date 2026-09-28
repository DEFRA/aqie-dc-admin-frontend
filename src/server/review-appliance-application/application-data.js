import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetches one application by ID with the associated appliances summary (name and technical approval status).
 */

export async function getApplianceApplication(applicationId) {
  return fetchJson(
    `/applications/${encodeURIComponent(applicationId)}/summary?type=appliance`
  )
}

/**
 * Marks an application as in progress once a reviewer has started reviewing it.
 * @param {string} applicationId - The application ID
 * @param {object} reviewedBy - The signed-in reviewer { name, email }
 * @returns {Promise<object>} The backend response
 */
export async function startApplicationReview(applicationId, reviewedBy) {
  return patchJson(
    `/applications/${encodeURIComponent(applicationId)}/in-progress`,
    { reviewedBy }
  )
}
