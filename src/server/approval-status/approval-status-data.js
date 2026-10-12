import { patchJson, fetchJson } from '../common/api/api.js'

/**
 * Get appliance details for the approval status page
 * @param {string} applianceId - The appliance ID
 * @returns {Promise<Object>} Appliance details
 */
export async function getApplianceForApprovalStatus(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}

/**
 * Update certification status for a country
 * @param {string} applianceId - The appliance ID
 * @param {string} country - Country code (england, scotland, wales, northern-ireland)
 * @param {string} status - New certification status (certified, uncertified)
 * @param {Object} decidedBy - User who decided {name, email}
 * @returns {Promise<Object>} Updated appliance
 */
export async function updateCertificationStatus(applianceId, country, status, decidedBy) {
  // Map country to certification field
  const certificationFieldMap = {
    england: 'englandCertification',
    scotland: 'scotlandCertification',
    wales: 'walesCertification',
    'northern-ireland': 'nIrelandCertification'
  }
  
  const certificationField = certificationFieldMap[country]

  const payload = {
    [certificationField]: {
      status,
      decidedAt: new Date().toISOString(),
      decidedBy
    }
  }

  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, payload)
}
