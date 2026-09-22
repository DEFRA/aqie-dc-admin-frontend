import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/commonService.js'

const CHECK = 'permittedFuels'

export async function getApplianceForPermittedFuels(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function savePermittedFuels(applianceId, permittedFuels, wood) {
  // Single backend operation through the existing checks route.
  // For this check, backend validates and applies both appliance fields and
  // technical-review status/check updates atomically in one update call.
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true,
      data: {
        permittedFuels,
        isPermittedToBurnWood: wood
      }
    }
  )
}
