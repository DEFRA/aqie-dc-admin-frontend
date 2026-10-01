import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export function getApplianceForMultifuel(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export function saveMultifuelAppliance(applianceId, multifuelAppliance) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    multifuelAppliance
  })
}
