import { fetchJson } from '../common/api/api.js'

/**
 * Fetches one application by ID with the associated appliances summary (name and technical approval status).
 */

export async function getApplianceApplications(applicationId) {
  return fetchJson(`/applications/${applicationId}/summary?type=appliance`)
}
