import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'instructionManual'

/**
 * Fetches the appliance data needed for the instruction-manual screen.
 *
 * @param {string} applianceId - Appliance identifier.
 * @returns {Promise<object>} API response.
 */
export async function getAppliance(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

/**
 * Saves the instruction-manual review result.
 *
 * @param {string} applianceId - Appliance identifier.
 * @param {boolean} result - True for passed and false for failed.
 * @param {object} instructionManual - Instruction-manual values.
 * @returns {Promise<object>} API response.
 */
export async function saveInstructionManual(
  applianceId,
  result,
  instructionManual
) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result,
      data: {
        instructionManual
      }
    }
  )
}
