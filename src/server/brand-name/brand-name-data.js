/**
 * Data access for the brand-name journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the user-entered brand name by patching the fuel
 * record with a { brandName: ... } payload directly to the fuel resource.
 *
 * This uses the same database field as rebrand-name but is for Manufacturer supplierType.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

/**
 * Fetches the fuel record needed for the brand-name screen.
 * Uses the shared technical-review helper to ensure consistency with other
 * review checks and to populate the full fuel context.
 *
 * @param {string} fuelId - The fuel identifier
 * @returns {Promise} Fuel data with technical review status
 */
export async function getFuelForBrandName(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the brand name to the fuel record.
 * This is a direct field update on the fuel resource, not a technical-review check result.
 * Updates the same brandName field as rebrand-name, but for Manufacturer supplierType.
 *
 * @param {string} fuelId - The fuel identifier
 * @param {string} brandName - The new brand name (pre-trimmed)
 * @returns {Promise} Patch response from backend
 */
export async function saveBrandName(fuelId, brandName) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    brandName
  })
}
