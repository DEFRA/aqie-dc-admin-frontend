import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelComposition(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

// Backend contract: PATCH accepts individual fuelDescription fields,
// so only the field being edited is sent.
export async function saveFuelComposition(fuelId, composition) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    fuelDescription: { composition }
  })
}
