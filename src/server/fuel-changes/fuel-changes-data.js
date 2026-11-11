/**
 * Data access for the fuel-changes journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the originalFuel changes flag and detail by patching the
 * fuel record with the nested originalFuel payload expected by the backend.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForFuelChanges(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveFuelChanges(fuelId, isChangedOrMixed, changes) {
  const trimmedValue = changes?.trim() ?? null
  const payloadValue = trimmedValue === '' ? null : trimmedValue

  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    originalFuel: {
      isChangedOrMixed,
      changes: isChangedOrMixed ? payloadValue : null
    }
  })
}
