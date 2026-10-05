import { patchJson, fetchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export async function getApplianceForOtherType(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function saveOtherApplianceType(applianceId, otherApplianceType) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    otherApplianceType
  })
}

/**
 * Get secondary appliance types (isPrimary: false)
 * @returns {Promise<Array>}
 */
export async function getSecondaryApplianceTypes() {
  const query = new URLSearchParams()
  query.append('isPrimary', 'false')
  return fetchJson(`/appliance-types?${query.toString()}`)
}
