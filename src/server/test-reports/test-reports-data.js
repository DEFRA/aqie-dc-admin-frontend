import { fetchJson, patchJson } from '../common/api/api.js'

const createTestReportsPath = (applianceId) =>
  `/appliances/${encodeURIComponent(applianceId)}/test-reports`

/**
 * Retrieves test-report values for an appliance.
 *
 * @param {string} applianceId Appliance identifier.
 * @returns {Promise<object>} Test-report data.
 */
export const getTestReport = (applianceId) => {
  return fetchJson(createTestReportsPath(applianceId))
}

/**
 * Updates test-report values and their review status.
 *
 * @param {string} applianceId Appliance identifier.
 * @param {object} testReport Backend-compatible test-report payload.
 * @returns {Promise<object>} Updated test-report data.
 */
export const updateTestReport = (applianceId, testReport) => {
  return patchJson(createTestReportsPath(applianceId), testReport)
}
