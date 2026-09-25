import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export async function getApplianceForModelNumber(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function saveModelNumber(applianceId, modelNumber) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    modelNumber
  })
}
