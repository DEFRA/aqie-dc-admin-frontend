/**
 * Data access for the original-manufacturer journey.
 *
 * The GET flow loads the current fuel state using the shared technical review
 * helper. The POST flow persists the original manufacturer on the fuel record
 * in the structure expected by the backend contract.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForOriginalManufacturer(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the original fuel manufacturer.
 *
 * Backend contract: PATCH /fuels/{fuelId}
 *   - Uses MongoDB $set to merge payload (toDotted flattening)
 *   - { originalFuel: { manufacturer } } → { 'originalFuel.manufacturer' }
 *   - Sibling fields (name, isChangedOrMixed, etc.) are preserved
 *   - Partial originalFuel objects are allowed (all fields optional)
 *
 * @param {string} fuelId - Fuel ID
 * @param {string} manufacturer - Original fuel manufacturer name
 * @returns {Promise}
 */
export async function saveOriginalManufacturer(fuelId, manufacturer) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    originalFuel: {
      manufacturer
    }
  })
}
