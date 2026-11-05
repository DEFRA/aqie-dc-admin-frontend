import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

const CHECK = 'fuelDetails'

export async function getFuelDetails(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function markFuelDetailsCompleted(fuelId) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true
    }
  )
}
