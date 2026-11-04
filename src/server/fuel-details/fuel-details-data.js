import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelDetails(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveFuelDetailsCheck(fuelId, check, data) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    { check, result: true, data }
  )
}
