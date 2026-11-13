/**
 * Data access for the brand-name journey.
 *
 * Handles both:
 * - "Manufacturer" supplierType via GET/POST /review-fuel/{fuelId}/brand-name
 * - "Rebrand" supplierType via GET/POST /review-fuel/{fuelId}/rebrand-name
 *
 * Both update the same `brandName` database field.
 */
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

/**
 * Fetches the fuel record needed for the brand-name screen.
 *
 * @param {string} fuelId - The fuel identifier
 * @returns {Promise} Fuel data with technical review status
 */
export async function getFuel(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the brand/rebranded name to the fuel record.
 * Updates the brandName field for both Manufacturer and Rebrand supplierTypes.
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
