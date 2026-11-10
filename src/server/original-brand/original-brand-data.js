/**
 * Data access for the original-brand journey.
 *
 * The GET flow loads the current fuel using the shared technical review
 * helper. The POST flow persists a partial originalFuel update containing only
 * the name field; the backend merges it with any existing values for the same
 * nested object.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForOriginalBrand(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveOriginalBrand(fuelId, originalName) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    originalFuel: {
      name: originalName
    }
  })
}
