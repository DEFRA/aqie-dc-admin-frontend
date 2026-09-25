import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'applianceDetails'

export async function getApplianceForCheckDetails(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function markApplianceDetailsCompleted(applianceId) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true
    }
  )
}
