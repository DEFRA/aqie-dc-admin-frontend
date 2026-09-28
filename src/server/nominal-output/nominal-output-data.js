import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

export function getApplianceForNominalOutput(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export function saveNominalOutput(applianceId, nominalOutput) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    nominalOutput
  })
}
