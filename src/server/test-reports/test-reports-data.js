import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'

const CHECK = 'testReports'

/**
 * Retrieves appliance data including test-report values.
 * Uses the technical-review endpoint to load the full review context.
 *
 * @param {string} applianceId Appliance identifier.
 * @returns {Promise<object>} Appliance data including testResults and technical review status.
 */
export const getTestReport = (applianceId) => {
  return getApplianceTechnicalReview(applianceId)
}

/**
 * Records the test report review status and saves measurement values.
 * Uses a single atomic backend operation that updates both the testResults data
 * and marks the testReports check as complete in the technical review workflow.
 *
 * @param {string} applianceId Appliance identifier.
 * @param {boolean} result Review result: true (passed) or false (failed).
 * @param {object} testResults Object with ratedOutput, testedOutput, smokeEmissionOutput.
 * @returns {Promise<object>} Updated appliance data.
 */
export const updateTestReport = (applianceId, result, testResults) => {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result,
      data: {
        testResults
      }
    }
  )
}
