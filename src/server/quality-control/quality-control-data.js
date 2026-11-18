import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getQualityControl(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveQualityControl(fuelId, hasQualityControl) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    hasQualityControlSystem: hasQualityControl
  })
}
