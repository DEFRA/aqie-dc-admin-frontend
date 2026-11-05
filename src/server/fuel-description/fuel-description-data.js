import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelDescription(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveFuelDescriptionCheck(fuelId, data) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    { check: 'fuelDescription', result: true, data }
  )
}
