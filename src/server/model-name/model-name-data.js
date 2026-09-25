import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export async function getApplianceForModelName(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function saveModelName(applianceId, modelName) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    modelName
  })
}
