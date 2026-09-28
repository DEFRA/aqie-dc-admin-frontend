import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'technicalDrawings'

/**
 * Fetches the appliance so the heading can name it.
 */
export async function getAppliance(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

/**
 * Records whether the technical drawings passed.
 */
export async function saveTechnicalDrawings(applianceId, result) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    { check: CHECK, result }
  )
}
