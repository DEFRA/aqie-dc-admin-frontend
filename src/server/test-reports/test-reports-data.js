import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'testReports'

/**
 * Fetches the appliance data needed for the test-reports review screen.
 *
 * @param {string} applianceId Appliance identifier.
 * @returns {Promise<object>} Appliance technical-review data.
 */
export async function getAppliance(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

/**
 * Saves the test-report values and their review result as a completed
 * technical-review check.
 *
 * @param {string} applianceId Appliance identifier.
 * @param {boolean} result Whether the test-reports check passed or failed.
 * @param {object} testReport Test-report values entered by the reviewer.
 * @returns {Promise<object>} Updated technical-review check.
 */
export async function saveTestReport(applianceId, result, testReport) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result,
      testReport
    }
  )
}
