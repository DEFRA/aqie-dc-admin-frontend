import { fetchJson } from '../common/api/api.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Fetches application with appliances grouped by technical review status.
 * @param {string} applicationId - The application ID
 * @returns {Promise<object>} Application data including appliances (grouped by status)
 */
export async function getApplicationWithTechStatus(applicationId) {
  const data = await fetchJson(
    `/applications/${encodeURIComponent(applicationId)}?include=groupedByTechReviewStatus`
  )
  return data
}
