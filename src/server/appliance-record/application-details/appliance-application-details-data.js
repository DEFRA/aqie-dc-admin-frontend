import { fetchJson } from '../../common/api/api.js'

/**
 * Backend note: /applications/{id} only returns submittedAt
 * and linkedItems. Company name, company address, and main contact
 * details live on the Appliance record, not the Application record.
 * Must fetch the appliance separately via getApplianceTechnicalReview and pass both to the rows builders.
 */
export async function getApplicationDetails(applicationId) {
  return fetchJson(`/applications/${encodeURIComponent(applicationId)}`)
}
