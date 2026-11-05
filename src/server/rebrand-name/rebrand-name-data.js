/**
 * Data access for the rebrand-name journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the user-entered rebranded name by patching the fuel
 * record with a { brandName: ... } payload.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForRebrandName(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveRebrandName(fuelId, rebrandName) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    brandName: rebrandName
  })
}
