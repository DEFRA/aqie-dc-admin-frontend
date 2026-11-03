import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

const CHECK = 'manufacturerLetter'

/**
 * Fetches the fuel technical review data needed for the manufacturer-letter review screen.
 */
export async function getFuel(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

/**
 * Saves the pass/fail result for the manufacturer-letter check.
 */
export async function saveManufacturerLetterResult(fuelId, result) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    { check: CHECK, result }
  )
}
