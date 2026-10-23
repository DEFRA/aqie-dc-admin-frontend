import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the full application payload for a fuel review.
 * The backend owns the response shape; the frontend should drill down to
 * `response.data` in the controller, matching the appliance review pattern.
 */
export async function getFuelApplicationDetails(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}`)
}
