import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetches the technical review checks and status for one appliance.
 */
export async function getApplianceReview(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

/**
 * Records the reviewer decision.
 * `status` is 'accepted', 'rejected', or 'in_review' to mark it as started.
 */
export async function saveApplianceReview(applianceId, status, reviewedBy) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`,
    reviewedBy ? { status, reviewedBy } : { status }
  )
}
