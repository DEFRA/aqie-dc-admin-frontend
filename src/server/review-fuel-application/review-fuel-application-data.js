import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetches the full application payload for a fuel review.
 * The backend owns the response shape; the frontend should drill down to
 * `response.data` in the controller, matching the appliance review pattern.
 */
export async function getFuelApplicationDetails(applicationId) {
  return fetchJson(
    `/applications/${encodeURIComponent(applicationId)}/summary?type=fuel`
  )
}

/**
 * Marks a fuel application as in progress once a reviewer starts working on it.
 * This follows the same backend contract as the appliance review flow.
 */
export async function startFuelApplicationReview(applicationId, reviewedBy) {
  return patchJson(
    `/applications/${encodeURIComponent(applicationId)}/in-progress`,
    { reviewedBy }
  )
}
