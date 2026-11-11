import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelAppearance(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveFuelAppearance(fuelId, appearance) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    fuelDescription: { appearance }
  })
}
