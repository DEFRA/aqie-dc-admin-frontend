/**
 * Data access for the rebrand-name journey.
 *
 * The GET flow loads the current fuel using the shared technical-review helper.
 * The POST flow persists the user-entered rebranded name by patching the fuel
 * record with a { brandName: ... } payload directly to the fuel resource.
 * This differs from technical-review checks which use /technical-review/checks endpoint.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

/**
 * Fetches the fuel record needed for the rebrand-name screen.
 * Uses the shared technical-review helper to ensure consistency with other
 * review checks and to populate the full fuel context.
 *
 * @param {string} fuelId - The fuel identifier
 * @returns {Promise} Fuel data with technical review status
 */
export async function getFuelForRebrandName(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the rebranded name to the fuel record.
 * This is a direct field update on the fuel resource, not a technical-review check result.
 *
 * @param {string} fuelId - The fuel identifier
 * @param {string} rebrandName - The new rebranded name (pre-trimmed)
 * @returns {Promise} Patch response from backend
 */
export async function saveRebrandName(fuelId, rebrandName) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    brandName: rebrandName
  })
}
