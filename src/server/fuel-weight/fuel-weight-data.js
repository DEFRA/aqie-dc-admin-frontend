import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelWeight(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

// Backend contract: PATCH must accept a partial fuelDescription.
export async function saveFuelWeight(fuelId, weight) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    fuelDescription: { weight }
  })
}
