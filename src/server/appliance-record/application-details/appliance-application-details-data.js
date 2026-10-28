import { fetchJson } from '../../common/api/api.js'

/**
 * /applications/{id} only returns submittedAt
 * and linkedItems.
 * /appliances/{ID} returns Company name, company address, and main contact
 * details
 */
export async function getApplicationDetails(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}`)
}
export async function getApplianceDetail(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}
