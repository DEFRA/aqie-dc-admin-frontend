/**
 * Data access for the original-manufacturer journey.
 *
 * The GET flow loads the current fuel state using the shared technical review
 * helper. The POST flow persists the original manufacturer on the fuel record
 * in the structure expected by the backend contract, which nests the value under
 * originalFuel while preserving the sibling required fields already on the fuel.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForOriginalManufacturer(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveOriginalManufacturer(fuelId, manufacturer) {
  const { data: fuel } = await getFuelTechnicalReview(fuelId)
  const originalFuel = fuel.originalFuel || {}

  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    originalFuel: {
      ...originalFuel,
      manufacturer
    }
  })
}
