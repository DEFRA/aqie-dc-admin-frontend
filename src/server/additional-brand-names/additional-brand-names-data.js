/**
 * Data access for the additional brand names journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the additional brand names value by patching the fuel
 * record with the comma-separated additionalBrandNames field. The backend
 * derives the hasAdditionalBrandNames boolean from whether the value is populated.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForAdditionalBrandNames(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveAdditionalBrandNames(fuelId, additionalBrandNames) {
  const trimmedValue = additionalBrandNames?.trim() ?? null
  const payloadValue = trimmedValue === '' ? null : trimmedValue

  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    additionalBrandNames: payloadValue
  })
}
