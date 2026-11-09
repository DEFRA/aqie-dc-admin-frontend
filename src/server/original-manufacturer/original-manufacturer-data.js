/**
 * Data access for the original-manufacturer journey.
 *
 * The GET flow loads the current fuel state using the shared technical review
 * helper. The POST flow persists a partial originalFuel update containing only
 * the manufacturer field; the backend supports partial updates via PATCH and
 * merges changes with existing data via MongoDB $set.
 *
 * Note: This route only reads/writes the manufacturer field, so partial updates
 * that leave name/isChangedOrMixed unset pose no issue here.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getFuelForOriginalManufacturer(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the original fuel manufacturer via partial update.
 *
 * Backend contract: PATCH /fuels/{fuelId}
 *   - Accepts partial originalFuel payloads
 *   - MongoDB $set merges only the provided fields
 *   - Sibling fields (name, isChangedOrMixed) are preserved if already set
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
