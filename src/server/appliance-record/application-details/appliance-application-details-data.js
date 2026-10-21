import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches the full application record by ID.
 * Used to retrieve company details, contact info, submittedAt,
 * and the list of appliances belonging to the application.
 */
export async function getApplicationDetails(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}`)
}
