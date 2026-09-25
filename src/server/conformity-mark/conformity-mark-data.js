import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'conformityMark'

/**
 * Fetches the appliance data needed for the conformity-mark review screen.
 */
export async function getAppliance(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

/**
 * Saves the pass/fail result for the conformity-mark check.
 */
export async function saveConformityMarkResult(applianceId, result) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    { check: CHECK, result }
  )
}
