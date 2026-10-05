import { patchJson, fetchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export async function getApplianceForApplianceType(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function saveApplianceType(applianceId, applianceType) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    applianceType
  })
}

/**
 * Get appliance types, optionally filtered by isPrimary flag
 * @param {boolean} isPrimary - If true, returns primary types only; if false, returns other appliance types
 * @returns {Promise<Array>}
 */
export async function getApplianceTypes(isPrimary = true) {
  const query = new URLSearchParams()
  query.append('isPrimary', isPrimary.toString())
  return fetchJson(`/appliance-types?${query.toString()}`)
}
