import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelDescription(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

const CHECK = 'fuelDescription'

export async function markFuelDescriptionComplete(fuelId) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    { check: CHECK, result: true }
  )
}
