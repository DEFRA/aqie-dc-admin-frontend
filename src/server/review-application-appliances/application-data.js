import { fetchJson } from '../common/api/api.js'

/**
 * Fetches one application by ID with the associated appliances summary (name and technical approval status).
 */

export async function getApplianceApplication(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}/summary?type=appliance`)
}
