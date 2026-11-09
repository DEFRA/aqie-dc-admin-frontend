/**
 * Data access for the additional rebrand names journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the additional rebrand names value by patching the fuel
 * record with the comma-separated additionalBrandNames field. The backend
 * derives the hasAdditionalBrandNames boolean from whether the value is populated.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForAdditionalRebrandNames(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveAdditionalRebrandNames(fuelId, additionalBrandNames) {
  const payload = {}
  const trimmedValue =
    typeof additionalBrandNames === 'string'
      ? additionalBrandNames.trim()
      : additionalBrandNames

  payload.additionalBrandNames = trimmedValue || null

  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, payload)
}
