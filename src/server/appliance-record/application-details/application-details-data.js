import { fetchJson } from '../../common/api/api.js'

/**
 * fetches full application record by ID and array of all appliances or fuels
 * (linkedItems) associated with the application.
 * Company name, company address, and main contact details live on the
 * Appliance record, not the Application record.
 */
export async function getApplicationDetails(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}`)
}
export async function getApplianceDetail(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}
